import {BaseModel, Operation, Pk, Query} from "./types";
import Vue from "vue";

export function strip(string: string, char: string) {
	const regex = new RegExp(`^${char}|\\${char}$`, 'g')
	return string.replace(regex, '');
}

export function storeSort<ModelType extends BaseModel>(data: ModelType[], ordering: string) {
	const ascending = ordering[0] === '-'
	data.sort((a: ModelType, b: ModelType): number => {
		if (a[ordering] > b[ordering])
			return ascending ? 1 : - 1
		else
			return ascending ? - 1 : 1
	})
	return data
}

export function matchOperation<ModelType extends BaseModel>(item: ModelType, key: string, operation: Operation<ModelType, keyof ModelType>): boolean {
	// @ts-ignore
	if ('$like' in operation && operation.$like) {
		if (!item[key])
			return false
		return item[key].match(new RegExp(operation.$like, 'i'))
	}

	// @ts-ignore
	if ('$in' in operation && operation.$in)
		return operation.$in.includes(item[key])

	// @ts-ignore
	if ('$ne' in operation && operation.$ne)
		return item[key] !== operation.$ne
	return true
}

export function storeSearch<ModelType extends BaseModel>(data: ModelType[], query: Query<ModelType>): ModelType[] {
	const {$ordering, limit, offset} = query
	delete query.offset
	delete query.limit
	delete query.$ordering
	for (const [key, operation] of Object.entries(query)) {
		data = data.filter(el => {
			if (typeof operation === 'object')
				return matchOperation(el, key, operation)
			return el[key] === operation
		})
	}
	if ($ordering) { // @ts-ignore
		return this.storeSort(data, $ordering)
	}
	return data
}

export function getItemById<ModelType extends BaseModel>(data: Array<ModelType>, id: Pk): ModelType | undefined {
	return data.find(el => el.id.toString() === id.toString())
}

export function updateItemById<ModelType extends BaseModel>(data: Array<ModelType>, item: ModelType) {
	const idx = data.findIndex(el => el.id === item.id)
	if (idx === - 1)
		return
	Vue.set(data, idx, item)
}