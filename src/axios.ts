import axios, {AxiosInstance} from "axios";
import {rql} from "javascript-rql";
import {getHeader} from "./utils";

let $axios: AxiosInstance

export function initializeAxiosInstance(baseUrl: string) {
	$axios = axios.create({
		baseURL: baseUrl,
		timeout: 60000,
		maxRedirects: 10,
		paramsSerializer: rql,
	})
	$axios.interceptors.request.use(function (config) {
		config.headers = {...config.headers, ...getHeader()}
		return config;
	});
	return $axios
}

export function setAxiosInstance(axiosInstance: AxiosInstance) {
	$axios = axiosInstance
}
   
export { $axios }