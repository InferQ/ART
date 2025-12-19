[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ITypedSocket

# Interface: ITypedSocket\<DataType, FilterType\>

Defined in: [src/core/interfaces.ts:393](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L393)

Generic interface for a typed publish/subscribe socket.

## Type Parameters

### DataType

`DataType`

### FilterType

`FilterType` = `any`

## Methods

### getHistory()?

> `optional` **getHistory**(`filter?`, `options?`): `Promise`\<`DataType`[]\>

Defined in: [src/core/interfaces.ts:422](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L422)

Optional method to retrieve historical data from the socket's source.

#### Parameters

##### filter?

`FilterType`

Optional filter criteria.

##### options?

Optional configuration like threadId and limit.

###### limit?

`number`

###### threadId?

`string`

#### Returns

`Promise`\<`DataType`[]\>

***

### notify()

> **notify**(`data`, `options?`): `void`

Defined in: [src/core/interfaces.ts:412](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L412)

Notifies subscribers of new data.

#### Parameters

##### data

`DataType`

The data payload.

##### options?

Optional targeting information (e.g., specific thread).

###### targetSessionId?

`string`

###### targetThreadId?

`string`

#### Returns

`void`

***

### subscribe()

> **subscribe**(`callback`, `filter?`, `options?`): () => `void`

Defined in: [src/core/interfaces.ts:401](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L401)

Subscribes a callback function to receive data updates.

#### Parameters

##### callback

(`data`) => `void`

The function to call with new data.

##### filter?

`FilterType`

Optional filter criteria specific to the socket type.

##### options?

Optional configuration like target threadId.

###### threadId?

`string`

#### Returns

An unsubscribe function.

> (): `void`

##### Returns

`void`
