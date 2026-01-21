[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / AvailableProviderEntry

# Interface: AvailableProviderEntry

Defined in: [src/types/providers.ts:10](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/providers.ts#L10)

Entry defining an available provider adapter.

 AvailableProviderEntry

## Properties

### adapter()

> **adapter**: (`options`) => [`ProviderAdapter`](ProviderAdapter.md)

Defined in: [src/types/providers.ts:20](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/providers.ts#L20)

The adapter class.

#### Parameters

##### options

`any`

#### Returns

[`ProviderAdapter`](ProviderAdapter.md)

***

### baseOptions?

> `optional` **baseOptions**: `any`

Defined in: [src/types/providers.ts:25](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/providers.ts#L25)

Optional base config (rarely needed if options are per-call).

***

### isLocal?

> `optional` **isLocal**: `boolean`

Defined in: [src/types/providers.ts:30](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/providers.ts#L30)

Default: false. Determines singleton vs. pooling behavior.

***

### name

> **name**: `string`

Defined in: [src/types/providers.ts:15](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/providers.ts#L15)

Unique key, e.g., 'openai', 'anthropic', 'ollama_local'.
