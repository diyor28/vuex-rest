import {BaseService, Service} from "./service";
import AuthService from './auth'
export {Service, BaseService} from './service'
export {AuthService}
export {BaseModel, FindResponse, FieldsIRQL, Pk} from './rql'

export default function makeServiceClass(baseUrl: string) {
    BaseService.baseUrl = baseUrl
    return {BaseService, Service, AuthService}
}
