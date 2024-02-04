vi.mock('./api')
vi.mock('vue-i18n')
vi.mock('vue-router');
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/vue';
import { render, waitFor } from '@testing-library/vue';
import Activation from "./Activation.vue"
import en from '@/locale/translations/en.json'
import { useI18n } from 'vue-i18n'
import { activate } from './api';
import { useRoute } from 'vue-router';
import { reactive } from 'vue';
vi.mocked(useI18n).mockReturnValue({
    t: (key) => en[key],
})

const mockuseRouter = vi.mocked(useRoute).mockReturnValue({
    params: {
        token: '123'
    }
})
beforeEach(() => {
    vi.clearAllMocks()
})
const setup = async (token) => {
    return render(Activation, {
        global: {
            mocks: {}
        }
    })
}

describe('Activation', () => {
    it('sends activation request to server', async () => {
        await setup('/')
        await waitFor(() => {
            expect(activate).toHaveBeenCalledTimes(1)
        })
    })
    describe.each([{ activationToken: '123' }, { activationToken: '456' }])('when token is $token', ({ activationToken }) => {
        it('sends token in request', async () => {
            mockuseRouter.mockReturnValue({
                params: {
                    token: activationToken
                }
            })
            await setup()
            await waitFor(() => {
                expect(activate).toHaveBeenCalledWith(activationToken)
            })
        })
    })
    describe('when token is changed', () => {
        it('sends request with new token', async () => {
            const route = reactive({
                params: {
                    token: '123'
                }
            })
            mockuseRouter.mockReturnValue(route)
            await setup()
            await waitFor(() => {
                expect(activate).toHaveBeenCalledWith('123')
            })
            route.params.token = '456'
            await waitFor(() => {
                expect(activate).toHaveBeenCalledWith('456')
            })
        })
    })
    describe('when newtwork error occurs', () => {
        it('displays generic error message', async () => {
            activate.mockRejectedValue({})
            await setup('/activation/123')
            const text = await screen.findByText('Unexpected error occurred,please try again')
            expect(text).toBeInTheDocument()
        })
    })
    describe('when token is invalid', () => {
        it(`displasy error message received in response`, async () => {
            let rejectFunc
            activate.mockImplementation(() => new Promise((reject) => {
                rejectFunc = reject
            }))
            await setup('/activation/123')
            expect(screen.queryByText('Activation failure')).not.toBeInTheDocument()
            await rejectFunc({ data: { message: 'Activation failure' } })
            await waitFor(() => {
                expect(screen.queryByText('Activation failure')).toBeInTheDocument()
            })
        })
    })
    describe('when token is valid', () => {
        it(`displays success message received in response`, async () => {
            let resolveFunc
            activate.mockImplementation(() => new Promise((resolve) => {
                resolveFunc = resolve
            }))
            await setup('/activation/123')
            expect(screen.queryByText('Account is activated')).not.toBeInTheDocument()
            await resolveFunc({ data: { message: 'Account is activated' } })
            await waitFor(() => {
                expect(screen.queryByText('Account is activated')).toBeInTheDocument();
            })
        })
    })
    it('displays spinner', async () => {
        let resolveFunc
        activate.mockImplementation(() => new Promise((resolve) => {
            resolveFunc = resolve
        }))
        await setup()
        const spinner = await screen.findByRole('status')
        expect(spinner).toBeInTheDocument()
        await resolveFunc({ data: { message: 'Account is activated' } })
        await waitFor(() => {
            expect(spinner).not.toBeInTheDocument()
        })
    })
})