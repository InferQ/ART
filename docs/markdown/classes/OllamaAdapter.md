[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / OllamaAdapter

# Class: OllamaAdapter

Defined in: [src/integrations/reasoning/ollama.ts:100](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/integrations/reasoning/ollama.ts#L100)

Implements the `ProviderAdapter` interface for interacting with Ollama's
OpenAI-compatible API endpoint.

Handles formatting requests, parsing responses, streaming, and tool use.

## See

 - [ProviderAdapter](../interfaces/ProviderAdapter.md) for the interface definition.
 - [OllamaAdapterOptions](../interfaces/OllamaAdapterOptions.md) for configuration options.

## Implements

- [`ProviderAdapter`](../interfaces/ProviderAdapter.md)

## Constructors

### Constructor

> **new OllamaAdapter**(`options`): `OllamaAdapter`

Defined in: [src/integrations/reasoning/ollama.ts:110](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/integrations/reasoning/ollama.ts#L110)

Creates an instance of the OllamaAdapter.

#### Parameters

##### options

[`OllamaAdapterOptions`](../interfaces/OllamaAdapterOptions.md)

Configuration options.

#### Returns

`OllamaAdapter`

## Properties

### providerName

> `readonly` **providerName**: `"ollama"` = `'ollama'`

Defined in: [src/integrations/reasoning/ollama.ts:101](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/integrations/reasoning/ollama.ts#L101)

The unique identifier name for this provider (e.g., 'openai', 'anthropic').

#### Implementation of

[`ProviderAdapter`](../interfaces/ProviderAdapter.md).[`providerName`](../interfaces/ProviderAdapter.md#providername)

## Methods

### call()

> **call**(`prompt`, `options`): `Promise`\<`AsyncIterable`\<[`StreamEvent`](../interfaces/StreamEvent.md), `any`, `any`\>\>

Defined in: [src/integrations/reasoning/ollama.ts:134](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/integrations/reasoning/ollama.ts#L134)

Sends a request to the Ollama API.
Translates `ArtStandardPrompt` to the OpenAI format and handles streaming and tool use.

#### Parameters

##### prompt

[`ArtStandardPrompt`](../type-aliases/ArtStandardPrompt.md)

The standardized prompt messages.

##### options

[`CallOptions`](../interfaces/CallOptions.md)

Call options.

#### Returns

`Promise`\<`AsyncIterable`\<[`StreamEvent`](../interfaces/StreamEvent.md), `any`, `any`\>\>

A promise resolving to an AsyncIterable of StreamEvent objects.

#### Implementation of

[`ProviderAdapter`](../interfaces/ProviderAdapter.md).[`call`](../interfaces/ProviderAdapter.md#call)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/integrations/reasoning/ollama.ts:514](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/integrations/reasoning/ollama.ts#L514)

Optional method for graceful shutdown. For Ollama, which is typically a separate
local server, this adapter doesn't manage persistent connections that need explicit closing.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the shutdown is complete.

#### Implementation of

[`ProviderAdapter`](../interfaces/ProviderAdapter.md).[`shutdown`](../interfaces/ProviderAdapter.md#shutdown)
