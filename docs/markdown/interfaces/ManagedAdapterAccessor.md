[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ManagedAdapterAccessor

# Interface: ManagedAdapterAccessor

Defined in: [src/types/providers.ts:81](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/providers.ts#L81)

Object returned by ProviderManager granting access to an adapter instance.

 ManagedAdapterAccessor

## Properties

### adapter

> **adapter**: [`ProviderAdapter`](ProviderAdapter.md)

Defined in: [src/types/providers.ts:86](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/providers.ts#L86)

The ready-to-use adapter instance.

***

### release()

> **release**: () => `void`

Defined in: [src/types/providers.ts:91](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/providers.ts#L91)

Signals that the current call using this adapter instance is finished.

#### Returns

`void`
