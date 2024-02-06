import { render, screen, waitFor } from "@/test/helper"
import Login from "./Login.vue"
import { SetupServer, setupServer } from "msw/node"
import { delay, http, HttpResponse } from 'msw'
import { i18n } from "@/locale"
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"

let requestBody,
    counter = 0
const server = setupServer(
    http.post('/api/v1/auth', async ({ request }) => {
        requestBody = await request.json()
        counter += 1
        return HttpResponse.json({
            id: 1,
            username: 'user1',
            email: 'user1@gmail.com',
            image: null
        })
    })
)
beforeEach(() => {
    counter = 0
    server.resetHandlers()
})
beforeAll(() =>
    server.listen())
afterAll(() => server.listen())

const setup = async () => {
    const { user, result } = render(Login)
    const emailInput = screen.getByLabelText('E-Mail')
    const passwordInput = screen.getByLabelText('Password')
    await user.type(emailInput, 'user1@gmail.com')
    await user.type(passwordInput, 'P4ssword')
    const button = screen.getByRole('button', { name: 'Login' });
    return {
        ...result,
        user,
        elements: {
            button,
            emailInput,
            passwordInput,
        }
    }
}
describe('Login Page', () => {
    it('has header', () => {
        render(Login)
        const header = screen.getByRole('heading', { name: 'Login' })
        expect(header).toBeInTheDocument()
    })
    it('has email input', () => {
        render(Login)
        expect(screen.queryByLabelText('E-Mail')).toBeInTheDocument()
    })
    it('has password input', () => {
        render(Login)
        expect(screen.queryByLabelText('Password')).toBeInTheDocument()
    })
    it('has password type for password input', () => {
        render(Login)
        expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    })
    it('has Login button', () => {
        render(Login)
        const button = screen.getByRole('button', { name: 'Login' })
        expect(button).toBeInTheDocument()
    })
    it('disabled the button initially', () => {
        render(Login)
        expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled()
    })
    it('does not display spinner', () => {
        render(Login);
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    })
    describe('when user sets same value for inputs', () => {
        it('enables the button', async () => {
            const { elements: { button } } = await setup()
            expect(button).toBeEnabled()
        })
        describe('when user submits from', () => {
            it('sends email,password to the backend', async () => {
                const { user, elements: { button } } = await setup();
                await user.click(button)
                await waitFor(() => {
                    expect(requestBody).toEqual({
                        email: 'user1@gmail.com',
                        password: 'P4ssword'
                    })
                })
            })
            it('does not allow clicking to button when there is an ongoing api call', async () => {
                let counter = 0;
                server.use(
                    http.post('/api/v1/auth', async () => {
                        counter += 1;
                        await delay('infinite')
                        return HttpResponse.json({
                            id: 1,
                            username: 'user1',
                            email: 'user1@gmail.com',
                            image: null
                        })
                    })
                )
                const { user, elements: { button } } = await setup();
                await user.click(button)
                // await user.click(button)
                await waitFor(() => {
                    expect(counter).toBe(1);
                })
            })
            it('displays spinner', async () => {
                server.use(
                    http.post('/api/v1/auth', async () => {
                        await delay('infinite')
                        return HttpResponse.json({
                            id: 1,
                            username: 'user1',
                            email: 'user1@gmail.com',
                            image: null
                        })
                    })
                )
                const { user, elements: { button } } = await setup();
                await user.click(button)
                expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
            })
            describe.each([{ language: 'tr' }, { language: 'en' }])('when user select $language',
                ({ language }) => {
                    it(`it sends expected language`, async () => {
                        let acceptLanguage
                        server.use(
                            http.post('/api/v1/auth', async ({ request }) => {
                                acceptLanguage = request.headers.get('Accept-Language')
                                return HttpResponse.json({})
                            })
                        )
                        const { user, elements: { button } } = await setup()
                        i18n.global.locale = language
                        await user.click(button)
                        await waitFor(() => {
                            expect(acceptLanguage).toBe(language);
                        })
                    })
                })
            describe('when network failure occurs', () => {
                it('displays generic message', async () => {
                    server.use(
                        http.post('/api/v1/auth', () => {
                            return HttpResponse.error()
                        })
                    )
                    const { user, elements: { button } } = await setup()
                    await user.click(button);
                    const text = await screen.findByText('Unexpected error occurred,please try again');
                    expect(text).toBeInTheDocument()
                })
                it('hides spinner', async () => {
                    server.use(
                        http.post('/api/v1/auth', () => {
                            return HttpResponse.error()
                        })
                    )
                    const { user, elements: { button } } = await setup()
                    await user.click(button);
                    await waitFor(() => {
                        expect(screen.queryByRole('status')).not.toBeInTheDocument();
                    })
                })
                describe('when user submits again', () => {
                    it('hides error when api request is progress', async () => {
                        let processedFirstRequest = false
                        server.use(
                            http.post('/api/v1/auth', () => {
                                if (!processedFirstRequest) {
                                    processedFirstRequest = true
                                    return HttpResponse.error()
                                } else {
                                    return HttpResponse.json({
                                        id: 1,
                                        username: 'email',
                                        email: 'user1@gmail.com',
                                        image: null
                                    })
                                }
                            })
                        )
                        const { user, elements: { button } } = await setup();
                        await user.click(button)
                        const text = await screen.findByText('Unexpected error occurred,please try again');
                        await user.click(button)
                        await waitFor(() => {
                            expect(text).not.toBeInTheDocument();
                        })
                    })
                })
            })
        })
        describe.each([
            { field: 'email', error: 'E-mail cannot be null' },
            { field: 'password', error: 'Password cannot be null' }
        ])('when $field is invalid', ({ field, error }) => {
            it(`displays ${error}`, async () => {
                server.use(
                    http.post('/api/v1/auth', () => {
                        return HttpResponse.json({
                            validationErrors: {
                                [field]: error
                            }
                        }, { status: 400 })
                    })
                )
                const { user, elements: { button } } = await setup();
                await user.click(button)
                const error1 = await screen.findByText(error)
                expect(error1).toBeInTheDocument()
            })
            // it(`clears error after user updates ${field}`, async () => {
            //     server.use(
            //         http.post('/api/v1/users', () => {
            //             return HttpResponse.json({
            //                 validationErrors: {
            //                     [field]: error
            //                 }
            //             }, { status: 400 })
            //         })
            //     )
            //     const { user, elements } = await setup();
            //     await user.click(elements.button)
            //     const error1 = await screen.findByText(error)
            //     await user.type(elements[`${field}Input`], 'updated')
            //     expect(error1).not.toBeInTheDocument()
            // })
        })
        // describe('when there is no validation error', () => {
        //     it('displays error returned from server', async () => {
        //         server.use(
        //             http.post('/api/v1/auth', () => {
        //                 return HttpResponse.json(
        //                     {
        //                         message: 'Incorrect credentials'
        //                     },
        //                     { status: 401 }
        //                 )
        //             })
        //         )
        //         const { user, elements: { button } } = await setup()
        //         await user.click(button)
        //         const error = await screen.findByText('Incorrect credentials')
        //         expect(error).toBeInTheDocument()
        //     })
        // })
    })
})