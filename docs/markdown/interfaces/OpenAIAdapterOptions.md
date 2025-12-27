[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / OpenAIAdapterOptions

# Interface: OpenAIAdapterOptions

Defined in: [src/integrations/reasoning/openai.ts:54](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/integrations/reasoning/openai.ts#L54)

Configuration options required for the `OpenAIAdapter`.

## Properties

### apiBaseUrl?

> `optional` **apiBaseUrl**: `string`

Defined in: [src/integrations/reasoning/openai.ts:60](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/integrations/reasoning/openai.ts#L60)

Optional: Override the base URL for the OpenAI API (e.g., for Azure OpenAI or custom proxies).

***

### apiKey

> **apiKey**: `string`

Defined in: [src/integrations/reasoning/openai.ts:56](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/integrations/reasoning/openai.ts#L56)

Your OpenAI API key. Handle securely.

***

### defaultMaxTokens?

> `optional` **defaultMaxTokens**: `number`

Defined in: [src/integrations/reasoning/openai.ts:62](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/integrations/reasoning/openai.ts#L62)

Optional: Default maximum tokens for responses.

***

### defaultTemperature?

> `optional` **defaultTemperature**: `number`

Defined in: [src/integrations/reasoning/openai.ts:64](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/integrations/reasoning/openai.ts#L64)

Optional: Default temperature for responses.

***

### model?

> `optional` **model**: `string`

Defined in: [src/integrations/reasoning/openai.ts:58](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/integrations/reasoning/openai.ts#L58)

The default OpenAI model ID to use (e.g., 'gpt-4o', 'gpt-5', 'gpt-5-mini').
