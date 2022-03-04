import {Action, Mutation, VuexModule} from "vuex-module-decorators";
import {AxiosError, AxiosResponse} from "axios";
import {BaseModel, FindResponse, Pk, Query} from "./types";
import urljoin from "url-join";
import {getItemById, storeSearch, updateItemById} from "./utils";
import {$axios} from "./axios";

export class BaseService extends VuexModule {
    public path!: string
}

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
        return (id: Pk) => getItemById(this.results, id)
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
                results: storeSearch(this.results, query),
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
            if (!getItemById(this.results, item.id)) {
                this.results.push(item)
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
        if (getItemById(this.results, item.id)) {
            return updateItemById(this.results, item)
        }
        this.results.push(item)
    }

    @Mutation
    updateItem(item: ModelType) {
        updateItemById(this.results, item)
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
        return await $axios.get(url).then((response: AxiosResponse<ModelType>) => {
            this.context.commit('addItem', response.data)
            return response.data
        }).finally(() => {
            this.context.commit('setGetState', false)
        })
    }

    @Action
    async find(query?: Query<ModelType>): Promise<FindResponse<ModelType>> {
        let params: Query<ModelType> = Object.assign({}, query || {})
        this.context.commit('setFindState', true)
        return await $axios.get(this.path, {params}).then((response: AxiosResponse<FindResponse<ModelType>>) => {
            this.context.commit('setData', response.data)
            return response.data
        }).catch(e => {
            return Promise.reject(e)
        }).finally(() => {
            this.context.commit('setFindState', false)
        })
    }

    @Action
    async create(data: Partial<ModelType>): Promise<ModelType> {
        this.context.commit('setCreateState', true)
        return await $axios.post(this.path, data).then((response: AxiosResponse) => {
            this.context.commit('addItem', response.data)
            return response.data
        }).catch((error: AxiosError) => {
            if (error.response)
                console.error(error.response.statusText, error.response.data)
            return Promise.reject(error.response)
        }).finally(() => {
            this.context.commit('setCreateState', false)
        })
    }

    @Action
    async patch([id, data]: [Pk, Partial<ModelType>]): Promise<ModelType> {
        const url = urljoin(this.path, id.toString(), '/')
        this.context.commit('setPatchState', true)
        return await $axios.patch(url, data)
            .then((response: AxiosResponse) => {
                this.context.commit('updateItem', response.data)
                return response.data
            }).catch((error: AxiosError) => {
                if (error.response)
                    console.error(error.response.statusText, error.response.data)
                return Promise.reject(error.response)
            }).finally(() => {
                this.context.commit('setPatchState', false)
            })
    }

    @Action
    async remove(id: Pk): Promise<undefined> {
        const url = urljoin(this.path, id.toString())
        this.context.commit('setRemoveState', true)
        return await $axios.delete(url).then((response: AxiosResponse) => {
            this.context.commit('removeItem', id)
            return response.data
        }).finally(() => {
            this.context.commit('setRemoveState', false)
        })
    }
}

