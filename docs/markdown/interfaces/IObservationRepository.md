[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / IObservationRepository

# Interface: IObservationRepository

Defined in: [src/core/interfaces.ts:515](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L515)

Repository for managing Observations.

## Methods

### addObservation()

> **addObservation**(`observation`): `Promise`\<`void`\>

Defined in: [src/core/interfaces.ts:516](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L516)

#### Parameters

##### observation

[`Observation`](Observation.md)

#### Returns

`Promise`\<`void`\>

***

### getObservations()

> **getObservations**(`threadId`, `filter?`): `Promise`\<[`Observation`](Observation.md)[]\>

Defined in: [src/core/interfaces.ts:517](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L517)

#### Parameters

##### threadId

`string`

##### filter?

[`ObservationFilter`](ObservationFilter.md)

#### Returns

`Promise`\<[`Observation`](Observation.md)[]\>
