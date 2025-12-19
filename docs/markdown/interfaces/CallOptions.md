[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / CallOptions

# Interface: CallOptions

Defined in: [src/types/index.ts:914](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L914)

Options for configuring an LLM call, including streaming and context information.

 CallOptions

## Indexable

\[`key`: `string`\]: `any`

Additional key-value pairs representing provider-specific parameters (e.g., `temperature`, `max_tokens`, `top_p`). These often override defaults set in `ThreadConfig`.

## Properties

### callContext?

> `optional` **callContext**: `string`

Defined in: [src/types/index.ts:947](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L947)

Provides context for the LLM call, allowing adapters to differentiate
between agent-level thoughts and final synthesis calls for token typing.
Agent Core MUST provide this.

***

### providerConfig

> **providerConfig**: [`RuntimeProviderConfig`](RuntimeProviderConfig.md)

Defined in: [src/types/index.ts:957](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L957)

Carries the specific target provider and configuration for this call.

***

### sessionId?

> `optional` **sessionId**: `string`

Defined in: [src/types/index.ts:934](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L934)

Optional session ID.

***

### stream?

> `optional` **stream**: `boolean`

Defined in: [src/types/index.ts:940](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L940)

Request a streaming response from the LLM provider.
Adapters MUST check this flag.

***

### threadId

> **threadId**: `string`

Defined in: [src/types/index.ts:919](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L919)

The mandatory thread ID, used by the ReasoningEngine to fetch thread-specific configuration (e.g., model, params) via StateManager.

***

### traceId?

> `optional` **traceId**: `string`

Defined in: [src/types/index.ts:924](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L924)

Optional trace ID for correlation.

***

### userId?

> `optional` **userId**: `string`

Defined in: [src/types/index.ts:929](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L929)

Optional user ID.
