[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / AgentOptions

# Interface: AgentOptions

Defined in: [src/types/index.ts:763](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L763)

Options to override agent behavior at runtime during a `process` call.

 AgentOptions

## Properties

### forceTools?

> `optional` **forceTools**: `string`[]

Defined in: [src/types/index.ts:778](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L778)

Force the use of specific tools, potentially overriding the thread's `enabledTools` for this call (use with caution).

***

### llmParams?

> `optional` **llmParams**: `Record`\<`string`, `any`\>

Defined in: [src/types/index.ts:768](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L768)

Override specific LLM parameters (e.g., temperature, max_tokens) for this call only.

***

### overrideModel?

> `optional` **overrideModel**: `object`

Defined in: [src/types/index.ts:783](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L783)

Specify a particular reasoning model to use for this call, overriding the thread's default.

#### model

> **model**: `string`

#### provider

> **provider**: `string`

***

### persona?

> `optional` **persona**: `Partial`\<[`AgentPersona`](AgentPersona.md)\>

Defined in: [src/types/index.ts:804](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L804)

Optional: Defines the identity and high-level guidance for the agent for this specific call.
This overrides both the instance-level and thread-level persona.

***

### promptTemplateId?

> `optional` **promptTemplateId**: `string`

Defined in: [src/types/index.ts:793](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L793)

Override the prompt template used for this specific call.

***

### providerConfig?

> `optional` **providerConfig**: [`RuntimeProviderConfig`](RuntimeProviderConfig.md)

Defined in: [src/types/index.ts:773](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L773)

Override provider configuration for this specific call.

***

### stream?

> `optional` **stream**: `boolean`

Defined in: [src/types/index.ts:788](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L788)

Request a streaming response for this specific agent process call.

***

### systemPrompt?

> `optional` **systemPrompt**: `string` \| [`SystemPromptOverride`](SystemPromptOverride.md)

Defined in: [src/types/index.ts:798](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L798)

Optional system prompt override/tag to override thread, instance, or agent defaults for this specific call.
