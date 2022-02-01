var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import Vue from 'vue';
import { rql } from 'javascript-rql';
import { Action, Mutation, VuexModule } from "vuex-class-modules";
import axios from "axios";
import urljoin from "url-join";
import { getHeader, strip } from "./utils";
export class BaseService extends VuexModule {
    axiosInstance;
    constructor(baseUrl, options) {
        super(options);
        this.axiosInstance = axios.create({
            baseURL: baseUrl,
            timeout: 60000,
            maxRedirects: 10,
            paramsSerializer: rql,
        });
        this.axiosInstance.interceptors.request.use(function (config) {
            config.headers = { ...config.headers, ...getHeader() };
            return config;
        });
    }
}
export class Service extends BaseService {
    results = [];
    isGetPending = false;
    isFindPending = false;
    isCreatePending = false;
    isPatchPending = false;
    isRemovePending = false;
    total = 0;
    offset = 0;
    limit = 0;
    path;
    constructor(store, baseUrl, path) {
        super(baseUrl, { store, name: strip(path, '/') });
        this.path = strip(path, '/') + '/';
    }
    get getStore() {
        return (id) => this.getItemById(id);
    }
    get findStore() {
        return (query) => {
            if (!query)
                return {
                    results: this.results,
                    total: this.total,
                    offset: this.offset,
                    limit: this.limit
                };
            return {
                results: this.storeSearch(this.results, query),
                total: this.total,
                limit: this.limit,
                offset: this.offset
            };
        };
    }
    setData(data) {
        this.total = data.total;
        this.limit = data.limit;
        this.offset = data.offset;
        data.results.forEach(item => {
            if (!this.getItemById(item.id)) {
                this.results.unshift(item);
            }
        });
    }
    clearItems() {
        this.results = [];
        this.total = 0;
        this.limit = 0;
        this.offset = 0;
    }
    addItem(item) {
        if (this.getItemById(item.id)) {
            return this.updateItemById(item);
        }
        this.results.push(item);
    }
    updateItem(item) {
        this.updateItemById(item);
    }
    removeItem(pk) {
        const idx = this.results.findIndex(el => el.id.toString() === pk.toString());
        if (idx === -1)
            return;
        this.results.splice(idx, 1);
    }
    setFindState(val) {
        this.isFindPending = val;
    }
    setGetState(val) {
        this.isGetPending = val;
    }
    setCreateState(val) {
        this.isCreatePending = val;
    }
    setPatchState(val) {
        this.isPatchPending = val;
    }
    setRemoveState(val) {
        this.isRemovePending = val;
    }
    async get(id) {
        const url = urljoin(this.path, id.toString(), '/');
        this.setGetState(true);
        return await this.axiosInstance.get(url).then((response) => {
            this.addItem(response.data);
            return response.data;
        }).finally(() => {
            this.setGetState(false);
        });
    }
    async find(query) {
        let params = Object.assign({}, query || {});
        this.setFindState(true);
        return await this.axiosInstance.get(this.path, { params }).then((response) => {
            this.setData(response.data);
            return response.data;
        }).catch(e => {
            return Promise.reject(e);
        }).finally(() => {
            this.setFindState(false);
        });
    }
    async create(data) {
        this.setCreateState(true);
        return await this.axiosInstance.post(this.path, data).then((response) => {
            this.addItem(response.data);
            return response.data;
        }).catch((error) => {
            if (error.response)
                console.error(error.response.statusText, error.response.data);
            return Promise.reject(error.response);
        }).finally(() => {
            this.setCreateState(false);
        });
    }
    async patch([id, data]) {
        this.setPatchState(true);
        const url = urljoin(this.path, id.toString(), '/');
        return await this.axiosInstance.patch(url, data).then((response) => {
            this.updateItem(response.data);
            return response.data;
        }).catch((error) => {
            if (error.response)
                console.error(error.response.statusText, error.response.data);
            return Promise.reject(error.response);
        }).finally(() => {
            this.setPatchState(false);
        });
    }
    async remove(id) {
        const url = urljoin(this.path, id.toString());
        this.setRemoveState(true);
        return await this.axiosInstance.delete(url).then((response) => {
            this.removeItem(id);
            return response.data;
        }).finally(() => {
            this.setRemoveState(false);
        });
    }
    storeSort(data, ordering) {
        const ascending = ordering[0] === '-';
        data.sort((a, b) => {
            if (a[ordering] > b[ordering])
                return ascending ? 1 : -1;
            else
                return ascending ? -1 : 1;
        });
        return data;
    }
    matchOperation(item, key, operation) {
        // @ts-ignore
        if ('$like' in operation && operation.$like) {
            if (!item[key])
                return false;
            return item[key].match(new RegExp(operation.$like, 'i'));
        }
        // @ts-ignore
        if ('$in' in operation && operation.$in)
            return operation.$in.includes(item[key]);
        // @ts-ignore
        if ('$ne' in operation && operation.$ne)
            return item[key] !== operation.$ne;
        return true;
    }
    storeSearch(data, query) {
        const { $ordering, limit, offset } = query;
        delete query.offset;
        delete query.limit;
        delete query.$ordering;
        for (const [key, operation] of Object.entries(query)) {
            data = data.filter(el => {
                if (typeof operation === 'object')
                    return this.matchOperation(el, key, operation);
                return el[key] === operation;
            });
        }
        if ($ordering) { // @ts-ignore
            return this.storeSort(data, $ordering);
        }
        return data;
    }
    getItemById(id) {
        return this.results.find(el => el.id.toString() === id.toString());
    }
    updateItemById(item) {
        const idx = this.results.findIndex(el => el.id === item.id);
        if (idx === -1)
            return;
        Vue.set(this.results, idx, item);
    }
}
__decorate([
    Mutation
], Service.prototype, "setData", null);
__decorate([
    Mutation
], Service.prototype, "clearItems", null);
__decorate([
    Mutation
], Service.prototype, "addItem", null);
__decorate([
    Mutation
], Service.prototype, "updateItem", null);
__decorate([
    Mutation
], Service.prototype, "removeItem", null);
__decorate([
    Mutation
], Service.prototype, "setFindState", null);
__decorate([
    Mutation
], Service.prototype, "setGetState", null);
__decorate([
    Mutation
], Service.prototype, "setCreateState", null);
__decorate([
    Mutation
], Service.prototype, "setPatchState", null);
__decorate([
    Mutation
], Service.prototype, "setRemoveState", null);
__decorate([
    Action
], Service.prototype, "get", null);
__decorate([
    Action
], Service.prototype, "find", null);
__decorate([
    Action
], Service.prototype, "create", null);
__decorate([
    Action
], Service.prototype, "patch", null);
__decorate([
    Action
], Service.prototype, "remove", null);
