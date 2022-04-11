import {Pk} from "./types";
import Vue from "vue";
import {BaseModel, FieldsIRQL, Operation, Query} from "js-rql";
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

function evalExp<M extends BaseModel>(value: M[keyof M], expK: string, expV: IRQLExpression<M>[keyof IRQLExpression<M>]) {
	switch (expK) {
		case '$like':
			return $like(value, expV)
		case '$ilike':
			return $ilike(value, expV)
		case '$range':
			// @ts-ignore
			return $gt(value, expV.min) && $lt(value, expV.max)
		case '$in':
			return $in(value, expV)
		case '$out':
			return !$in(value, expV)
		case '$ne':
			return !$eq(value, expV)
		case '$eq':
			return $eq(value, expV)
		case '$gt':
			return $gt(value, expV)
		case '$lt':
			return $lt(value, expV)
		case '$le':
			return $lt(value, expV) || $eq(value, expV)
		case '$ge':
			return $gt(value, expV) || $eq(value, expV)
		default:
			return $eq(value, expV)
	}
}


function isMatch<M extends BaseModel>(model: M, key: keyof M, expression: Operation<M, keyof M>): boolean {
	const value = model[key];
	if (isRQLExp(expression))
		return Object.entries(expression).every(([expK, expV]) => {
			if (expK === '$not')
				return !isMatch(model, key, expV)

			if (key === '$and' && Array.isArray(expression))
				return expression.every((q: FieldsIRQL<M>) => filterAgainstQ(model, q))

			if (key === '$or' && Array.isArray(expression))
				return expression.some((q: FieldsIRQL<M>) => filterAgainstQ(model, q))

			return evalExp(value, expK, expV)
		})
	return $eq(value, expression)
}

function filterAgainstQ<M extends BaseModel>(model: M, query: Query<M>): boolean {
	return Object.entries(query).every(([key, expression]) => {
		if (key === '$and' && Array.isArray(expression))
			return expression.every((q: FieldsIRQL<M>) => filterAgainstQ(model, q))
		if (key === '$or' && Array.isArray(expression))
			return expression.some((q: FieldsIRQL<M>) => filterAgainstQ(model, q))
		if (expression)
			return isMatch(model, key, expression)
		return $eq(model[key], expression)
	})
}

function filter<M extends BaseModel>(data: M[], query: Query<M>): M[] {
	return data.filter(el => filterAgainstQ(el, query))
}

export function storeSearch<ModelType extends BaseModel>(data: ModelType[], query: Query<ModelType>): ModelType[] {
	const {$ordering, $select, limit, offset} = query
	delete query.offset
	delete query.limit
	delete query.$ordering
	delete query.$select
	data = filter(data, query)
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
