import { render, screen, waitFor } from '@/test/helper'
import Request from "./Request.vue"
import { setupServer } from 'msw/node'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { HttpResponse, delay, http } from 'msw'
import { i18n } from '@/locale'
import userEvent from '@testing-library/user-event'

const server = setupServer()
beforeEach(() => server.resetHandlers())
beforeAll(() => server.listen())
afterAll(() => server.close())

const setup = async () => {
    const { result, user } = render(Request)
    const emailInput = screen.getByLabelText('E-Mail')
    await user.type(emailInput, 'user@gmail.com')
    const button = screen.queryByRole('button', { name: 'Reset password' })
    return {
        ...result,
        user,
        elements: {
            button,
            emailInput
        }
    }
}
describe('Password Reset Request Page', () => {
    it('disables the button initially', () => {
        render(Request)
        expect(screen.queryByRole('button', { name: 'Reset password' })).toBeDisabled
    })
    it('does not display spinner', async () => {
        render(Request)
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
    describe('when user sets email', () => {
        it('enables the button', async () => {
            const { elements: { button } } = await setup()
            expect(button).toBeEnabled()
        })
        describe('when user submits form', () => {
            it('sends email to backend', async () => {
                let requestBody
                server.use(
                    http.post('/api/v1/users/password-reset', async ({ request }) => {
                        requestBody = await request.json({})
                        return HttpResponse.json({ message: 'Check your email' })
                    })
                )
                const { user, elements: { button } } = await setup()
                await user.click(button)
                await waitFor(() => {
                    expect(requestBody).toEqual({
                        email: 'user@gmail.com'
                    })
                })
            })
            describe('when there is an ongoing api request', () => {
                it('does not allow clicking to the button', async () => {
                    let counter = 0;
                    server.use(
                        http.post('/api/v1/users/password-reset', async ({ request }) => {
                            counter += 1
                            await delay('infinite')
                            return HttpResponse.json({ message: 'Check your email' })
                        })
                    )
                    const { user, elements: { button } } = await setup()
                    await user.click(button)
                    // await user.click(button)
                    await waitFor(() => {
                        expect(counter).toBe(1)
                    })
                })
                it('displays spinner', async () => {
                    server.use(
                        http.post('/api/v1/users/password-reset', async () => {
                            await delay('infinite')
                            return HttpResponse.json({ message: 'Check your email' })
                        })
                    )
                    const { user, elements: { button } } = await setup()
                    await user.click(button)
                    await waitFor(() => {
                        expect(screen.getByRole('status')).toBeInTheDocument()
                    })
                })
            })
            describe.each([{ language: 'tr' }, { language: 'en' }])(
                'when language is $language',
                ({ language }) => {
                    it(`it sends request with language ${language} in header`, async () => {
                        let requestLang
                        server.use(
                            http.post('/api/v1/users/password-reset', ({ request }) => {
                                requestLang = request.headers.get('Accept-Language')
                                return HttpResponse.json({})
                            })
                        )
                        render(Request)
                        i18n.global.locale = language
                        const email = screen.getByLabelText('E-Mail')
                        const button = screen.getByRole('button')
                        const user = userEvent.setup()
                        await user.type(email, 'abc@def.com')
                        await user.click(button)
                        await waitFor(() => {
                            expect(requestLang).toBe(language)
                        })
                    })
                }
            )
            describe('when request is successful', () => {
                it('display the message returned from backend', async () => {
                    server.use(
                        http.post('/api/v1/users/password-reset', () => {
                            return HttpResponse.json({
                                message: 'Check your email'
                            })
                        })
                    )

                    const { user, elements: { button } } = await setup()
                    await user.click(button)
                    const text = await screen.findByText('Check your email')
                    expect(text).toBeInTheDocument()
                })
            })
            describe('when request fails with network error', () => {
                it('displays generic error message', async () => {
                    server.use(
                        http.post('/api/v1/users/password-reset', () => {
                            return HttpResponse.error()
                        })
                    )
                    const { user, elements: { button } } = await setup()
                    await user.click(button)
                    const text = await screen.findByText('Unexpected error occurred,please try again');
                    expect(text).toBeInTheDocument()
                })
                it('hides spinner', async () => {
                    server.use(
                        http.post('/api/v1/users/password-reset', () => {
                            return HttpResponse.error()
                        })
                    )
                    const { user, elements: { button } } = await setup()
                    await user.click(button)
                    expect(screen.queryByRole('status')).not.toBeInTheDocument()
                })
            })
            describe('when user submits again', () => {
                it('hides error when api request in progress', async () => {
                    let processedFirstRequest = false
                    server.use(
                        http.post('/api/v1/users/password-reset', () => {
                            if (!processedFirstRequest) {
                                processedFirstRequest = true
                                return HttpResponse.error()
                            }
                            else {
                                return HttpResponse.json({ message: 'Check your email' })
                            }
                        })
                    )
                    const { user, elements: { button } } = await setup()
                    await user.click(button)
                    await screen.findByText('Unexpected error occurred,please try again')
                    await user.click(button)
                    await waitFor(() => {
                        expect(
                            screen.queryByText('Unexpected error occurred, please try again')
                        ).not.toBeInTheDocument()
                    })
                })
            })
        })
        describe('when email is invalid', () => {
            beforeEach(() => {
                server.use(
                    http.post('/api/v1/users/password-reset', () => {
                        return HttpResponse.json(
                            {
                                validationErrors: {
                                    email: 'E-mail cannot be null'
                                }
                            },
                            { status: 400 }
                        )
                    })
                )
            })
            it('displays validation error', async () => {
                const { user, elements: { button } } = await setup()
                await user.click(button)
                const validationErrors = await screen.findByText('E-mail cannot be null')
                expect(validationErrors).toBeInTheDocument()
            })
            it('clears validation error after email field is updated', async () => {
                const { user, elements: { button, emailInput } } = await setup()
                await user.click(button)
                const validationError = await screen.findByText('E-mail cannot be null')
                await user.type(emailInput, 'Updated')
                expect(validationError).not.toBeInTheDocument()
            })
        })
        describe('when there is no validation error', () => {
            it('displays error returned from server', async () => {
                server.use(
                    http.post('/api/v1/users/password-reset', () => {
                        return HttpResponse.json(
                            {
                                message: 'Unknown user'
                            },
                            { status: 404 }
                        )
                    })
                )
                const { user, elements: { button } } = await setup()
                await user.click(button)
                const error = await screen.findByText('Unknown user')
                expect(error).toBeInTheDocument()
            })
        })
    })
})
