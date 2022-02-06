import {Action, Module} from "vuex-module-decorators";
import {BaseService} from "./service";
import {AxiosError, AxiosResponse} from "axios";
import urljoin from "url-join";
import {BaseModel} from "./types";
import {makeAxiosInstance} from "./utils";

export interface AccessToken {
    access: string
}

export interface AuthTokens extends AccessToken {
    refresh: string
}

export interface LoginCredentials {
    email: string
    password: string
}

export class NoAccessToken extends Error {
    constructor() {
        super('No access token');
    }
}

export default class BaseAuthService<User extends BaseModel> extends BaseService {
    public user: User | null = null
    public userService!: BaseService

    get isLoggedIn(): () => boolean {
        return () => {
            const token = localStorage.getItem('access-token')
            if (!token)
                return false
            const jwtBody = JSON.parse(atob(token.split('.')[1]))
            return jwtBody.exp < Date.now()
        }
    }

    @Action
    async login({email, password}: LoginCredentials): Promise<AuthTokens> {
        const axiosInstance = makeAxiosInstance(this.baseUrl)
        return await axiosInstance.post(this.path, {email, password})
            .then((response: AxiosResponse<AuthTokens>) => response.data)
            .then(data => {
                localStorage.setItem('access-token', data.access)
                localStorage.setItem('refresh-token', data.access)
                return data
            })
    }

    @Action
    async refresh(): Promise<string> {
        const axiosInstance = makeAxiosInstance(this.baseUrl)
        const accessToken = localStorage.getItem('access-token')
        if (!accessToken)
            throw new NoAccessToken()
        const url = urljoin(this.path, 'refresh/')
        return await axiosInstance.post(url, {access: accessToken})
            .then((response: AxiosResponse<AccessToken>) => response.data)
            .then(data => {
                localStorage.setItem('access-token', data.access)
                return data.access
            }).catch((error: AxiosError<any>) => {
                if (error.response)
                    console.error(error.response.statusText, error.response.data)
                return Promise.reject(error.response)
            })
    }

    @Action
    async logout(): Promise<void> {
        localStorage.removeItem('access-token')
        localStorage.removeItem('refresh-token')
    }
}

