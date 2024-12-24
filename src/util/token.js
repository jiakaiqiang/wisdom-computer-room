import Cookies from 'js-cookie'
import website from '@/config/website'
const Authorization = website.Authorization
var inFifteenMinutes = new Date(new Date().getTime() + website.tokenTime * 1000);
export function getToken () {
    return Cookies.get(Authorization)
}


export function setToken (token) {
    return Cookies.set(Authorization, token, { expires: inFifteenMinutes })
}

export function removeToken () {
    return Cookies.remove(Authorization)
}
export function setAutoToken(token) {
    return Cookies.set("MP-AUTH-API", token, { expires: inFifteenMinutes });
}
export function removeAutoToken() {
    return Cookies.remove("MP-AUTH-API");
}