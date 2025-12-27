[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / GroqAdapter

# Class: GroqAdapter

Defined in: [src/integrations/reasoning/groq.ts:87](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/integrations/reasoning/groq.ts#L87)

Implements the `ProviderAdapter` interface for interacting with Groq's
ultra-fast inference API using the official Groq SDK.

Groq provides an OpenAI-compatible API, making this adapter similar in structure
to the OpenAI adapter but optimized for Groq's specific features and models.

Handles formatting requests, parsing responses, streaming, and tool use.

## See

 - [ProviderAdapter](../interfaces/ProviderAdapter.md) for the interface definition.
 - [GroqAdapterOptions](../interfaces/GroqAdapterOptions.md) for configuration options.

## Implements

- [`ProviderAdapter`](../interfaces/ProviderAdapter.md)

## Constructors

### Constructor

> **new GroqAdapter**(`options`): `GroqAdapter`

Defined in: [src/integrations/reasoning/groq.ts:99](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/integrations/reasoning/groq.ts#L99)

Creates an instance of the GroqAdapter.

#### Parameters

##### options

[`GroqAdapterOptions`](../interfaces/GroqAdapterOptions.md)

Configuration options including the API key and optional model/baseURL/defaults.

#### Returns

`GroqAdapter`

#### Throws

If the API key is missing.

## Properties

### providerName

> `readonly` **providerName**: `"groq"` = `'groq'`

Defined in: [src/integrations/reasoning/groq.ts:88](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/integrations/reasoning/groq.ts#L88)

The unique identifier name for this provider (e.g., 'openai', 'anthropic').

#### Implementation of

[`ProviderAdapter`](../interfaces/ProviderAdapter.md).[`providerName`](../interfaces/ProviderAdapter.md#providername)

## Methods

### call()

> **call**(`prompt`, `options`): `Promise`\<`AsyncIterable`\<[`StreamEvent`](../interfaces/StreamEvent.md), `any`, `any`\>\>

Defined in: [src/integrations/reasoning/groq.ts:124](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/integrations/reasoning/groq.ts#L124)

Sends a request to the Groq Chat Completions API.
Translates `ArtStandardPrompt` to the Groq/OpenAI format and handles streaming and tool use.

#### Parameters

##### prompt

[`ArtStandardPrompt`](../type-aliases/ArtStandardPrompt.md)

The standardized prompt messages.

##### options

[`CallOptions`](../interfaces/CallOptions.md)

Call options, including streaming, model parameters, and tools.

#### Returns

`Promise`\<`AsyncIterable`\<[`StreamEvent`](../interfaces/StreamEvent.md), `any`, `any`\>\>

A promise resolving to an AsyncIterable of StreamEvent objects.

#### Implementation of

[`ProviderAdapter`](../interfaces/ProviderAdapter.md).[`call`](../interfaces/ProviderAdapter.md#call)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/integrations/reasoning/groq.ts:354](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/integrations/reasoning/groq.ts#L354)

Optional: Method for graceful shutdown

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ProviderAdapter`](../interfaces/ProviderAdapter.md).[`shutdown`](../interfaces/ProviderAdapter.md#shutdown)
