import {getAxiosConfig, requestInterceptor} from "./axios";
import axios, {AxiosInstance, AxiosRequestConfig} from "axios";
import {BaseAuth} from "./auth";

export interface StorageInterface {
	_storage?: any
	getItem: (key: string) => string | null
	setItem: (key: string, value: string) => void
	removeItem: (key: string) => void
}

export class App {
	authStrategy!: BaseAuth;
	axios!: AxiosInstance;

	constructor() {
	}

	configureAuth(authStrategy: BaseAuth) {
		this.authStrategy = authStrategy
		return this
	}

	configureAxios(baseUrl: string, axiosConfig?: AxiosRequestConfig) {
		this.axios = axios.create({...getAxiosConfig(baseUrl), ...axiosConfig})
		this.axios.interceptors.request.use(requestInterceptor);
		return this
	}

	setAxiosInstance(axios: AxiosInstance) {
		this.axios = axios
	}
}

const app = new App();
export default app;

