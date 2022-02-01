var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Action, Module } from "vuex-class-modules";
import { BaseService } from "./service";
import urljoin from "url-join";
export class NoAccessToken extends Error {
    constructor() {
        super('No access token');
    }
}
let AuthService = class AuthService extends BaseService {
    user = null;
    userService;
    path;
    constructor(baseUrl, { store, userService }) {
        super(baseUrl, { store, name: "authentication" });
        this.userService = userService;
        this.path = "authentication/";
    }
    get isLoggedIn() {
        return () => {
            const token = localStorage.getItem('access-token');
            if (!token)
                return false;
            const jwtBody = JSON.parse(atob(token.split('.')[1]));
            return jwtBody.exp < Date.now();
        };
    }
    async login({ email, password }) {
        return await this.axiosInstance.post(this.path, { email, password })
            .then((response) => response.data)
            .then(data => {
            localStorage.setItem('access-token', data.access);
            localStorage.setItem('refresh-token', data.access);
            return data;
        });
    }
    async refresh() {
        const accessToken = localStorage.getItem('access-token');
        if (!accessToken)
            throw new NoAccessToken();
        const url = urljoin(this.path, 'refresh/');
        return await this.axiosInstance.post(url, { access: accessToken })
            .then((response) => response.data)
            .then(data => {
            localStorage.setItem('access-token', data.access);
            return data.access;
        }).catch((error) => {
            if (error.response)
                console.error(error.response.statusText, error.response.data);
            return Promise.reject(error.response);
        });
    }
    async logout() {
        localStorage.removeItem('access-token');
        localStorage.removeItem('refresh-token');
    }
};
__decorate([
    Action
], AuthService.prototype, "login", null);
__decorate([
    Action
], AuthService.prototype, "refresh", null);
__decorate([
    Action
], AuthService.prototype, "logout", null);
AuthService = __decorate([
    Module
], AuthService);
export default AuthService;
