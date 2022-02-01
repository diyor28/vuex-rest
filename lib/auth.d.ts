import { BaseService, Service } from "./service";
import { Store } from "vuex";
import { BaseModel } from "./rql";
export interface AccessToken {
    access: string;
}
export interface AuthTokens extends AccessToken {
    refresh: string;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface AuthOptions<User extends BaseModel> {
    store: Store<any>;
    userService: Service<User>;
}
export declare class NoAccessToken extends Error {
    constructor();
}
export default class AuthService<User extends BaseModel> extends BaseService {
    user: User | null;
    userService: BaseService;
    path: string;
    constructor(baseUrl: string, { store, userService }: AuthOptions<User>);
    get isLoggedIn(): () => boolean;
    login({ email, password }: LoginCredentials): Promise<AuthTokens>;
    refresh(): Promise<string>;
    logout(): Promise<void>;
}
