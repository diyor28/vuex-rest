import {Pk} from "./types";
import Vue from "vue";
import {BaseModel, FieldsIRQL, Query} from "js-rql";
import {IRQLExpression} from "js-rql/dist/types";


const expressions = ['$eq', '$ne', '$gt', '$ge', '$lt', '$le', '$like', '$ilike', '$in', '$out', '$range', '$not', '$or', '$and'];

export function strip(string: string, char: string) {
	const regex = new RegExp(`^${char}|\\${char}$`, 'g')
	return string.replace(regex, '');
}

function storeSort<M extends BaseModel = BaseModel, K extends keyof M = keyof M>(data: M[], $ordering: K | K[]): M[] {
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

function $eq(a: any, b: any): boolean {
	return a === b
}

function $lt(a: any, b: any): boolean {
	return a < b
}

function $gt(a: any, b: any): boolean {
	return a > b
}

function $in(value: any, array: any): boolean {
	return array.includes(value)
}

function $like(value: any, pattern: any): boolean {
	if (!value)
		return false
	return value.match(new RegExp(pattern))
}

function $ilike(value: any, pattern: any): boolean {
	if (!value)
		return false
	return value.match(new RegExp(pattern, 'i'))
}

function selectFields<M extends BaseModel>(data: M[], $select: (keyof M)[]): M[] {
	return data.map(el => {
		return <M>$select.reduce((result: object, field: keyof M) => {
			return {...result, [field]: el[field]}
		}, {})
	})
}


function isRQLExp(object: any): object is IRQLExpression<any, any> {
	if (typeof object !== 'object')
		return false
	return expressions.some(expression => expression in object);
}

function evalExp<M extends BaseModel>(model: M, value: any, key: string, expression: any): boolean {
	switch (key) {
		case '$and':
			return expression.every((q: FieldsIRQL<M>) => isMatch(model, q))
		case '$or':
			return expression.some((q: FieldsIRQL<M>) => isMatch(model, q))
		case '$not':
			return !_isMatch(model, expression, value)
		case '$like':
			return $like(value, expression)
		case '$ilike':
			return $ilike(value, expression)
		case '$range':
			// @ts-ignore
			return $gt(value, expression.min) && $lt(value, expression.max)
		case '$in':
			return $in(value, expression)
		case '$out':
			return !$in(value, expression)
		case '$ne':
			return !$eq(value, expression)
		case '$eq':
			return $eq(value, expression)
		case '$gt':
			return $gt(value, expression)
		case '$lt':
			return $lt(value, expression)
		case '$le':
			return $lt(value, expression) || $eq(value, expression)
		case '$ge':
			return $gt(value, expression) || $eq(value, expression)
	}
	if (isRQLExp(expression))
		return _isMatch(model, expression, value)
	return $eq(model[key], expression)
}

function _isMatch<M extends BaseModel>(model: M, query: Query<M>, value: any): boolean {
	return Object.entries(query).every(([key, expression]) => evalExp(model, value, key, expression))
}

function isMatch<M extends BaseModel>(model: M, query: Query<M>): boolean {
	return Object.entries(query).every(([key, expression]) => evalExp(model, model[key], key, expression))
}

export function storeSearch<ModelType extends BaseModel>(data: ModelType[], query: Query<ModelType>): ModelType[] {
	const {$ordering, $select, limit, offset} = query
	delete query.offset
	delete query.limit
	delete query.$ordering
	delete query.$select
	data = data.filter(el => isMatch(el, query))
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
