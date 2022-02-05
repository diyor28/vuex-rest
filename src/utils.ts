import axios, {AxiosInstance} from "axios";
import {rql} from "javascript-rql";

export function strip(string: string, char: string) {
	const regex = new RegExp(`^${char}|\\${char}$`, 'g')
	return string.replace(regex, '');
}

export function getHeader(): { Authorization: string } | {} {
	const accessToken = localStorage.getItem("access-token")
	if (!accessToken)
		return {}
	return {"Authorization": "Bearer " + accessToken};
}

export function makeAxiosInstance(baseUrl: string): AxiosInstance {
	let axiosInstance = axios.create({
		baseURL: baseUrl,
		timeout: 60000,
		maxRedirects: 10,
		paramsSerializer: rql,
	})
	axiosInstance.interceptors.request.use(function (config) {
		config.headers = {...config.headers, ...getHeader()}
		return config;
	});
	return axiosInstance
}