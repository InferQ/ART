[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ObservationSocket

# Class: ObservationSocket

Defined in: [src/systems/ui/observation-socket.ts:19](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/systems/ui/observation-socket.ts#L19)

A specialized `TypedSocket` designed for handling `Observation` data streams.

## Remarks

This socket acts as the bridge between the agent's internal `ObservationManager` and the external UI or monitoring systems.
It extends the generic `TypedSocket` to provide:
1. **Type-Safe Notification**: Specifically handles `Observation` objects.
2. **Specialized Filtering**: Allows subscribers to filter events by `ObservationType` (e.g., only subscribe to 'TOOL_EXECUTION' or 'THOUGHTS').
3. **Historical Access**: Provides a `getHistory` method that leverages the `IObservationRepository` to fetch past observations, enabling UIs to populate initial state.

This class is a key component of the `UISystem`.

## Extends

- [`TypedSocket`](TypedSocket.md)\<[`Observation`](../interfaces/Observation.md), [`ObservationType`](../enumerations/ObservationType.md) \| [`ObservationType`](../enumerations/ObservationType.md)[]\>

## Constructors

### Constructor

> **new ObservationSocket**(`observationRepository?`): `ObservationSocket`

Defined in: [src/systems/ui/observation-socket.ts:26](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/systems/ui/observation-socket.ts#L26)

Creates an instance of ObservationSocket.

#### Parameters

##### observationRepository?

[`IObservationRepository`](../interfaces/IObservationRepository.md)

Optional repository for fetching observation history. If not provided, `getHistory` will return empty arrays.

#### Returns

`ObservationSocket`

#### Overrides

[`TypedSocket`](TypedSocket.md).[`constructor`](TypedSocket.md#constructor)

## Methods

### clearAllSubscriptions()

> **clearAllSubscriptions**(): `void`

Defined in: [src/systems/ui/typed-socket.ts:99](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/systems/ui/typed-socket.ts#L99)

Clears all subscriptions. Useful for cleanup.

#### Returns

`void`

#### Inherited from

[`TypedSocket`](TypedSocket.md).[`clearAllSubscriptions`](TypedSocket.md#clearallsubscriptions)

***

### getHistory()

> **getHistory**(`filter?`, `options?`): `Promise`\<[`Observation`](../interfaces/Observation.md)[]\>

Defined in: [src/systems/ui/observation-socket.ts:69](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/systems/ui/observation-socket.ts#L69)

Retrieves historical observations from the underlying repository.

#### Parameters

##### filter?

Optional `ObservationType` or array of types to filter the history by.

[`ObservationType`](../enumerations/ObservationType.md) | [`ObservationType`](../enumerations/ObservationType.md)[]

##### options?

Required object containing `threadId` and optional `limit`.

###### limit?

`number`

###### threadId?

`string`

#### Returns

`Promise`\<[`Observation`](../interfaces/Observation.md)[]\>

A promise resolving to an array of `Observation` objects matching the criteria.

#### Remarks

This is typically used by UIs when they first connect to a thread to backfill the event log.
It translates the socket's filter criteria into an `ObservationFilter` compatible with the repository.

#### Overrides

[`TypedSocket`](TypedSocket.md).[`getHistory`](TypedSocket.md#gethistory)

***

### notify()

> **notify**(`data`, `options?`, `filterCheck?`): `void`

Defined in: [src/systems/ui/typed-socket.ts:55](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/systems/ui/typed-socket.ts#L55)

Notifies all relevant subscribers with new data.

#### Parameters

##### data

[`Observation`](../interfaces/Observation.md)

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

#### Inherited from

[`TypedSocket`](TypedSocket.md).[`notify`](TypedSocket.md#notify)

***

### notifyObservation()

> **notifyObservation**(`observation`): `void`

Defined in: [src/systems/ui/observation-socket.ts:43](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/systems/ui/observation-socket.ts#L43)

Notifies all eligible subscribers about a new observation.

#### Parameters

##### observation

[`Observation`](../interfaces/Observation.md)

The new `Observation` object to broadcast.

#### Returns

`void`

#### Remarks

This method is called by the `ObservationManager` whenever a new observation is recorded.
It iterates through all active subscriptions and invokes their callbacks if:
1. The subscriber's `targetThreadId` (if any) matches the observation's `threadId`.
2. The subscriber's `filter` (if any) matches the observation's `type`.

***

### subscribe()

> **subscribe**(`callback`, `filter?`, `options?`): [`UnsubscribeFunction`](../type-aliases/UnsubscribeFunction.md)

Defined in: [src/systems/ui/typed-socket.ts:33](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/systems/ui/typed-socket.ts#L33)

Subscribes a callback function to receive notifications.

#### Parameters

##### callback

(`data`) => `void`

The function to call when new data is notified.

##### filter?

An optional filter to only receive specific types of data.

[`ObservationType`](../enumerations/ObservationType.md) | [`ObservationType`](../enumerations/ObservationType.md)[]

##### options?

Optional configuration, like a threadId for filtering.

###### threadId?

`string`

#### Returns

[`UnsubscribeFunction`](../type-aliases/UnsubscribeFunction.md)

An unsubscribe function.

#### Inherited from

[`TypedSocket`](TypedSocket.md).[`subscribe`](TypedSocket.md#subscribe)
