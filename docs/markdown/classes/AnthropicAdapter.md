[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / AnthropicAdapter

# Class: AnthropicAdapter

Defined in: [src/integrations/reasoning/anthropic.ts:81](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/integrations/reasoning/anthropic.ts#L81)

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

Defined in: [src/integrations/reasoning/anthropic.ts:93](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/integrations/reasoning/anthropic.ts#L93)

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

Defined in: [src/integrations/reasoning/anthropic.ts:82](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/integrations/reasoning/anthropic.ts#L82)

The unique identifier name for this provider (e.g., 'openai', 'anthropic').

#### Implementation of

[`ProviderAdapter`](../interfaces/ProviderAdapter.md).[`providerName`](../interfaces/ProviderAdapter.md#providername)

## Methods

### call()

> **call**(`prompt`, `options`): `Promise`\<`AsyncIterable`\<[`StreamEvent`](../interfaces/StreamEvent.md), `any`, `any`\>\>

Defined in: [src/integrations/reasoning/anthropic.ts:120](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/integrations/reasoning/anthropic.ts#L120)

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

Defined in: [src/integrations/reasoning/anthropic.ts:487](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/integrations/reasoning/anthropic.ts#L487)

Optional: Method for graceful shutdown

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ProviderAdapter`](../interfaces/ProviderAdapter.md).[`shutdown`](../interfaces/ProviderAdapter.md#shutdown)
