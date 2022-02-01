import { BaseService, Service } from "./service";
import AuthService from './auth';
export { Service, BaseService } from './service';
export { AuthService };
export default function makeServiceClass(baseUrl) {
    BaseService.baseUrl = baseUrl;
    return { BaseService, Service, AuthService };
}
