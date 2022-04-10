import BaseAuthService from "./auth";

export {LoginCredentials} from './auth'
export {setStorage, $storage, StorageInterface} from './storage'
export {BaseService, Service} from "./service";
export {Query} from 'js-rql'
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
	$axios,
	initializeAxiosInstance,
	getAxiosConfig,
	getAuthHeader,
	requestInterceptor,
	setAxiosInstance
} from './axios'
export {BaseAuthService}
export {BaseModel} from 'js-rql'
