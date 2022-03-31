import {Action, Mutation} from "vuex-module-decorators";
import {BaseService} from "./service";
import {AxiosError, AxiosResponse} from "axios";
import urljoin from "url-join";
import {BaseModel} from "./types";
import {$axios} from "./axios";
import {$storage} from "./storage";


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
    public usersService!: string

    get isLoggedIn(): () => boolean {
        return () => {
            const token = $storage.getItem('access-token')
            if (!token)
                return false
            const jwtBody = JSON.parse(atob(token.split('.')[1]))
            return jwtBody.exp < Date.now()
        }
    }

    @Mutation
    setCurrentUser(user: User) {
        this.user = user
    }

    @Action
    async getCurrentUser() {
        const token = $storage.getItem('access-token')
        if (!token)
            throw new Error('No authenticated')
        const jwtBody = JSON.parse(atob(token.split('.')[1]))
        return this.context.dispatch(this.usersService + '/get', jwtBody.user_id, {root: true}).then((user: any) => {
            // TODO: find a more ellegant solution
            this.context.commit('setCurrentUser', user)
            return user
        })
    }

    @Action
    async login({email, password}: LoginCredentials): Promise<AuthTokens> {
        return await $axios.post(this.path, {email, password})
            .then((response: AxiosResponse<AuthTokens>) => response.data)
            .then(data => {
                $storage.setItem('access-token', data.access)
                $storage.setItem('refresh-token', data.refresh)
                this.getCurrentUser()
                return data
            })
    }

    @Action
    async refresh(): Promise<string> {
        const accessToken = $storage.getItem('access-token')
        if (!accessToken)
            throw new NoAccessToken()
        const url = urljoin(this.path, 'refresh/')
        return await $axios.post(url, {access: accessToken})
            .then((response: AxiosResponse<AccessToken>) => response.data)
            .then(data => {
                $storage.setItem('access-token', data.access)
                return data.access
            }).catch((error: AxiosError<any>) => {
                if (error.response)
                    console.error(error.response.statusText, error.response.data)
                return Promise.reject(error.response)
            })
    }

    @Action
    async logout(): Promise<void> {
        $storage.removeItem('access-token')
        $storage.removeItem('refresh-token')
    }
}

