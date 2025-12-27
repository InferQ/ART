[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / CallOptions

# Interface: CallOptions

Defined in: [src/types/index.ts:910](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L910)

Options for configuring an LLM call, including streaming and context information.

 CallOptions

## Indexable

\[`key`: `string`\]: `any`

Additional key-value pairs representing provider-specific parameters (e.g., `temperature`, `max_tokens`, `top_p`). These often override defaults set in `ThreadConfig`.

## Properties

### callContext?

> `optional` **callContext**: `string`

Defined in: [src/types/index.ts:945](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L945)

Provides context for the LLM call, identifying which phase of agent execution
is making the request. This determines the tokenType prefix in StreamEvents.

#### Since

0.4.11 - Breaking change: Replaced 'AGENT_THOUGHT' and 'FINAL_SYNTHESIS'
                with phase-specific values.

***

### providerConfig

> **providerConfig**: [`RuntimeProviderConfig`](RuntimeProviderConfig.md)

Defined in: [src/types/index.ts:964](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L964)

Carries the specific target provider and configuration for this call.

***

### sessionId?

> `optional` **sessionId**: `string`

Defined in: [src/types/index.ts:930](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L930)

Optional session ID.

***

### stepContext?

> `optional` **stepContext**: `object`

Defined in: [src/types/index.ts:951](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L951)

Step context for execution phase, passed to StreamEvent for step identification.

#### stepDescription

> **stepDescription**: `string`

#### stepId

> **stepId**: `string`

#### Since

0.4.11 - Only used during execution phase.

***

### stream?

> `optional` **stream**: `boolean`

Defined in: [src/types/index.ts:936](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L936)

Request a streaming response from the LLM provider.
Adapters MUST check this flag.

***

### threadId

> **threadId**: `string`

Defined in: [src/types/index.ts:915](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L915)

The mandatory thread ID, used by the ReasoningEngine to fetch thread-specific configuration (e.g., model, params) via StateManager.

***

### traceId?

> `optional` **traceId**: `string`

Defined in: [src/types/index.ts:920](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L920)

Optional trace ID for correlation.

***

### userId?

> `optional` **userId**: `string`

Defined in: [src/types/index.ts:925](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L925)

Optional user ID.
