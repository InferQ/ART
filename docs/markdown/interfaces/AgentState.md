[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / AgentState

# Interface: AgentState

Defined in: [src/types/index.ts:680](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L680)

Represents non-configuration state associated with an agent or thread.
This is the persistent memory of the agent, used to store planning progress,
variables, and other dynamic data across execution cycles.

 AgentState

## Indexable

\[`key`: `string`\]: `any`

Allows for other arbitrary properties to be stored in the agent's state.

## Properties

### data

> **data**: `any`

Defined in: [src/types/index.ts:686](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L686)

The primary data payload of the agent's state. 
Structure is application-defined but typically includes the current plan, todo list, etc.

***

### version?

> `optional` **version**: `number`

Defined in: [src/types/index.ts:691](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L691)

An optional version number for the agent's state, useful for migrations or tracking changes.
