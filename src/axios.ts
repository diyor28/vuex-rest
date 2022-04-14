import {AxiosRequestConfig} from "axios";
import app from './app'
import rql from "js-rql";
import {JWTAuth} from "./auth";

export function getAuthHeader(): { Authorization: string } | {} {
	if (app.authStrategy instanceof JWTAuth) {
		return {"Authorization": "Bearer " + app.authStrategy.accessToken}
	}
	return {};
}

export function getAxiosConfig(baseUrl: string): AxiosRequestConfig {
	return {
		baseURL: baseUrl,
		timeout: 60000,
		maxRedirects: 10
	}
}

export function requestInterceptor(config: AxiosRequestConfig) {
	config.paramsSerializer = rql
	config.headers = {...config.headers, ...getAuthHeader()}
	return config
}
