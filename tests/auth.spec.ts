import Vue from "vue";
import createServer, {clearRequests, requests} from './dev-server'
import Vuex, {Store} from "vuex";
import {BaseModel} from "js-rql";
import {getModule, Module} from "vuex-module-decorators";
import app, {BaseAuthService, JWTAuth, Service} from "../src";
import {expect} from "chai";
import {Server} from "http";

Vue.use(Vuex)

interface UserModel extends BaseModel {
	name: string
	age: number
	date: string
}

@Module({name: 'auth', namespaced: true})
class AuthService extends BaseAuthService<UserModel> {
}

@Module({name: 'users', namespaced: true})
class UsersService extends Service<UserModel> {
	path = 'users';
}

describe('Authentication module', function () {
	let authService: AuthService;
	let usersService: UsersService;
	let server: Server;
	beforeEach(done => setTimeout(done, 200));
	// {"user_id": 1}
	const access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxfQ.zCGBEiC4n4X5jij4lK4nSEtrbebYxELZ6OfBwdm6CJg";
	const refresh_token = "mock"

	beforeEach(() => {
		clearRequests();
		const store = new Store({
			modules: {
				auth: AuthService,
				users: UsersService
			}
		})
		usersService = getModule(UsersService, store)
		authService = getModule(AuthService, store)
		server = createServer({
			'/api/authentication': {
				"POST": {access: access_token, refresh: refresh_token}
			},
			'/api/users/1/': {
				"GET": {
					id: 1,
					name: "John",
					age: 19,
					date: "date"
				}
			}
		}, 8888)
	})

	afterEach((done) => {
		server.close(done)
	})

	it('login() relative path', async () => {
		app.configureAxios('http://localhost:8888/api').configureAuth(new JWTAuth({
			path: '/authentication',
			refreshPath: '/authentication/refresh',
			usersService: usersService
		}))
		const response = await authService.login({email: "test", password: "test"})
		expect(response.access_token, 'access token').equal(access_token)
		expect(response.refresh_token, 'access token').equal(refresh_token)
		expect(response.user, 'user').deep.equal({id: 1, name: "John", age: 19, date: "date"})
		expect(requests, 'requests').deep.equal([
			{method: "POST", url: "/api/authentication"},
			{method: "GET", url: "/api/users/1/"},
		])
	})

	it('login() absolute url', async () => {
		await authService.login({email: "test", password: "test"})
		app.configureAxios(':8888/api').configureAuth(new JWTAuth({
			path: '/authentication',
			refreshPath: '/authentication/refresh',
			usersService: usersService
		}))
		expect(requests, 'requests').deep.equal([
			{method: "POST", url: "/api/authentication"},
			{method: "GET", url: "/api/users/1/"},
		])
	})
})