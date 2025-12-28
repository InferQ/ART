[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / AgentOptions

# Interface: AgentOptions

Defined in: [src/types/index.ts:809](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L809)

Options to override agent behavior at runtime.

 AgentOptions

## Properties

### executionConfig?

> `optional` **executionConfig**: [`ExecutionConfig`](ExecutionConfig.md)

Defined in: [src/types/index.ts:856](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L856)

Optional: Configuration for execution phase behavior (TAEF parameters) for this specific call.
Overrides thread and instance-level execution config.

***

### forceTools?

> `optional` **forceTools**: `string`[]

Defined in: [src/types/index.ts:824](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L824)

Force the use of specific tools, potentially overriding the thread's `enabledTools` for this call (use with caution).

***

### llmParams?

> `optional` **llmParams**: `Record`\<`string`, `any`\>

Defined in: [src/types/index.ts:814](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L814)

Override specific LLM parameters (e.g., temperature, max_tokens) for this call only.

***

### overrideModel?

> `optional` **overrideModel**: `object`

Defined in: [src/types/index.ts:829](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L829)

Specify a particular reasoning model to use for this call, overriding the thread's default.

#### model

> **model**: `string`

#### provider

> **provider**: `string`

***

### persona?

> `optional` **persona**: `Partial`\<[`AgentPersona`](AgentPersona.md)\>

Defined in: [src/types/index.ts:850](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L850)

Optional: Defines the identity and high-level guidance for the agent for this specific call.
This overrides both the instance-level and thread-level persona.

***

### promptTemplateId?

> `optional` **promptTemplateId**: `string`

Defined in: [src/types/index.ts:839](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L839)

Override the prompt template used for this specific call.

***

### providerConfig?

> `optional` **providerConfig**: [`RuntimeProviderConfig`](RuntimeProviderConfig.md)

Defined in: [src/types/index.ts:819](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L819)

Override provider configuration for this specific call.

***

### stream?

> `optional` **stream**: `boolean`

Defined in: [src/types/index.ts:834](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L834)

Request a streaming response for this specific agent process call.

***

### systemPrompt?

> `optional` **systemPrompt**: `string` \| [`SystemPromptOverride`](SystemPromptOverride.md)

Defined in: [src/types/index.ts:844](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L844)

Optional system prompt override/tag to override thread, instance, or agent defaults for this specific call.
