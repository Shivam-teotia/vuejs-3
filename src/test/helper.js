import userEvent from '@testing-library/user-event'
import { i18n } from '../locale/index'
import { render } from '@testing-library/vue'
import router from '@/router'

const customRender = (component, options) => {
    const user = userEvent.setup()
    const result = render(component, {
        global: {
            plugins: [i18n, router]
        },
        ...options
    })
    return {
        result,
        user
    }
}
export * from '@testing-library/vue'
export { customRender as render }
export { router }