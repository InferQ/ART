[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / Observation

# Interface: Observation

Defined in: [src/types/index.ts:202](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L202)

Represents a recorded event during the agent's execution.

 Observation

## Properties

### content

> **content**: `any`

Defined in: [src/types/index.ts:252](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L252)

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

Defined in: [src/types/index.ts:207](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L207)

A unique identifier for this specific observation record.

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `any`\>

Defined in: [src/types/index.ts:257](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L257)

Optional metadata providing additional context (e.g., source phase, related IDs, status).

***

### parentId?

> `optional` **parentId**: `string`

Defined in: [src/types/index.ts:218](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L218)

An optional identifier for the parent object (e.g., a TodoItem ID) to which this observation belongs.
This allows differentiation between primary (user query) and secondary (sub-task) observations.

***

### threadId

> **threadId**: `string`

Defined in: [src/types/index.ts:212](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L212)

The identifier of the conversation thread this observation relates to.

***

### timestamp

> **timestamp**: `number`

Defined in: [src/types/index.ts:228](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L228)

A Unix timestamp (in milliseconds) indicating when the observation was recorded.

***

### title

> **title**: `string`

Defined in: [src/types/index.ts:238](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L238)

A concise, human-readable title summarizing the observation (often generated based on type/metadata).

***

### traceId?

> `optional` **traceId**: `string`

Defined in: [src/types/index.ts:223](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L223)

An optional identifier for tracing a request across multiple systems or components.

***

### type

> **type**: [`ObservationType`](../enumerations/ObservationType.md)

Defined in: [src/types/index.ts:233](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L233)

The category of the event being observed (e.g., PLAN, THOUGHTS, TOOL_EXECUTION).
