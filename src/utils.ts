import {Pk} from "./types";
import Vue from "vue";
import {BaseModel, Query} from "js-rql";
import {IRQLExpression} from "js-rql/dist/types";

const expressions = ['$eq', '$ne', '$gt', '$ge', '$lt', '$le', '$like', '$ilike', '$in', '$out', '$range', '$not', '$or', '$and'];

export function strip(string: string, char: string) {
	const regex = new RegExp(`^${char}|\\${char}$`, 'g')
	return string.replace(regex, '');
}

function isRQLExp(object: any): object is IRQLExpression<any, any> {
	if (typeof object !== 'object')
		return false
	return expressions.some(expression => expression in object);
}

export function storeSort<M extends BaseModel = BaseModel, K extends keyof M = keyof M>(data: M[], $ordering: K | K[]): M[] {
	$ordering = Array.isArray($ordering) ? $ordering : [$ordering];
	const dir: number[] = [];
	// TODO: figure out correct way to do this
	const fields = (<string[]>$ordering).map((field, index) => {
		if (field[0] === "-") {
			dir[index] = - 1;
			field = field.substring(1);
		} else {
			dir[index] = 1;
		}
		return field;
	})
	data = data.slice().sort((a, b) => {
		for (let i = 0; i < fields.length; i ++) {
			const field = fields[i];
			if (a[field] > b[field])
				return dir[i];
			if (a[field] < b[field])
				return - (dir[i]);
		}
		return 0;
	})
	return data
}

function eq(a: any, b: any): boolean {
	return a === b
}

function lt(a: any, b: any): boolean {
	return a < b
}

function gt(a: any, b: any): boolean {
	return a > b
}

function selectFields<M extends BaseModel>(data: M[], $select: (keyof M)[]): M[] {
	return data.map(el => {
		return <M>$select.reduce((result: object, field: keyof M) => {
			return {...result, [field]: el[field]}
		}, {})
	})
}

// {name: 'Name'}, 'name', {$like: 'Nam'}
export function matchOperation<M extends BaseModel>(value: any, expression: IRQLExpression<M, keyof M>): boolean {
	return Object.entries(expression).map(([key, expVal]: [keyof M, M[keyof M]]) => {
		if (key === '$like') {
			if (!value)
				return false
			return value.match(new RegExp(expVal))
		}

		if (key === '$range') {
			return gt(value, expVal.min) && lt(value, expVal.max)
		}

		if (key === '$not')
			return !matchOperation(value, expVal)

		if (key === '$ilike') {
			if (!value)
				return false
			return value.match(new RegExp(expVal, 'i'))
		}

		if (key === '$in')
			return expVal.includes(value)

		if (key === '$out')
			return !expVal.includes(value)

		if (key === '$ne')
			return !eq(value, expVal)

		if (key === '$eq')
			return eq(value, expVal)

		if (key === '$gt')
			return gt(value, expVal)

		if (key === '$lt')
			return lt(value, expVal)

		if (key === '$le')
			return lt(value, expVal) || eq(value, expVal)

		if (key === '$ge')
			return gt(value, expVal) || eq(value, expVal)
	}).every(el => el)
}

export function storeSearch<ModelType extends BaseModel>(data: ModelType[], query: Query<ModelType>): ModelType[] {
	const {$ordering, $select, limit, offset} = query
	delete query.offset
	delete query.limit
	delete query.$ordering
	delete query.$select
	for (const [key, expression] of Object.entries(query)) {
		data = data.filter(el => {
			if (isRQLExp(expression))
				return matchOperation(el[key], expression)
			return eq(el[key], expression)
		})
	}
	if ($ordering)
		data = storeSort(data, $ordering)

	if ($select)
		return selectFields(data, $select)
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

export function isNode(): boolean {
	return typeof window === 'undefined'
}
