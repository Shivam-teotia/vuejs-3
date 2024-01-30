vi.mock('axios')
import 'whatwg-fetch'
import { render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it } from 'vitest'
import SignUp from './SignUp.vue'
import axios from 'axios';
import userEvent from '@testing-library/user-event'

const setup = async () => {
    const user = userEvent.setup()
    const result = render(SignUp)
    const usernameInput = screen.getByLabelText('Username')
    const emailInput = screen.getByLabelText('E-Mail')
    const passwordInput = screen.getByLabelText('Password')
    const passwordRepeatInput = screen.getByLabelText('Password Repeat')
    await user.type(usernameInput, 'user1')
    await user.type(emailInput, 'user1@gmail.com')
    await user.type(passwordInput, 'P4ssword')
    await user.type(passwordRepeatInput, 'P4ssword')
    const button = screen.getByRole('button', { name: 'Sign Up' });
    return {
        ...result,
        user,
        elements: {
            button
        }
    }
}
beforeEach(() => {
    vi.clearAllMocks()
})

describe('Sign Up', () => {
    describe('when user sets same value for password inputs', () => {
        describe('when user submits form', () => {
            it('sends username,email,password to the backend', async () => {
                axios.post.mockResolvedValue({ data: {} })
                const { user, elements: { button } } = await setup();
                await user.click(button)
                expect(axios.post).toHaveBeenCalledWith('/api/v1/users', {
                    username: 'user1',
                    email: 'user1@gmail.com',
                    password: 'P4ssword'
                })
            })
            describe('when there is an ongoing api call', () => {
                it('does not allow clicking the button', async () => {
                    axios.post.mockImplementation(
                        () => new Promise((resolve) => setTimeout(() => resolve({ data: {} }, 1000)))
                    )
                    const { user, elements: { button } } = await setup();
                    await user.click(button)
                    expect(axios.post).toHaveBeenCalledTimes(1)
                })
                it('displays spinner', async () => {
                    axios.post.mockImplementation(
                        () => new Promise((resolve) => setTimeout(() => resolve({ data: {} }, 1000)))
                    )
                    const { user, elements: { button } } = await setup();
                    await user.click(button)
                    expect(screen.getByRole('status')).toBeInTheDocument();
                })

            })
        })
    })
})