[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / FormattedPrompt

# ~~Type Alias: FormattedPrompt~~

> **FormattedPrompt** = [`ArtStandardPrompt`](ArtStandardPrompt.md)

Defined in: [src/types/index.ts:1132](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1132)

Represents the prompt data formatted for a specific LLM provider.
Can be a simple string or a complex object (e.g., for OpenAI Chat Completion API).

## Deprecated

Use `ArtStandardPrompt` as the standard intermediate format. ProviderAdapters handle final formatting.
