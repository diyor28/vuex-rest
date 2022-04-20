import http from "http";


export let requests: { method: string, url: string }[] = [];

export function clearRequests() {
	requests = []
}

export default function createServer(responses: { [index: string]: {[index: string]: object} }, port: number) {
	const server = http.createServer(function (req, res) {
		const method = <string>req.method;
		const url = <string>req.url;

		requests.push({method, url})
		res.writeHead(200);
		res.end(JSON.stringify(responses[url][method]))
	})
	server.listen(port, "localhost")
	return server;
}