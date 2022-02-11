import {isNode} from "./utils";

export interface StorageInterface {
    getItem: (key: string) => string | null
    setItem: (key: string, value: string) => void
    removeItem: (key: string) => void
}

export let $storage: StorageInterface;
if (isNode()) {
    $storage = <any>{
        _storage: {},
        getItem(key: string) {
            return this._storage[key]
        },
        setItem(key: string, value: string) {
            this._storage[key] = value
        },
        removeItem(key: string) {
            delete this._storage[key]
        }
    }
} else {
    $storage = localStorage
}

export function setStorage(storage: StorageInterface) {
    $storage = storage
}
