[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ObservationFilter

# Interface: ObservationFilter

Defined in: [src/types/index.ts:1197](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1197)

Options for filtering observations.

 ObservationFilter

## Properties

### afterTimestamp?

> `optional` **afterTimestamp**: `number`

Defined in: [src/types/index.ts:1212](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1212)

Retrieve observations recorded after this Unix timestamp (milliseconds).

***

### beforeTimestamp?

> `optional` **beforeTimestamp**: `number`

Defined in: [src/types/index.ts:1207](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1207)

Retrieve observations recorded before this Unix timestamp (milliseconds).

***

### types?

> `optional` **types**: [`ObservationType`](../enumerations/ObservationType.md)[]

Defined in: [src/types/index.ts:1202](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1202)

An array of `ObservationType` enums to filter by. If provided, only observations matching these types are returned.
