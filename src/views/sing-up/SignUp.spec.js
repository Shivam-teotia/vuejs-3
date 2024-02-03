import 'whatwg-fetch'
import { render, screen, waitFor } from '../../test/helper'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import SignUp from './SignUp.vue'
import { LanguageSelector } from '@/components'
import { setupServer } from "msw/node"
import { HttpResponse, delay, http } from 'msw'
import { i18n } from '@/locale'

let requestBody;
let counter = 0;
const server = setupServer(
  http.post('/api/v1/users', async ({ request }) => {
    requestBody = await request.json()
    counter += 1;
    return HttpResponse.json({ message: 'User create success' })
  })
)
beforeEach(() => {
  counter = 0;
  server.resetHandlers()
})
beforeAll(() => server.listen());
afterAll(() => server.close());

const setup = async () => {
  const { user, result } = render(SignUp)
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
      button,
      usernameInput,
      emailInput,
      passwordInput,
      passwordRepeatInput
    }
  }
}
describe('Sign Up', () => {
  describe.each([
    { language: 'tr', text: 'SSSS Up' },
    { language: 'en', text: 'Sign Up' }
  ])('when user select $language', ({ language, text }) => {
    it(`describe expected text`, async () => {
      // const user = userEvent.setup();
      const TempComponent = {
        components: {
          LanguageSelector
        },
        template: `
                <span>{{$t('signUp')}} </span>
                <LanguageSelector/>
                `
      }
      const { user } = render(TempComponent)
      await user.click(screen.getByTestId(`language-${language}-selector`))
      expect(screen.getByText(text)).toBeInTheDocument();

    })
  })
  it('has Sign Up header', () => {
    render(SignUp)
    const header = screen.getByRole('heading', { name: 'Sign Up' })
    expect(header).toBeInTheDocument()
  })
  it('has username input', () => {
    render(SignUp)
    expect(screen.queryByLabelText('Username')).toBeInTheDocument()
  })
  it('has email input', () => {
    render(SignUp)
    expect(screen.queryByLabelText('E-Mail')).toBeInTheDocument()
  })
  it('has password input', () => {
    render(SignUp)
    expect(screen.queryByLabelText('Password')).toBeInTheDocument()
  })
  it('has password type for password input', () => {
    render(SignUp)
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  })
  it('has password repeat input', () => {
    render(SignUp)
    expect(screen.queryByLabelText('Password Repeat')).toBeInTheDocument()
  })
  it('has password type for password repeat input', () => {
    render(SignUp)
    expect(screen.getByLabelText('Password Repeat')).toHaveAttribute('type', 'password');
  })
  it('has Sign Up button', () => {
    render(SignUp)
    const button = screen.getByRole('button', { name: 'Sign Up' })
    expect(button).toBeInTheDocument()
  })
  it('disabled the button initially', () => {
    render(SignUp)
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeDisabled()
  })
  it('does not display spinner', () => {
    render(SignUp);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  })
  describe('when passwords do not match', () => {
    it('displays occur', async () => {
      const { user, elements: { passwordInput, passwordRepeatInput } } = await setup();
      await user.type(passwordInput, '123');
      await user.type(passwordRepeatInput, '456')
      expect(screen.getByText('Password mismatch')).toBeInTheDocument()
    })
  })
  describe('when user sets same value for password inputs', () => {
    it('enables button', async () => {
      const { elements: { button } } = await setup();
      expect(button).toBeEnabled();
    })
    describe('when user submits from', () => {
      it('sends username,email,password to the backend', async () => {
        const { user, elements: { button } } = await setup();
        await user.click(button)
        await waitFor(() => {
          expect(requestBody).toEqual({
            username: 'user1',
            email: 'user1@gmail.com',
            password: 'P4ssword'
          })
        })

      })
      describe.each([{ language: 'tr' }, { language: 'en' }])('when language is $language', ({ language }) => {
        it('sends expected language in accept language header', async () => {
          let acceptLanguage;
          server.use(
            http.post('/api/v1/users', async ({ request }) => {
              acceptLanguage = request.headers.get('Accept-Language')
              await delay('infinite')
              return HttpResponse.json({})
            })
          )
          const { user, elements: { button } } = await setup()
          i18n.global.locale = language
          await user.click(button);
          await waitFor(() => {
            expect(acceptLanguage).toBe(language)
          })
        })
      })

      describe('when there is an ongoing api call', () => {
        it('does not allow clicking the button', async () => {
          const { user, elements: { button } } = await setup();
          await user.click(button)
          await waitFor(() => {
            expect(counter).toBe(1);
          })
        })
        it('displays spinner', async () => {
          server.use(
            http.post('/api/v1/users', async () => {
              await delay('infinite')
              return HttpResponse.json({})
            })
          )
          const { user, elements: { button } } = await setup();
          await user.click(button)
          expect(screen.getByRole('status')).toBeInTheDocument();
        })
      })
      describe('when success response is received', () => {
        it('displays message received from backend', async () => {
          const { user, elements: { button } } = await setup();
          await user.click(button)
          const text = await screen.findByText('User create success');
          expect(text).toBeInTheDocument()
        })
        it('hides sign up form', async () => {
          const { user, elements: { button } } = await setup()
          const form = screen.getByTestId('form-sign-up')
          await user.click(button)
          await waitFor(() => {
            expect(form).not.toBeVisible()
          })
        })
      })
      describe('when network failure occurs', () => {
        it('displays generic message', async () => {
          server.use(
            http.post('/api/v1/users', () => {
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
            http.post('/api/v1/users', () => {
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
              http.post('/api/v1/users', () => {
                if (!processedFirstRequest) {
                  processedFirstRequest = true
                  return HttpResponse.error()
                } else {
                  return HttpResponse.json({})
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
        describe.each([
          { field: 'username', message: 'Username cannot be null' },
          { field: 'email', message: 'E-mail cannot be null' },
          { field: 'password', message: 'Password cannot be null' }
        ])('when $field is invalid', ({ field, message }) => {
          it(`displays ${message}`, async () => {
            server.use(
              http.post('/api/v1/users', () => {
                return HttpResponse.json({
                  validationErrors: {
                    [field]: message
                  }
                }, { status: 400 })
              })
            )
            const { user, elements: { button } } = await setup();
            await user.click(button)
            const error = await screen.findByText(message)
            expect(error).toBeInTheDocument()
          })
          it(`clears error after user updates ${field}`, async () => {
            server.use(
              http.post('/api/v1/users', () => {
                return HttpResponse.json({
                  validationErrors: {
                    [field]: message
                  }
                }, { status: 400 })
              })
            )
            const { user, elements } = await setup();
            await user.click(elements.button)
            const error = await screen.findByText(message)
            await user.type(elements[`${field}Input`], 'updated')
            // expect(screen.queryByText(message)).not.toBeInTheDocument()
            expect(error).not.toBeInTheDocument()
          })
        })
        // describe('when username is invalid', () => {
        //   it('displays validation error', async () => {
        //     server.use(
        //       http.post('/api/v1/users', () => {
        //         return HttpResponse.json({
        //           validationErrors: {
        //             username: 'Username cannot be null'
        //           }
        //         }, { status: 400 })
        //       })
        //     )
        //     const { user, elements: { button } } = await setup();
        //     await user.click(button)
        //     const error = await screen.findByText('Username cannot be null')
        //     expect(error).toBeInTheDocument()
        //   })
        // })
        // describe('when email is invalid', () => {
        //   it('displays validation error', async () => {
        //     server.use(
        //       http.post('/api/v1/users', () => {
        //         return HttpResponse.json({
        //           validationErrors: {
        //             email: 'E-mail cannot be null'
        //           }
        //         }, { status: 400 })
        //       })
        //     )
        //     const { user, elements: { button } } = await setup();
        //     await user.click(button)
        //     const error = await screen.findByText('E-mail cannot be null')
        //     expect(error).toBeInTheDocument()
        //   })
        // })
      })
    })
  })
})
