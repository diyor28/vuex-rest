import { VuexModule } from "vuex-class-modules";
import { AxiosInstance } from "axios";
import { RegisterOptions } from "vuex-class-modules/lib/module-factory";
import { BaseModel, FindResponse, Operation, Pk, Query } from "./rql";
import { Store } from "vuex";
export declare class BaseService extends VuexModule {
    static baseUrl: string;
    protected axiosInstance: AxiosInstance;
    constructor(options: RegisterOptions);
}
export declare class Service<ModelType extends BaseModel> extends BaseService {
    results: ModelType[];
    isGetPending: boolean;
    isFindPending: boolean;
    isCreatePending: boolean;
    isPatchPending: boolean;
    isRemovePending: boolean;
    total: number;
    offset: number;
    limit: number;
    path: string;
    constructor(store: Store<any>, path: string);
    get getStore(): (id: Pk) => ModelType | undefined;
    get findStore(): (query?: Query<ModelType>) => FindResponse<ModelType>;
    setData(data: FindResponse<ModelType>): void;
    clearItems(): void;
    addItem(item: ModelType): void;
    updateItem(item: ModelType): void;
    removeItem(pk: Pk): void;
    setFindState(val: boolean): void;
    setGetState(val: boolean): void;
    setCreateState(val: boolean): void;
    setPatchState(val: boolean): void;
    setRemoveState(val: boolean): void;
    get(id: Pk): Promise<ModelType>;
    find(query?: Query<ModelType>): Promise<FindResponse<ModelType>>;
    create(data: Partial<ModelType>): Promise<ModelType>;
    patch([id, data]: [Pk, Partial<ModelType>]): Promise<ModelType>;
    remove(id: Pk): Promise<undefined>;
    protected storeSort(data: ModelType[], ordering: string): ModelType[];
    protected matchOperation(item: ModelType, key: string, operation: Operation<ModelType, keyof ModelType>): boolean;
    protected storeSearch(data: ModelType[], query: Query<ModelType>): ModelType[];
    protected getItemById(id: Pk): ModelType | undefined;
    protected updateItemById(item: ModelType): void;
}
