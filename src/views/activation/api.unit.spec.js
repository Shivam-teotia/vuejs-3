vi.mock('@/lib/http');
import http from "@/lib/http";
import { activate } from "./api";
describe('signUp', () => {
    it('calls axios with expected params', () => {
        activate('123')
        expect(http.patch).toHaveBeenCalledWith('/api/v1/users/123/active')
    })
})