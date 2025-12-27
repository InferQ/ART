[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / IAuthStrategy

# Interface: IAuthStrategy

Defined in: [src/core/interfaces.ts:607](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L607)

Interface for an authentication strategy that can provide authorization headers.
This enables pluggable security for remote service connections (MCP servers, A2A agents, etc.)

## Methods

### getAuthHeaders()

> **getAuthHeaders**(): `Promise`\<`Record`\<`string`, `string`\>\>

Defined in: [src/core/interfaces.ts:614](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L614)

Asynchronously retrieves the authentication headers.
This might involve checking a cached token, refreshing it if expired, and then returning it.

#### Returns

`Promise`\<`Record`\<`string`, `string`\>\>

A promise that resolves to a record of header keys and values.

#### Throws

If authentication fails or cannot be obtained.

***

### handleRedirect()?

> `optional` **handleRedirect**(): `Promise`\<`void`\>

Defined in: [src/core/interfaces.ts:620](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L620)

Optional: Handles the redirect from the authentication server.

#### Returns

`Promise`\<`void`\>

***

### isAuthenticated()?

> `optional` **isAuthenticated**(): `Promise`\<`boolean`\>

Defined in: [src/core/interfaces.ts:626](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L626)

Optional: Checks if the user is authenticated.

#### Returns

`Promise`\<`boolean`\>

***

### login()?

> `optional` **login**(): `Promise`\<`void`\>

Defined in: [src/core/interfaces.ts:617](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L617)

Optional: Initiates the login flow for the strategy.

#### Returns

`Promise`\<`void`\>

***

### logout()?

> `optional` **logout**(): `void`

Defined in: [src/core/interfaces.ts:623](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L623)

Optional: Logs the user out.

#### Returns

`void`
