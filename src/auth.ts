import {Action, Mutation} from "vuex-module-decorators";
import {BaseService, Service} from "./service";
import {AxiosError, AxiosInstance, AxiosResponse} from "axios";
import {BaseModel} from "js-rql";
import app, {StorageInterface} from './app';
import {isNode} from "./utils";

export const nodeStorage: StorageInterface = {
	_storage: {},
	getItem(key: string) {
		return this._storage[key]
	},
	setItem(key: string, value: string) {
		this._storage[key] = value
	},
	removeItem(key: string) {
		delete this._storage[key]
	}
}

export class NoAccessToken extends Error {
	constructor() {
		super('No access token');
	}
}

export interface AuthResponse<U = any> {
	user: U
	access_token: string
	refresh_token: string
}

export interface LoginCredentials {
	email: string
	password: string
}

export abstract class BaseAuth {
	axios!: AxiosInstance

	abstract get isLoggedIn(): boolean

	setAxiosInstance(axios: AxiosInstance) {
		this.axios = axios
	}

	abstract getAuthenticatedUser(): Promise<any>

	abstract login(email: string, password: string): Promise<AuthResponse>

	abstract logout(): Promise<void>

}

interface JWTOptions {
	path: string,
	usersService: any
	refreshPath?: string,
	storage?: StorageInterface
}

export class JWTAuth<User> extends BaseAuth {
	path: string
	refreshPath: string | undefined
	storage: StorageInterface
	usersService: Service<User>

	constructor({path, refreshPath, usersService, storage}: JWTOptions) {
		super()
		this.path = path;
		this.refreshPath = refreshPath;
		if (storage)
			this.storage = storage
		else
			this.storage = this.defaultStorage()
		this.usersService = usersService
	}

	get accessToken() {
		return this.storage.getItem('access-token')
	}

	get isLoggedIn() {
		const token = this.storage.getItem('access-token')
		if (!token)
			return false
		const jwtBody = JSON.parse(atob(token.split('.')[1]))
		return jwtBody.exp < Date.now()
	}

	defaultStorage(): StorageInterface {
		if (isNode())
			return nodeStorage
		return localStorage
	}

	getAuthenticatedUser(): Promise<any> {
		const token = this.storage.getItem('access-token')
		if (!token)
			throw new Error('Not authenticated')
		const jwtBody = JSON.parse(atob(token.split('.')[1]))
		return this.usersService.get(jwtBody.user_id)
	}

	async refresh() {
		const accessToken = this.storage.getItem('access-token')
		if (!this.refreshPath)
			throw new Error(`No 'refreshPath' was provided`)
		if (!accessToken)
			throw new NoAccessToken()
		return await this.axios.post(this.refreshPath, {access: accessToken}, {baseURL: '/'})
			.then((response: AxiosResponse<{ access: string }>) => response.data)
			.then(data => {
				this.storage.setItem('access-token', data.access)
				return data.access
			}).catch((error: AxiosError<any>) => {
				if (error.response)
					console.error(error.response.statusText, error.response.data)
				return Promise.reject(error.response)
			})
	}

	async login(email: string, password: string): Promise<AuthResponse> {
		const data = await this.axios.post(this.path, {
			email,
			password
		}).then((response: AxiosResponse<{ access: string, refresh: string }>) => response.data)
		this.storage.setItem('access-token', data.access)
		this.storage.setItem('refresh-token', data.refresh)
		const user = await this.getAuthenticatedUser()
		return {user, access_token: data.access, refresh_token: data.refresh}
	}

	async logout() {
		this.storage.removeItem('access-token')
		this.storage.removeItem('refresh-token')
	}
}

export default class BaseAuthService<User extends BaseModel> extends BaseService {
	public user: User | null = null
	public usersService!: string

	get isLoggedIn(): () => boolean {
		return () => app.authStrategy.isLoggedIn
	}

	@Mutation
	setCurrentUser(user: User) {
		this.user = user
	}

	@Action({rawError: true})
	async getCurrentUser() {
		return app.authStrategy.getAuthenticatedUser().then((user: any) => {
			this.context.commit('setCurrentUser', user)
			return user
		})
	}

	@Action({rawError: true})
	async login({email, password}: LoginCredentials): Promise<AuthResponse> {
		return await app.authStrategy.login(email, password)
	}

	@Action
	async refresh(): Promise<string | void> {
		if (app.authStrategy instanceof JWTAuth) {
			return await app.authStrategy.refresh()
		}
	}

	@Action({rawError: true})
	async logout(): Promise<void> {
		return await app.authStrategy.logout()
	}
}

