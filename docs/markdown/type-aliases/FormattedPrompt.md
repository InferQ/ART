[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / FormattedPrompt

# ~~Type Alias: FormattedPrompt~~

> **FormattedPrompt** = [`ArtStandardPrompt`](ArtStandardPrompt.md)

Defined in: [src/types/index.ts:1224](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1224)

Represents the prompt data formatted for a specific LLM provider.
Can be a simple string or a complex object (e.g., for OpenAI Chat Completion API).

## Deprecated

Use `ArtStandardPrompt` as the standard intermediate format. ProviderAdapters handle final formatting.
