[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / OpenAIAdapter

# Class: OpenAIAdapter

Defined in: [src/integrations/reasoning/openai.ts:109](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/openai.ts#L109)

Implements the `ProviderAdapter` interface for interacting with OpenAI's
Responses API (supports reasoning models like GPT-5 family and other models).

Handles formatting requests, parsing responses, streaming, reasoning token detection, and tool use.
Uses the official OpenAI SDK with the new Responses API for full reasoning model support.

## See

 - [ProviderAdapter](../interfaces/ProviderAdapter.md) for the interface definition.
 - [OpenAIAdapterOptions](../interfaces/OpenAIAdapterOptions.md) for configuration options.

## Implements

- [`ProviderAdapter`](../interfaces/ProviderAdapter.md)

## Constructors

### Constructor

> **new OpenAIAdapter**(`options`): `OpenAIAdapter`

Defined in: [src/integrations/reasoning/openai.ts:121](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/openai.ts#L121)

Creates an instance of the OpenAIAdapter.

#### Parameters

##### options

[`OpenAIAdapterOptions`](../interfaces/OpenAIAdapterOptions.md)

Configuration options including the API key and optional model/baseURL/defaults.

#### Returns

`OpenAIAdapter`

#### Throws

If the API key is missing.

## Properties

### providerName

> `readonly` **providerName**: `"openai"` = `'openai'`

Defined in: [src/integrations/reasoning/openai.ts:110](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/openai.ts#L110)

The unique identifier name for this provider (e.g., 'openai', 'anthropic').

#### Implementation of

[`ProviderAdapter`](../interfaces/ProviderAdapter.md).[`providerName`](../interfaces/ProviderAdapter.md#providername)

## Methods

### call()

> **call**(`prompt`, `options`): `Promise`\<`AsyncIterable`\<[`StreamEvent`](../interfaces/StreamEvent.md), `any`, `any`\>\>

Defined in: [src/integrations/reasoning/openai.ts:146](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/openai.ts#L146)

Sends a request to the OpenAI Responses API.
Translates `ArtStandardPrompt` to the Responses API format and handles streaming/reasoning.

#### Parameters

##### prompt

[`ArtStandardPrompt`](../type-aliases/ArtStandardPrompt.md)

The standardized prompt messages.

##### options

[`CallOptions`](../interfaces/CallOptions.md)

Call options, including streaming, reasoning options, and model parameters.

#### Returns

`Promise`\<`AsyncIterable`\<[`StreamEvent`](../interfaces/StreamEvent.md), `any`, `any`\>\>

A promise resolving to an AsyncIterable of StreamEvent objects.

#### Implementation of

[`ProviderAdapter`](../interfaces/ProviderAdapter.md).[`call`](../interfaces/ProviderAdapter.md#call)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/integrations/reasoning/openai.ts:405](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/openai.ts#L405)

Optional: Method for graceful shutdown

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ProviderAdapter`](../interfaces/ProviderAdapter.md).[`shutdown`](../interfaces/ProviderAdapter.md#shutdown)
