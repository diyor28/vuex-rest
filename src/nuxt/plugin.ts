import {requestInterceptor} from "../axios";

export default function ({$axios}: { $axios: any }) {
	$axios.onRequest(requestInterceptor)
};
