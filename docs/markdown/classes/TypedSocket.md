[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / TypedSocket

# Class: TypedSocket\<DataType, FilterType\>

Defined in: [src/systems/ui/typed-socket.ts:19](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/systems/ui/typed-socket.ts#L19)

A generic class for implementing a publish/subscribe pattern with filtering capabilities.
Designed for decoupling components, particularly UI updates from backend events.

## Extended by

- [`ConversationSocket`](ConversationSocket.md)
- [`ObservationSocket`](ObservationSocket.md)
- [`LLMStreamSocket`](LLMStreamSocket.md)
- [`A2ATaskSocket`](A2ATaskSocket.md)

## Type Parameters

### DataType

`DataType`

### FilterType

`FilterType` = `any`

## Constructors

### Constructor

> **new TypedSocket**\<`DataType`, `FilterType`\>(): `TypedSocket`\<`DataType`, `FilterType`\>

Defined in: [src/systems/ui/typed-socket.ts:23](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/systems/ui/typed-socket.ts#L23)

#### Returns

`TypedSocket`\<`DataType`, `FilterType`\>

## Methods

### clearAllSubscriptions()

> **clearAllSubscriptions**(): `void`

Defined in: [src/systems/ui/typed-socket.ts:100](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/systems/ui/typed-socket.ts#L100)

Clears all subscriptions. Useful for cleanup.

#### Returns

`void`

***

### getHistory()?

> `optional` **getHistory**(`_filter?`, `_options?`): `Promise`\<`DataType`[]\>

Defined in: [src/systems/ui/typed-socket.ts:92](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/systems/ui/typed-socket.ts#L92)

Optional: Retrieves historical data. This base implementation is empty.
Subclasses might implement this by interacting with repositories.

#### Parameters

##### \_filter?

`FilterType`

##### \_options?

###### limit?

`number`

###### threadId?

`string`

#### Returns

`Promise`\<`DataType`[]\>

***

### notify()

> **notify**(`data`, `options?`, `filterCheck?`): `void`

Defined in: [src/systems/ui/typed-socket.ts:56](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/systems/ui/typed-socket.ts#L56)

Notifies all relevant subscribers with new data.

#### Parameters

##### data

`DataType`

The data payload to send to subscribers.

##### options?

Optional targeting options (e.g., targetThreadId).

###### targetSessionId?

`string`

###### targetThreadId?

`string`

##### filterCheck?

(`data`, `filter?`) => `boolean`

A function to check if a subscription's filter matches the data.

#### Returns

`void`

***

### subscribe()

> **subscribe**(`callback`, `filter?`, `options?`): [`UnsubscribeFunction`](../type-aliases/UnsubscribeFunction.md)

Defined in: [src/systems/ui/typed-socket.ts:34](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/systems/ui/typed-socket.ts#L34)

Subscribes a callback function to receive notifications.

#### Parameters

##### callback

(`data`) => `void`

The function to call when new data is notified.

##### filter?

`FilterType`

An optional filter to only receive specific types of data.

##### options?

Optional configuration, like a threadId for filtering.

###### threadId?

`string`

#### Returns

[`UnsubscribeFunction`](../type-aliases/UnsubscribeFunction.md)

An unsubscribe function.
