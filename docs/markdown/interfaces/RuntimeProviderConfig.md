[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / RuntimeProviderConfig

# Interface: RuntimeProviderConfig

Defined in: [src/types/providers.ts:58](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/providers.ts#L58)

Configuration passed AT RUNTIME for a specific LLM call.

 RuntimeProviderConfig

## Properties

### adapterOptions

> **adapterOptions**: `any`

Defined in: [src/types/providers.ts:73](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/providers.ts#L73)

Specific options for THIS instance (apiKey, temperature, contextSize, baseUrl, etc.).

***

### modelId

> **modelId**: `string`

Defined in: [src/types/providers.ts:68](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/providers.ts#L68)

Specific model identifier (e.g., 'gpt-4o', 'llama3:latest').

***

### providerName

> **providerName**: `string`

Defined in: [src/types/providers.ts:63](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/providers.ts#L63)

Must match a name in AvailableProviderEntry.
