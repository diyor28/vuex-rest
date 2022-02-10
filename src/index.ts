import BaseAuthService from "./auth";

export {LoginCredentials} from './auth'
export {BaseService, Service} from "./service";
export {
	BaseModel,
	FindResponse,
	Query,
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
	$axios,
	initializeAxiosInstance,
	getAxiosConfig,
	getAuthHeader,
	requestInterceptor
} from './axios'
export {BaseAuthService}
