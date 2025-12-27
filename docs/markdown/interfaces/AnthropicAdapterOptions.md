[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / AnthropicAdapterOptions

# Interface: AnthropicAdapterOptions

Defined in: [src/integrations/reasoning/anthropic.ts:21](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/integrations/reasoning/anthropic.ts#L21)

Configuration options required for the `AnthropicAdapter`.

## Properties

### apiBaseUrl?

> `optional` **apiBaseUrl**: `string`

Defined in: [src/integrations/reasoning/anthropic.ts:27](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/integrations/reasoning/anthropic.ts#L27)

Optional: Override the base URL for the Anthropic API.

***

### apiKey

> **apiKey**: `string`

Defined in: [src/integrations/reasoning/anthropic.ts:23](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/integrations/reasoning/anthropic.ts#L23)

Your Anthropic API key. Handle securely.

***

### defaultMaxTokens?

> `optional` **defaultMaxTokens**: `number`

Defined in: [src/integrations/reasoning/anthropic.ts:29](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/integrations/reasoning/anthropic.ts#L29)

Optional: Default maximum tokens for responses.

***

### defaultTemperature?

> `optional` **defaultTemperature**: `number`

Defined in: [src/integrations/reasoning/anthropic.ts:31](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/integrations/reasoning/anthropic.ts#L31)

Optional: Default temperature for responses.

***

### model?

> `optional` **model**: `string`

Defined in: [src/integrations/reasoning/anthropic.ts:25](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/integrations/reasoning/anthropic.ts#L25)

The default Anthropic model ID to use (e.g., 'claude-3-opus-20240229', 'claude-3-5-sonnet-20240620').
