import BaseAuthService from "./auth";
import app from './app'

export {LoginCredentials, JWTAuth} from './auth'
export {BaseService, Service} from "./service";
export {Query, BaseModel} from 'js-rql'
export {
	FindResponse,
	Pk,
	ServiceState,
	GetterGet,
	GetterFind,
	MutationSetData,
	MutationClearItems,
	MutationAddItem,
	MutationUpdateItem,
	MutationRemoveItem,
	MutationSetFindState,
	MutationSetGetState,
	MutationSetCreateState,
	MutationSetPatchState,
	MutationSetRemoveState,
	ActionGet,
	ActionFind,
	ActionCreate,
	ActionPatch,
	ActionRemove,
	ActionRefresh,
	ActionLogin
} from './types'
export {strip} from './utils'
export {
	getAxiosConfig,
	getAuthHeader,
	requestInterceptor
} from './axios'
export {BaseAuthService}
export default app;
