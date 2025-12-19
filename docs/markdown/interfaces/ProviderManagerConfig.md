[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ProviderManagerConfig

# Interface: ProviderManagerConfig

Defined in: [src/types/providers.ts:37](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/providers.ts#L37)

Configuration for the ProviderManager passed during ART initialization.

 ProviderManagerConfig

## Properties

### apiInstanceIdleTimeoutSeconds?

> `optional` **apiInstanceIdleTimeoutSeconds**: `number`

Defined in: [src/types/providers.ts:51](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/providers.ts#L51)

Time in seconds an API adapter instance can be idle before being eligible for removal. Default: 300.

***

### availableProviders

> **availableProviders**: [`AvailableProviderEntry`](AvailableProviderEntry.md)[]

Defined in: [src/types/providers.ts:41](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/providers.ts#L41)

***

### maxParallelApiInstancesPerProvider?

> `optional` **maxParallelApiInstancesPerProvider**: `number`

Defined in: [src/types/providers.ts:46](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/providers.ts#L46)

Max concurrent ACTIVE instances per API-based provider NAME. Default: 5.
