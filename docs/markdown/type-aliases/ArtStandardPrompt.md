[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ArtStandardPrompt

# Type Alias: ArtStandardPrompt

> **ArtStandardPrompt** = [`ArtStandardMessage`](../interfaces/ArtStandardMessage.md)[]

Defined in: [src/types/index.ts:1055](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1055)

Represents the entire prompt as an array of standardized messages (`ArtStandardMessage`).

## Remarks

Constructed by agent logic (e.g., `PESAgent`) and optionally validated via
`PromptManager.validatePrompt` before being sent to the `ReasoningEngine` and
translated by a `ProviderAdapter` for provider-specific API formats.
