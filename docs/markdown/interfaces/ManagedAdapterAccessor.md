[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ManagedAdapterAccessor

# Interface: ManagedAdapterAccessor

Defined in: [src/types/providers.ts:81](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/providers.ts#L81)

Object returned by ProviderManager granting access to an adapter instance.

 ManagedAdapterAccessor

## Properties

### adapter

> **adapter**: [`ProviderAdapter`](ProviderAdapter.md)

Defined in: [src/types/providers.ts:86](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/providers.ts#L86)

The ready-to-use adapter instance.

***

### release()

> **release**: () => `void`

Defined in: [src/types/providers.ts:91](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/providers.ts#L91)

Signals that the current call using this adapter instance is finished.

#### Returns

`void`
