[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / IObservationRepository

# Interface: IObservationRepository

Defined in: [src/core/interfaces.ts:515](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L515)

Repository for managing Observations.

## Methods

### addObservation()

> **addObservation**(`observation`): `Promise`\<`void`\>

Defined in: [src/core/interfaces.ts:516](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L516)

#### Parameters

##### observation

[`Observation`](Observation.md)

#### Returns

`Promise`\<`void`\>

***

### getObservations()

> **getObservations**(`threadId`, `filter?`): `Promise`\<[`Observation`](Observation.md)[]\>

Defined in: [src/core/interfaces.ts:517](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L517)

#### Parameters

##### threadId

`string`

##### filter?

[`ObservationFilter`](ObservationFilter.md)

#### Returns

`Promise`\<[`Observation`](Observation.md)[]\>
