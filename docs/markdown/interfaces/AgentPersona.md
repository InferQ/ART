[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / AgentPersona

# Interface: AgentPersona

Defined in: [src/types/index.ts:1767](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1767)

Defines the default identity and high-level guidance for an agent.
This is provided at the instance level and can be overridden by thread or call-specific prompts.

 AgentPersona

## Properties

### name

> **name**: `string`

Defined in: [src/types/index.ts:1773](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1773)

The name or identity of the agent (e.g., "Zoi").
This will be used in the synthesis prompt.

***

### prompts

> **prompts**: [`StageSpecificPrompts`](StageSpecificPrompts.md)

Defined in: [src/types/index.ts:1780](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1780)

The default system prompt that provides high-level guidance.
This serves as the base layer in the system prompt resolution hierarchy.
