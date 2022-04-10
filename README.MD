## Vuex-rest

A powerful utility to simplify consumption of rest apis
using [RQL](https://connect.cloudblue.com/community/developers/api/rql/).

## Setup

Place the following code in your `store/index.ts`

```javascript
const baseUrl = process.env.VUE_APP_API_ENDPOINT
initializeAxiosInstance(baseUrl)
```

Or in typescript

```typescript
const baseUrl = <string>process.env.VUE_APP_API_ENDPOINT
initializeAxiosInstance(baseUrl)
```

## Usage

```typescript
import {BaseModel, Service} from "@diyor28/vuex-rest";
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

## Nuxt

Include this in your nuxt.config.js

```
{
    plugins: [
       '@diyor28/vuex-rest/dist/nuxt'
    ]
}
```



