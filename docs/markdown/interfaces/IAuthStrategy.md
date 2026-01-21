[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / IAuthStrategy

# Interface: IAuthStrategy

Defined in: [src/core/interfaces.ts:606](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L606)

Interface for an authentication strategy that can provide authorization headers.
This enables pluggable security for remote service connections (MCP servers, A2A agents, etc.)

## Methods

### getAuthHeaders()

> **getAuthHeaders**(): `Promise`\<`Record`\<`string`, `string`\>\>

Defined in: [src/core/interfaces.ts:613](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L613)

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

Defined in: [src/core/interfaces.ts:619](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L619)

Optional: Handles the redirect from the authentication server.

#### Returns

`Promise`\<`void`\>

***

### isAuthenticated()?

> `optional` **isAuthenticated**(): `Promise`\<`boolean`\>

Defined in: [src/core/interfaces.ts:625](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L625)

Optional: Checks if the user is authenticated.

#### Returns

`Promise`\<`boolean`\>

***

### login()?

> `optional` **login**(): `Promise`\<`void`\>

Defined in: [src/core/interfaces.ts:616](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L616)

Optional: Initiates the login flow for the strategy.

#### Returns

`Promise`\<`void`\>

***

### logout()?

> `optional` **logout**(): `void`

Defined in: [src/core/interfaces.ts:622](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L622)

Optional: Logs the user out.

#### Returns

`void`
