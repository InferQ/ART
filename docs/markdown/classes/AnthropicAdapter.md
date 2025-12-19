[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / AnthropicAdapter

# Class: AnthropicAdapter

Defined in: [src/integrations/reasoning/anthropic.ts:49](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/anthropic.ts#L49)

Implements the `ProviderAdapter` interface for interacting with Anthropic's
Messages API (Claude models) using the official SDK.

Handles formatting requests, parsing responses, streaming, and tool use.

## See

 - [ProviderAdapter](../interfaces/ProviderAdapter.md) for the interface definition.
 - [AnthropicAdapterOptions](../interfaces/AnthropicAdapterOptions.md) for configuration options.

## Implements

- [`ProviderAdapter`](../interfaces/ProviderAdapter.md)

## Constructors

### Constructor

> **new AnthropicAdapter**(`options`): `AnthropicAdapter`

Defined in: [src/integrations/reasoning/anthropic.ts:61](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/anthropic.ts#L61)

Creates an instance of the AnthropicAdapter.

#### Parameters

##### options

[`AnthropicAdapterOptions`](../interfaces/AnthropicAdapterOptions.md)

Configuration options including the API key and optional model/baseURL/defaults.

#### Returns

`AnthropicAdapter`

#### Throws

If the API key is missing.

## Properties

### providerName

> `readonly` **providerName**: `"anthropic"` = `'anthropic'`

Defined in: [src/integrations/reasoning/anthropic.ts:50](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/anthropic.ts#L50)

The unique identifier name for this provider (e.g., 'openai', 'anthropic').

#### Implementation of

[`ProviderAdapter`](../interfaces/ProviderAdapter.md).[`providerName`](../interfaces/ProviderAdapter.md#providername)

## Methods

### call()

> **call**(`prompt`, `options`): `Promise`\<`AsyncIterable`\<[`StreamEvent`](../interfaces/StreamEvent.md), `any`, `any`\>\>

Defined in: [src/integrations/reasoning/anthropic.ts:88](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/anthropic.ts#L88)

Sends a request to the Anthropic Messages API.
Translates `ArtStandardPrompt` to the Anthropic format and handles streaming and tool use.

#### Parameters

##### prompt

[`ArtStandardPrompt`](../type-aliases/ArtStandardPrompt.md)

The standardized prompt messages.

##### options

[`CallOptions`](../interfaces/CallOptions.md)

Call options, including `threadId`, `traceId`, `stream`, `callContext`,
                               `model` (override), `tools` (available tools), and Anthropic-specific
                               generation parameters from `providerConfig.adapterOptions`.

#### Returns

`Promise`\<`AsyncIterable`\<[`StreamEvent`](../interfaces/StreamEvent.md), `any`, `any`\>\>

A promise resolving to an AsyncIterable of StreamEvent objects.

#### Implementation of

[`ProviderAdapter`](../interfaces/ProviderAdapter.md).[`call`](../interfaces/ProviderAdapter.md#call)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [src/integrations/reasoning/anthropic.ts:424](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/anthropic.ts#L424)

Optional: Method for graceful shutdown

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ProviderAdapter`](../interfaces/ProviderAdapter.md).[`shutdown`](../interfaces/ProviderAdapter.md#shutdown)
