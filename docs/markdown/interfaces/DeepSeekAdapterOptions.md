[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / DeepSeekAdapterOptions

# Interface: DeepSeekAdapterOptions

Defined in: [src/integrations/reasoning/deepseek.ts:16](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/integrations/reasoning/deepseek.ts#L16)

## Properties

### apiBaseUrl?

> `optional` **apiBaseUrl**: `string`

Defined in: [src/integrations/reasoning/deepseek.ts:22](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/integrations/reasoning/deepseek.ts#L22)

Optional: Override the base URL for the DeepSeek API. Defaults to 'https://api.deepseek.com/v1'.

***

### apiKey

> **apiKey**: `string`

Defined in: [src/integrations/reasoning/deepseek.ts:18](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/integrations/reasoning/deepseek.ts#L18)

Your DeepSeek API key. Handle securely.

***

### model?

> `optional` **model**: `string`

Defined in: [src/integrations/reasoning/deepseek.ts:20](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/integrations/reasoning/deepseek.ts#L20)

The default DeepSeek model ID to use (e.g., 'deepseek-chat', 'deepseek-coder'). Defaults to 'deepseek-chat' if not provided.
