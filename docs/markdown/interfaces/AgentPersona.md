[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / AgentPersona

# Interface: AgentPersona

Defined in: [src/types/index.ts:1852](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1852)

Defines the default identity and high-level guidance for an agent.
This is provided at the instance level and can be overridden by thread or call-specific prompts.

 AgentPersona

## Properties

### name

> **name**: `string`

Defined in: [src/types/index.ts:1858](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1858)

The name or identity of the agent (e.g., "Zoi").
This will be used in the synthesis prompt.

***

### prompts

> **prompts**: [`StageSpecificPrompts`](StageSpecificPrompts.md)

Defined in: [src/types/index.ts:1865](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1865)

The default system prompt that provides high-level guidance.
This serves as the base layer in the system prompt resolution hierarchy.
