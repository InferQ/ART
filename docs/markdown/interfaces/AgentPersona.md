[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / AgentPersona

# Interface: AgentPersona

Defined in: [src/types/index.ts:1755](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1755)

Defines the default identity and high-level guidance for an agent.
This is provided at the instance level and can be overridden by thread or call-specific prompts.

 AgentPersona

## Properties

### name

> **name**: `string`

Defined in: [src/types/index.ts:1761](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1761)

The name or identity of the agent (e.g., "Zoi").
This will be used in the synthesis prompt.

***

### prompts

> **prompts**: [`StageSpecificPrompts`](StageSpecificPrompts.md)

Defined in: [src/types/index.ts:1768](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1768)

The default system prompt that provides high-level guidance.
This serves as the base layer in the system prompt resolution hierarchy.
