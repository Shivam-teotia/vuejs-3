vi.mock('./api')
vi.mock('@/shared/useRouteParamApiRequest')
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/vue';
import { render } from '@testing-library/vue';
import Activation from "./Activation.vue"
import { activate } from './api';
import useRouteParamApiRequest from '@/shared/useRouteParamApiRequest';

const mockUseRouteParamApiRequest = vi.mocked(useRouteParamApiRequest)
beforeEach(() => {
    vi.clearAllMocks()
})

describe('Activation', () => {
    beforeEach(() => {
        mockUseRouteParamApiRequest.mockReturnValue({
            status: 'loading',
            data: undefined,
            error: undefined
        })
    })
    it('calls mockUseParamApiRequest with expected params', () => {
        render(Activation)
        expect(mockUseRouteParamApiRequest).toHaveBeenCalledWith(activate, 'token')
    })
    describe('when status is loading', () => {
        it('displays spinner', () => {
            render(Activation)
            expect(screen.getByRole('status')).toBeInTheDocument()
        })
    })
    describe('when status is success', () => {
        it('displays data message', () => {
            mockUseRouteParamApiRequest.mockReturnValue({
                status: 'success',
                data: { message: 'Success!!' },
                error: undefined
            })
            render(Activation)
            expect(screen.getByText('Success!!')).toBeInTheDocument()
        })
    })
    describe('when status is fail', () => {
        it('displays data message', () => {
            mockUseRouteParamApiRequest.mockReturnValue({
                status: 'fail',
                data: undefined,
                error: 'Error occurred'
            })
            render(Activation)
            expect(screen.getByText('Error occurred')).toBeInTheDocument()
        })
    })
})