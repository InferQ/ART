[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / DeepSeekAdapterOptions

# Interface: DeepSeekAdapterOptions

Defined in: [src/integrations/reasoning/deepseek.ts:16](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/integrations/reasoning/deepseek.ts#L16)

## Properties

### apiBaseUrl?

> `optional` **apiBaseUrl**: `string`

Defined in: [src/integrations/reasoning/deepseek.ts:22](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/integrations/reasoning/deepseek.ts#L22)

Optional: Override the base URL for the DeepSeek API. Defaults to 'https://api.deepseek.com/v1'.

***

### apiKey

> **apiKey**: `string`

Defined in: [src/integrations/reasoning/deepseek.ts:18](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/integrations/reasoning/deepseek.ts#L18)

Your DeepSeek API key. Handle securely.

***

### model?

> `optional` **model**: `string`

Defined in: [src/integrations/reasoning/deepseek.ts:20](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/integrations/reasoning/deepseek.ts#L20)

The default DeepSeek model ID to use (e.g., 'deepseek-chat', 'deepseek-coder'). Defaults to 'deepseek-chat' if not provided.
