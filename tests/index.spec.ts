import Vue from "vue";
import Vuex, {Store} from "vuex";
import app, {Service} from '../src';
import {BaseModel} from "js-rql";
import {getModule, Module} from "vuex-module-decorators";
import {expect} from 'chai';

Vue.use(Vuex)

interface TestModel extends BaseModel {
	name: string
	age: number
	date: string
}

@Module({name: 'test', namespaced: true})
class TestService extends Service<TestModel> {

}

describe('Store search', function () {
	let testService: TestService;
	beforeEach(() => {
		const data = {
			offset: 0,
			limit: 10,
			total: 3,
			results: [
				{
					id: '1',
					name: 'Name1',
					age: 19,
					date: '2022-04-06T00:00:00.000Z'
				},
				{
					id: '2',
					name: 'Name2',
					age: 22,
					date: '2022-04-07T00:00:00.000Z'
				},
				{
					id: '3',
					name: 'Name3',
					age: 28,
					date: '2022-04-08T00:00:00.000Z'
				}
			]
		}
		app.setAxiosInstance(<any>{
			async get() {
				return {data}
			}
		})
		const store = new Store({
			modules: {
				test: TestService
			}
		})
		testService = getModule(TestService, store)
	})

	it('Store search key:value', async () => {
		await testService.find()
		const data = testService.findStore({age: 19})
		expect(data, 'filtered result').deep.equal({
			total: 1,
			offset: 0,
			limit: 10,
			results: [{
				id: '1',
				name: 'Name1',
				age: 19,
				date: '2022-04-06T00:00:00.000Z'
			}]
		})
	});

	it('Store search $eq', async () => {
		await testService.find()
		const data = testService.findStore({age: {$eq: 19}})
		expect(data, 'filtered result').deep.equal({
			total: 1,
			offset: 0,
			limit: 10,
			results: [{
				id: '1',
				name: 'Name1',
				age: 19,
				date: '2022-04-06T00:00:00.000Z'
			}]
		})
	});

	it('Store search $gt', async () => {
		await testService.find()
		const data = testService.findStore({age: {$lt: 22, $gt: 18}})
		expect(data, 'filtered result').deep.equal({
			total: 1,
			offset: 0,
			limit: 10,
			results: [{
				id: '1',
				name: 'Name1',
				age: 19,
				date: '2022-04-06T00:00:00.000Z'
			}]
		})
	});

	it('Store search $ge', async () => {
		await testService.find()
		const data = testService.findStore({age: {$ge: 19}})
		expect(data, 'filtered result').deep.equal({
			total: 3,
			offset: 0,
			limit: 10,
			results: [
				{
					id: '1',
					name: 'Name1',
					age: 19,
					date: '2022-04-06T00:00:00.000Z'
				},
				{
					id: '2',
					name: 'Name2',
					age: 22,
					date: '2022-04-07T00:00:00.000Z'
				},
				{
					id: '3',
					name: 'Name3',
					age: 28,
					date: '2022-04-08T00:00:00.000Z'
				}
			]
		})
	});

	it('Store search $gt with dates', async () => {
		await testService.find()
		const data = testService.findStore({date: {$gt: "2022-04-06T00:00:00.000Z"}})
		expect(data, 'filtered result').deep.equal({
			total: 2,
			offset: 0,
			limit: 10,
			results: [
				{
					id: '2',
					name: 'Name2',
					age: 22,
					date: '2022-04-07T00:00:00.000Z'
				},
				{
					id: '3',
					name: 'Name3',
					age: 28,
					date: '2022-04-08T00:00:00.000Z'
				}
			]
		})
	});

	it('Store search $lt with dates', async () => {
		await testService.find()
		const data = testService.findStore({date: {$lt: "2022-04-08T00:00:00.000Z"}})
		expect(data, 'filtered result').deep.equal({
			total: 2,
			offset: 0,
			limit: 10,
			results: [
				{
					id: '1',
					name: 'Name1',
					age: 19,
					date: '2022-04-06T00:00:00.000Z'
				},
				{
					id: '2',
					name: 'Name2',
					age: 22,
					date: '2022-04-07T00:00:00.000Z'
				}
			]
		})
	});

	it('Store search $in', async () => {
		await testService.find()
		const data = testService.findStore({age: {$in: [18, 19, 20]}})
		expect(data, 'filtered result').deep.equal({
			total: 1,
			offset: 0,
			limit: 10,
			results: [{
				id: '1',
				name: 'Name1',
				age: 19,
				date: '2022-04-06T00:00:00.000Z'
			}]
		})
	});

	it('Store search $out', async () => {
		await testService.find()
		const data = testService.findStore({age: {$out: [19, 22]}})
		expect(data, 'filtered result').deep.equal({
			total: 1,
			offset: 0,
			limit: 10,
			results: [{
				id: '3',
				name: 'Name3',
				age: 28,
				date: '2022-04-08T00:00:00.000Z'
			}]
		})
	});

	it('Store search $like', async () => {
		await testService.find()
		const data = testService.findStore({name: {$like: '1'}})
		expect(data, 'filtered result').deep.equal({
			total: 1,
			offset: 0,
			limit: 10,
			results: [{
				id: '1',
				name: 'Name1',
				age: 19,
				date: '2022-04-06T00:00:00.000Z'
			}]
		})
	});

	it('Store search $not: {$eq}', async () => {
		await testService.find()
		const data = testService.findStore({age: {$not: {$eq: 19}}})
		expect(data, 'filtered result').deep.equal({
			total: 2,
			offset: 0,
			limit: 10,
			results: [
				{
					id: '2',
					name: 'Name2',
					age: 22,
					date: '2022-04-07T00:00:00.000Z'
				},
				{
					id: '3',
					name: 'Name3',
					age: 28,
					date: '2022-04-08T00:00:00.000Z'
				}
			]
		})
	});

	it('Store search $select', async () => {
		await testService.find()
		const data = testService.findStore({$select: ["id", "name"]})
		expect(data, 'result').deep.equal({
			total: 3,
			offset: 0,
			limit: 10,
			results: [
				{
					id: '1',
					name: 'Name1'
				},
				{
					id: '2',
					name: 'Name2'
				},
				{
					id: '3',
					name: 'Name3'
				}
			]
		})
	});

	it('Store sort $ordering', async () => {
		await testService.find()
		const data = testService.findStore({$ordering: ["-age"]})
		expect(data, 'sorted result').deep.equal({
			total: 3,
			offset: 0,
			limit: 10,
			results: [
				{
					id: '3',
					name: 'Name3',
					age: 28,
					date: '2022-04-08T00:00:00.000Z'
				},
				{
					id: '2',
					name: 'Name2',
					age: 22,
					date: '2022-04-07T00:00:00.000Z'
				},
				{
					id: '1',
					name: 'Name1',
					age: 19,
					date: '2022-04-06T00:00:00.000Z'
				}
			]
		})
	});

	it('Store search $or', async () => {
		await testService.find()
		const data = testService.findStore({
			$or: [
				{age: 19},
				{name: 'Name2'}
			]
		})
		expect(data, 'sorted result').deep.equal({
			total: 2,
			offset: 0,
			limit: 10,
			results: [
				{
					id: '1',
					name: 'Name1',
					age: 19,
					date: '2022-04-06T00:00:00.000Z'
				},
				{
					id: '2',
					name: 'Name2',
					age: 22,
					date: '2022-04-07T00:00:00.000Z'
				}
			]
		})
	});

	it('Store search $and', async () => {
		await testService.find()
		const data = testService.findStore({
			$or: [
				{age: 19},
				{name: 'Name1'}
			]
		})
		expect(data, 'sorted result').deep.equal({
			total: 1,
			offset: 0,
			limit: 10,
			results: [
				{
					id: '1',
					name: 'Name1',
					age: 19,
					date: '2022-04-06T00:00:00.000Z'
				}
			]
		})
	});
})
