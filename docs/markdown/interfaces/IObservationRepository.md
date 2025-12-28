[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / IObservationRepository

# Interface: IObservationRepository

Defined in: [src/core/interfaces.ts:514](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/core/interfaces.ts#L514)

Repository for managing Observations.

## Methods

### addObservation()

> **addObservation**(`observation`): `Promise`\<`void`\>

Defined in: [src/core/interfaces.ts:515](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/core/interfaces.ts#L515)

#### Parameters

##### observation

[`Observation`](Observation.md)

#### Returns

`Promise`\<`void`\>

***

### getObservations()

> **getObservations**(`threadId`, `filter?`): `Promise`\<[`Observation`](Observation.md)[]\>

Defined in: [src/core/interfaces.ts:516](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/core/interfaces.ts#L516)

#### Parameters

##### threadId

`string`

##### filter?

[`ObservationFilter`](ObservationFilter.md)

#### Returns

`Promise`\<[`Observation`](Observation.md)[]\>
