[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / A2AAgentInfo

# Interface: A2AAgentInfo

Defined in: [src/types/index.ts:1387](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1387)

Represents agent information for A2A task assignment.

 A2AAgentInfo

## Properties

### agentId

> **agentId**: `string`

Defined in: [src/types/index.ts:1392](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1392)

Unique identifier for the agent.

***

### agentName

> **agentName**: `string`

Defined in: [src/types/index.ts:1397](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1397)

Human-readable name for the agent.

***

### agentType

> **agentType**: `string`

Defined in: [src/types/index.ts:1402](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1402)

The type or role of the agent (e.g., 'reasoning', 'data-processing', 'synthesis').

***

### authentication?

> `optional` **authentication**: `object`

Defined in: [src/types/index.ts:1422](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1422)

Authentication configuration for communicating with the agent.

#### apiKey?

> `optional` **apiKey**: `string`

API key for authorization (if type is 'api_key').

#### token?

> `optional` **token**: `string`

Bearer token for authorization (if type is 'bearer').

#### type

> **type**: `"bearer"` \| `"api_key"` \| `"none"`

Type of authentication required.

***

### capabilities?

> `optional` **capabilities**: `string`[]

Defined in: [src/types/index.ts:1412](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1412)

Agent capabilities or specializations.

***

### endpoint?

> `optional` **endpoint**: `string`

Defined in: [src/types/index.ts:1407](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1407)

Base URL or endpoint for communicating with the agent.

***

### status?

> `optional` **status**: `"available"` \| `"busy"` \| `"offline"`

Defined in: [src/types/index.ts:1417](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1417)

Current load or availability status of the agent.
