import {resolve} from 'path'

interface ModuleThis {
	nuxt: any
	addPlugin: ({src, fileName, options}: {src: string, fileName?: string, options: any}) => void
}

export default function (this: ModuleThis) {
	this.addPlugin({
		src: resolve(__dirname, 'plugin.js'),
		options: {}
	})
	console.log(Object.keys(this.nuxt))
}