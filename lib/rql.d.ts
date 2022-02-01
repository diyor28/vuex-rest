export declare type Pk = string | number;
export interface FindResponse<T> {
    total: number;
    limit: number;
    offset: number;
    results: T[];
}
export interface BaseModel {
    id: string;
    [key: string]: any;
}
export interface IRQLExpression<T extends BaseModel, K extends keyof T> {
    $eq?: string | number;
    $ne?: string | number;
    $not?: IRQLExpression<T, K>;
    $gt?: number;
    $ge?: number;
    $lt?: number;
    $le?: number;
    $like?: string;
    $ilike?: string;
    $in?: Array<T[K]>;
    $out?: Array<T[K]>;
    $range?: {
        min: number;
        max: number;
    };
}
export declare type Operation<T extends BaseModel, K extends keyof T> = T[K] | Array<T[K]> | IRQLExpression<T, K>;
export declare type FieldsIRQL<T extends BaseModel> = {
    [K in keyof T]?: Operation<T, K>;
};
export interface IRQL<T> {
    $and?: Array<IRQL<T>>;
    $or?: Array<IRQL<T>>;
    $ordering?: Array<keyof T> | keyof T;
    $select?: Array<keyof T>;
    limit?: number;
    offset?: number;
}
export declare type Query<T extends BaseModel> = IRQL<T> & FieldsIRQL<T>;
