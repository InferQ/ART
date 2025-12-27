[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / AgentState

# Interface: AgentState

Defined in: [src/types/index.ts:665](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L665)

Represents non-configuration state associated with an agent or thread.
Could include user preferences, accumulated knowledge, etc. (Less defined for v1.0)

 AgentState

## Indexable

\[`key`: `string`\]: `any`

Allows for other arbitrary properties to be stored in the agent's state.

## Properties

### data

> **data**: `any`

Defined in: [src/types/index.ts:670](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L670)

The primary data payload of the agent's state. Structure is application-defined.

***

### version?

> `optional` **version**: `number`

Defined in: [src/types/index.ts:675](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L675)

An optional version number for the agent's state, useful for migrations or tracking changes.
