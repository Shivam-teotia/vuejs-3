import { i18n } from '@/locale/index.js'
import http from '@/lib/http'

export const LogIn = (body) => {
    http.post('/api/v1/auth', body, {
        headers: {
            'Accept-Language': i18n.global.locale
        }
    })
}