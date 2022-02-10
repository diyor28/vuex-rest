import {AuthTokens, LoginCredentials} from "./auth";

export type Pk = string | number

export interface FindResponse<T> {
    total: number
    limit: number
    offset: number
    results: T[]
}

export interface BaseModel {
    id: string

    [key: string]: any
}

export interface IRQLExpression<T extends BaseModel, K extends keyof T> {
    $eq?: string | number
    $ne?: string | number
    $not?: IRQLExpression<T, K>
    $gt?: number
    $ge?: number
    $lt?: number
    $le?: number
    $like?: string
    $ilike?: string
    $in?: Array<T[K]>
    $out?: Array<T[K]>
    $range?: {
        min: number
        max: number
    }
}

export type Operation<T extends BaseModel, K extends keyof T> = T[K] | Array<T[K]> | IRQLExpression<T, K>

export type FieldsIRQL<T extends BaseModel> = { [K in keyof T]?: Operation<T, K> }

export interface IRQL<T> {
    $and?: Array<IRQL<T>>
    $or?: Array<IRQL<T>>
    $ordering?: Array<keyof T> | keyof T
    $select?: Array<keyof T>
    limit?: number
    offset?: number
}

export type Query<T extends BaseModel> = IRQL<T> & FieldsIRQL<T>

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
