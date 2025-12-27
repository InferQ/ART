[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / Observation

# Interface: Observation

Defined in: [src/types/index.ts:190](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L190)

Represents a recorded event during the agent's execution.

 Observation

## Properties

### content

> **content**: `any`

Defined in: [src/types/index.ts:240](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L240)

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

Defined in: [src/types/index.ts:195](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L195)

A unique identifier for this specific observation record.

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `any`\>

Defined in: [src/types/index.ts:245](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L245)

Optional metadata providing additional context (e.g., source phase, related IDs, status).

***

### parentId?

> `optional` **parentId**: `string`

Defined in: [src/types/index.ts:206](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L206)

An optional identifier for the parent object (e.g., a TodoItem ID) to which this observation belongs.
This allows differentiation between primary (user query) and secondary (sub-task) observations.

***

### threadId

> **threadId**: `string`

Defined in: [src/types/index.ts:200](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L200)

The identifier of the conversation thread this observation relates to.

***

### timestamp

> **timestamp**: `number`

Defined in: [src/types/index.ts:216](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L216)

A Unix timestamp (in milliseconds) indicating when the observation was recorded.

***

### title

> **title**: `string`

Defined in: [src/types/index.ts:226](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L226)

A concise, human-readable title summarizing the observation (often generated based on type/metadata).

***

### traceId?

> `optional` **traceId**: `string`

Defined in: [src/types/index.ts:211](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L211)

An optional identifier for tracing a request across multiple systems or components.

***

### type

> **type**: [`ObservationType`](../enumerations/ObservationType.md)

Defined in: [src/types/index.ts:221](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L221)

The category of the event being observed (e.g., PLAN, THOUGHTS, TOOL_EXECUTION).
