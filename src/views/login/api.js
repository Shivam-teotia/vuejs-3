import http from '@/lib/http'

export const Login = (body) => {
    return http.post('/api/v1/auth', body)
}