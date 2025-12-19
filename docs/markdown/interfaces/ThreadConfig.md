[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ThreadConfig

# Interface: ThreadConfig

Defined in: [src/types/index.ts:639](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L639)

Configuration specific to a conversation thread.
Controls behavior, tools, and provider settings for a particular interaction context.

 ThreadConfig

## Properties

### enabledTools

> **enabledTools**: `string`[]

Defined in: [src/types/index.ts:651](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L651)

An array of tool names (matching `ToolSchema.name`) that are permitted for use within this thread.
Allows for scoping capabilities per conversation.

***

### historyLimit

> **historyLimit**: `number`

Defined in: [src/types/index.ts:657](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L657)

The maximum number of past messages (`ConversationMessage` objects) to retrieve for context.
Helps manage context window limits.

***

### persona?

> `optional` **persona**: `Partial`\<[`AgentPersona`](AgentPersona.md)\>

Defined in: [src/types/index.ts:669](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L669)

Optional: Defines the identity and high-level guidance for the agent for this specific thread.
This overrides the instance-level persona.

***

### providerConfig

> **providerConfig**: [`RuntimeProviderConfig`](RuntimeProviderConfig.md)

Defined in: [src/types/index.ts:645](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L645)

Default provider configuration for this thread.
Determines which LLM and model will be used for reasoning.

***

### systemPrompt?

> `optional` **systemPrompt**: `string` \| [`SystemPromptOverride`](SystemPromptOverride.md)

Defined in: [src/types/index.ts:663](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L663)

Optional system prompt override to be used for this thread, overriding instance or agent defaults.
Allows for thread-specific role instructions.
