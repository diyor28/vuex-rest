import {AuthTokens, LoginCredentials} from "./auth";
import {BaseModel, Query} from "js-rql";

export type Pk = string | number

export interface FindResponse<T> {
    total: number
    limit: number
    offset: number
    results: T[]
}


export interface ServiceState<ModelType extends BaseModel> {
    results: Array<ModelType>
    isGetPending: boolean
    isFindPending: boolean
    isCreatePending: boolean
    isPatchPending: boolean
    isRemovePending: boolean
    total: number
    offset: number
    limit: number
}

export type GetterGet<Model extends BaseModel> = (id: Pk) => Model | undefined
export type GetterFind<Model extends BaseModel> = (query: Query<Model>) => FindResponse<Model>
export type MutationSetData<Model extends BaseModel> = (data: FindResponse<Model>) => void
export type MutationClearItems = () => void
export type MutationAddItem<Model extends BaseModel> = (item: Model) => void
export type MutationUpdateItem<Model extends BaseModel> = (item: Model) => void
export type MutationRemoveItem = (pk: Pk) => void
export type MutationSetFindState = (val: boolean) => void
export type MutationSetGetState = (val: boolean) => void
export type MutationSetCreateState = (val: boolean) => void
export type MutationSetPatchState = (val: boolean) => void
export type MutationSetRemoveState = (val: boolean) => void
export type ActionGet<Model extends BaseModel> = (id: Pk) => Promise<Model>
export type ActionFind<Model extends BaseModel> = (query?: Query<Model>) => Promise<FindResponse<Model>>
export type ActionCreate<Model extends BaseModel> = (data: Partial<Model>) => Promise<Model>
export type ActionPatch<Model extends BaseModel> = ([id, data]: [Pk, Partial<Model>]) => Promise<Model>
export type ActionRemove<Model extends BaseModel> = (id: Pk) => Promise<undefined>
export type ActionRefresh = () => Promise<string>
export type ActionLogin = ({email, password}: LoginCredentials) => Promise<AuthTokens>
