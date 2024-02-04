import { i18n } from "@/locale";
import axios from "axios";
export const activate = (token) => {
    return axios.patch(`/api/v1/users/${token}/activate`, {

    }, {
        headers: {
            'Accept-Language': i18n.global.locale
        }
    })
}