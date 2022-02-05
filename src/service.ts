import Vue from 'vue'

import {Action, Module, Mutation, VuexModule} from "vuex-module-decorators";
import {AxiosError, AxiosInstance, AxiosResponse} from "axios";
import {BaseModel, FindResponse, Operation, Pk, Query} from "./rql";
import urljoin from "url-join";

export class BaseService extends VuexModule {
    public path!: string
    protected axiosInstance!: AxiosInstance
}

@Module
export class Service<ModelType extends BaseModel> extends BaseService {
    public results: ModelType[] = []
    public isGetPending: boolean = false
    public isFindPending: boolean = false
    public isCreatePending: boolean = false
    public isPatchPending: boolean = false
    public isRemovePending: boolean = false
    public total: number = 0
    public offset: number = 0
    public limit: number = 0

    get getStore(): (id: Pk) => ModelType | undefined {
        return (id: Pk) => this.getItemById(id)
    }

    get findStore(): (query?: Query<ModelType>) => FindResponse<ModelType> {
        return (query?: Query<ModelType>) => {
            if (!query)
                return {
                    results: this.results,
                    total: this.total,
                    offset: this.offset,
                    limit: this.limit
                }
            return {
                results: this.storeSearch(this.results, query),
                total: this.total,
                limit: this.limit,
                offset: this.offset
            }
        }
    }

    @Mutation
    setData(data: FindResponse<ModelType>) {
        this.total = data.total
        this.limit = data.limit
        this.offset = data.offset
        data.results.forEach(item => {
            if (!this.getItemById(item.id)) {
                this.results.unshift(item)
            }
        })
    }

    @Mutation
    clearItems() {
        this.results = []
        this.total = 0
        this.limit = 0
        this.offset = 0
    }

    @Mutation
    addItem(item: ModelType) {
        if (this.getItemById(item.id)) {
            return this.updateItemById(item)
        }
        this.results.push(item)
    }

    @Mutation
    updateItem(item: ModelType) {
        this.updateItemById(item)
    }

    @Mutation
    removeItem(pk: Pk) {
        const idx = this.results.findIndex(el => el.id.toString() === pk.toString())
        if (idx === - 1)
            return
        this.results.splice(idx, 1)
    }

    @Mutation
    setFindState(val: boolean) {
        this.isFindPending = val
    }

    @Mutation
    setGetState(val: boolean) {
        this.isGetPending = val
    }

    @Mutation
    setCreateState(val: boolean) {
        this.isCreatePending = val
    }

    @Mutation
    setPatchState(val: boolean) {
        this.isPatchPending = val
    }

    @Mutation
    setRemoveState(val: boolean) {
        this.isRemovePending = val
    }

    @Action
    async get(id: Pk) {
        const url = urljoin(this.path, id.toString(), '/')
        this.setGetState(true)
        return await this.axiosInstance.get(url).then((response: AxiosResponse<ModelType>) => {
            this.addItem(response.data)
            return response.data
        }).finally(() => {
            this.setGetState(false)
        })
    }

    @Action
    async find(query?: Query<ModelType>): Promise<FindResponse<ModelType>> {
        let params: Query<ModelType> = Object.assign({}, query || {})
        this.setFindState(true)
        return await this.axiosInstance.get(this.path, {params}).then((response: AxiosResponse<FindResponse<ModelType>>) => {
            this.setData(response.data)
            return response.data
        }).catch(e => {
            return Promise.reject(e)
        }).finally(() => {
            this.setFindState(false)
        })
    }

    @Action
    async create(data: Partial<ModelType>): Promise<ModelType> {
        this.setCreateState(true)
        return await this.axiosInstance.post(this.path, data).then((response: AxiosResponse) => {
            this.addItem(response.data)
            return response.data
        }).catch((error: AxiosError) => {
            if (error.response)
                console.error(error.response.statusText, error.response.data)
            return Promise.reject(error.response)
        }).finally(() => {
            this.setCreateState(false)
        })
    }

    @Action
    async patch([id, data]: [Pk, Partial<ModelType>]): Promise<ModelType> {
        this.setPatchState(true)
        const url = urljoin(this.path, id.toString(), '/')
        return await this.axiosInstance.patch(url, data).then((response: AxiosResponse) => {
            this.updateItem(response.data)
            return response.data
        }).catch((error: AxiosError) => {
            if (error.response)
                console.error(error.response.statusText, error.response.data)
            return Promise.reject(error.response)
        }).finally(() => {
            this.setPatchState(false)
        })
    }

    @Action
    async remove(id: Pk): Promise<undefined> {
        const url = urljoin(this.path, id.toString())
        this.setRemoveState(true)
        return await this.axiosInstance.delete(url).then((response: AxiosResponse) => {
            this.removeItem(id)
            return response.data
        }).finally(() => {
            this.setRemoveState(false)
        })
    }

    protected storeSort(data: ModelType[], ordering: string) {
        const ascending = ordering[0] === '-'
        data.sort((a: ModelType, b: ModelType): number => {
            if (a[ordering] > b[ordering])
                return ascending ? 1 : - 1
            else
                return ascending ? - 1 : 1
        })
        return data
    }

    protected matchOperation(item: ModelType, key: string, operation: Operation<ModelType, keyof ModelType>): boolean {
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

    protected storeSearch(data: ModelType[], query: Query<ModelType>): ModelType[] {
        const {$ordering, limit, offset} = query
        delete query.offset
        delete query.limit
        delete query.$ordering
        for (const [key, operation] of Object.entries(query)) {
            data = data.filter(el => {
                if (typeof operation === 'object')
                    return this.matchOperation(el, key, operation)
                return el[key] === operation
            })
        }
        if ($ordering) { // @ts-ignore
            return this.storeSort(data, $ordering)
        }
        return data
    }

    protected getItemById(id: Pk): ModelType | undefined {
        return this.results.find(el => el.id.toString() === id.toString())
    }

    protected updateItemById(item: ModelType) {
        const idx = this.results.findIndex(el => el.id === item.id)
        if (idx === - 1)
            return
        Vue.set(this.results, idx, item)
    }
}

