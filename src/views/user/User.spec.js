import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { setupServer } from "msw/node"
import { screen } from '@testing-library/vue';
import { HttpResponse, delay, http } from 'msw'
import User from "./User.vue"
import { render, waitFor, router } from '@/test/helper';
import { i18n } from '@/locale';

let counter = 0;
let id;
const server = setupServer(
    http.get('/api/v1/users/:id', ({ params }) => {
        counter += 1;
        id = params.id
        return HttpResponse.json({ id: 1, username: 'user1', email: 'user1@gmail.com', image: null })
    })
)
beforeAll(() => server.listen());
beforeEach(() => {
    counter = 0;
    id = undefined
    server.resetHandlers()
})
afterAll(() => server.close());
const setup = async (path) => {
    router.push(path)
    await router.isReady()
    return render(User)
}

describe('User Page', () => {
    it('sends activation request to server', async () => {
        await setup('/')
        await waitFor(() => {
            expect(counter).toBe(1)
        })
    })
    describe.each([{ userId: '123' }, { userId: '345' }])('when id is $userId', ({ userId }) => {
        it('sends token in request', async () => {
            await setup(`/user/${userId}`)
            await waitFor(() => {
                expect(id).toBe(userId)
            })
        })
    })
    describe('when id is changed', () => {
        it('sends request with new id', async () => {
            await setup('/user/123')
            await waitFor(() => {
                expect(id).toBe('123')
            })
            router.push('/user/456')
            await waitFor(() => {
                expect(id).toBe('456')
            })
        })
    })
    describe('when newtwork error occurs', () => {
        it('displays generic error message', async () => {
            server.use(
                http.get('/api/v1/users/:id', () => {
                    return HttpResponse.error()
                })
            )
            await setup('/user/1')
            const text = await screen.findByText('Unexpected error occurred,please try again')
            expect(text).toBeInTheDocument()
        })
    })
    describe('when user not found', () => {
        it(`displasy error message received in response`, async () => {
            let resolveFunc
            const promise = new Promise((resolve) => {
                resolveFunc = resolve
            })
            server.use(
                http.get('/api/v1/users/:id', async ({ }) => {
                    await promise
                    return HttpResponse.json({ message: 'User not found' }, { status: 400 })
                })
            )
            await setup('/user/1')
            expect(screen.queryByText('User not found')).not.toBeInTheDocument()
            await resolveFunc()
            await waitFor(() => {
                expect(screen.queryByText('User not found')).toBeInTheDocument()
            })
        })
    })
    describe('when id is found', () => {
        it(`displays success message received in response`, async () => {
            let resolveFunc
            const promise = new Promise((resolve) => {
                resolveFunc = resolve
            })
            server.use(
                http.get('/api/v1/users/:id', async () => {
                    await promise
                    return HttpResponse.json({
                        id: 1,
                        username: 'user1',
                        email: 'user1@gmail.com',
                        image: null
                    })
                })
            )
            await setup('/user/1')
            expect(screen.queryByText('user1')).not.toBeInTheDocument()
            await resolveFunc()
            await waitFor(() => {
                expect(screen.queryByText('user1')).toBeInTheDocument();
            })
        })
    })
    it('displays spinner', async () => {
        let resolveFunc
        const promise = new Promise((resolve) => {
            resolveFunc = resolve
        })
        server.use(
            http.get('/api/v1/users/:id', async ({ }) => {
                await promise
                return HttpResponse.json({
                    id: 1,
                    username: 'user1',
                    email: 'user1@gmail.com',
                    image: null
                })
            })
        )
        await setup('/user/123')
        const spinner = await screen.findByRole('status')
        expect(spinner).toBeInTheDocument()
        await resolveFunc()
        await waitFor(() => {
            expect(spinner).not.toBeInTheDocument()
        })
    })
    describe.each([
        { language: 'en' },
        { language: 'tr' }
    ])('when langauge is $language', ({ language }) => {
        it(`it sends expected language in accept language header`, async () => {
            i18n.global.locale = language
            let acceptLanguage
            server.use(
                http.get('/api/v1/users/:id', async ({ request }) => {
                    acceptLanguage = request.headers.get('Accept-Language')
                    await delay('infinite')
                    return HttpResponse.json({})
                })
            )
            await setup('/user/1')
            await waitFor(() => expect(acceptLanguage).toBe(language))
        })
    })
})