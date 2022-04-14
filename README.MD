## Vuex-rest

A powerful utility to simplify consumption of rest apis
using [RQL](https://connect.cloudblue.com/community/developers/api/rql/).

## Setup

Place the following code in your `store/index.ts`

```typescript
import {JWTAuth} from "vuex-rql";

const baseUrl = <string>process.env.VUE_APP_API_ENDPOINT
import app from 'vuex-rql'

app.configureAxios(baseUrl).configureAuth(JWTAuth({
    path: baseUrl + '/authentication/',
    refreshPath: baseUrl + '/authentication/refresh/',
    storage: localStorage
}))
```

## Usage
Create the users service

```typescript
// store/services/user.ts

import {BaseModel, Service} from "vuex-rql";
import {Module} from "vuex-module-decorators";

export interface User extends BaseModel {
	email: string
	first_name: string
	last_name: string
}

@Module({name: 'users', namespaced: true})
export default class UserService extends Service<User> {
	path = 'users/'
}
```

Create the authentication service

```typescript
// store/auth.ts

import {BaseAuthService} from "vue-rql";
import {User} from "@/store/services/user";
import {Module} from "vuex-module-decorators";

@Module({name: 'auth', namespaced: true})
export default class AuthService extends BaseAuthService<User> {
}
```

And finally connect everything to the store

```typescript
interface RootState {
	users: ServiceState<User>,
}

const store = new Vuex.Store<RootState>({
	mutations: {},
	actions: {},
	modules: {
		'auth': AuthService,
		'users': UserService,
	}
})

export const usersService = getModule(UserService, store)
export const authService = getModule(AuthService, store)
```

You can now import it in your vue component and use in the following fashion

```typescript
import {usersService} from '@/store'
usersService.find().then(data => {
	// do stuff
})

const data = usersService.findStore({}).results // acess data from store
```

## Querying

## $eq

Find users with name John: 
```typescript
usersService.findStore({name: 'John'})
```
or
```typescript
usersService.findStore({name: {$eq: 'John'}})
```

## $gt, $lt, $le, $ge
Find users between ages 18 and 65 inclusive

```typescript
usersService.findStore({age: {$ge: 18, $le: 65}})
```
or exclusive
```typescript
usersService.findStore({age: {$gt: 18, $lt: 65}})
```

## $select
Return specific fields
```typescript
usersService.findStore({$select: ['name', 'age']})
```

## $like
Search for users with name John
```typescript
usersService.findStore({name: {$like: 'John'}})
```

## $ilike
Search for users with name John (case in-sensitive):
```typescript
usersService.findStore({name: {$ilike: 'john'}})
```

## $in, $out
Search for users where the property does ($in) or does not ($out) match any of the given values:
```typescript
usersService.findStore({roleId: {$in: [2, 5]}})
```
or
```typescript
usersService.findStore({roleId: {$out: [2, 5]}})
```

## $or
Combine multiple queries using logical `OR`
```typescript
usersService.findStore({$or: [
        {age: {$gt: 18, $lt: 65}},
        {active: {$eq: true}}
    ]})
```

