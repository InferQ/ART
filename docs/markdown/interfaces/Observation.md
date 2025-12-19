[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / Observation

# Interface: Observation

Defined in: [src/types/index.ts:244](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L244)

Represents a recorded event during the agent's execution.
Observations provide a granular log of the agent's internal state, decisions, and interactions.

 Observation

## Properties

### content

> **content**: `any`

Defined in: [src/types/index.ts:294](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L294)

The main data payload of the observation, structure depends on the `type`.

#### Remarks

Common content shapes by `type`:
- `TITLE`: `{ title: string }` — a concise thread title (<= 10 words)
- `INTENT`: `{ intent: string }`
- `PLAN`: `{ plan: string; rawOutput?: string }`
- `TOOL_CALL`: `{ toolCalls: ParsedToolCall[] }`
- `TOOL_EXECUTION`: `{ callId: string; toolName: string; status: 'success' | 'error'; output?: any; error?: string }`
- `FINAL_RESPONSE`: `{ message: ConversationMessage; uiMetadata?: object }`

***

### id

> **id**: `string`

Defined in: [src/types/index.ts:249](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L249)

A unique identifier for this specific observation record.

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `any`\>

Defined in: [src/types/index.ts:299](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L299)

Optional metadata providing additional context (e.g., source phase, related IDs, status).

***

### parentId?

> `optional` **parentId**: `string`

Defined in: [src/types/index.ts:260](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L260)

An optional identifier for the parent object (e.g., a TodoItem ID) to which this observation belongs.
This allows differentiation between primary (user query) and secondary (sub-task) observations.

***

### threadId

> **threadId**: `string`

Defined in: [src/types/index.ts:254](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L254)

The identifier of the conversation thread this observation relates to.

***

### timestamp

> **timestamp**: `number`

Defined in: [src/types/index.ts:270](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L270)

A Unix timestamp (in milliseconds) indicating when the observation was recorded.

***

### title

> **title**: `string`

Defined in: [src/types/index.ts:280](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L280)

A concise, human-readable title summarizing the observation (often generated based on type/metadata).

***

### traceId?

> `optional` **traceId**: `string`

Defined in: [src/types/index.ts:265](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L265)

An optional identifier for tracing a request across multiple systems or components.

***

### type

> **type**: [`ObservationType`](../enumerations/ObservationType.md)

Defined in: [src/types/index.ts:275](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L275)

The category of the event being observed (e.g., PLAN, THOUGHTS, TOOL_EXECUTION).
