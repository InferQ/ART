[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / LLMMetadata

# Interface: LLMMetadata

Defined in: [src/types/index.ts:406](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L406)

Structure for holding metadata about an LLM call, typically received via a `METADATA` `StreamEvent`
or parsed from a non-streaming response. Fields are optional as availability varies by provider and stream state.

 LLMMetadata

## Properties

### inputTokens?

> `optional` **inputTokens**: `number`

Defined in: [src/types/index.ts:411](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L411)

The number of tokens in the input prompt, if available.

***

### outputTokens?

> `optional` **outputTokens**: `number`

Defined in: [src/types/index.ts:416](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L416)

The number of tokens generated in the output response, if available.

***

### providerRawUsage?

> `optional` **providerRawUsage**: `any`

Defined in: [src/types/index.ts:441](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L441)

Optional raw usage data provided directly by the LLM provider for extensibility (structure depends on provider).

***

### stopReason?

> `optional` **stopReason**: `string`

Defined in: [src/types/index.ts:436](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L436)

The reason the LLM stopped generating tokens (e.g., 'stop_sequence', 'max_tokens', 'tool_calls'), if available.

***

### thinkingTokens?

> `optional` **thinkingTokens**: `number`

Defined in: [src/types/index.ts:421](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L421)

The number of tokens identified as part of the LLM's internal thinking process (if available from provider).

***

### timeToFirstTokenMs?

> `optional` **timeToFirstTokenMs**: `number`

Defined in: [src/types/index.ts:426](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L426)

The time elapsed (in milliseconds) until the first token was generated in a streaming response, if applicable and available.

***

### totalGenerationTimeMs?

> `optional` **totalGenerationTimeMs**: `number`

Defined in: [src/types/index.ts:431](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L431)

The total time elapsed (in milliseconds) for the entire generation process, if available.

***

### traceId?

> `optional` **traceId**: `string`

Defined in: [src/types/index.ts:446](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L446)

The trace ID associated with the LLM call, useful for correlating metadata with the specific request.
