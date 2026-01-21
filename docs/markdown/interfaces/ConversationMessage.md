[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ConversationMessage

# Interface: ConversationMessage

Defined in: [src/types/index.ts:88](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L88)

Represents a single message within a conversation thread.

 ConversationMessage

## Properties

### content

> **content**: `string`

Defined in: [src/types/index.ts:108](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L108)

The textual content of the message.

***

### messageId

> **messageId**: `string`

Defined in: [src/types/index.ts:93](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L93)

A unique identifier for this specific message.

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `any`\>

Defined in: [src/types/index.ts:118](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L118)

Optional metadata associated with the message (e.g., related observation IDs, tool call info, UI state).

***

### role

> **role**: [`MessageRole`](../enumerations/MessageRole.md)

Defined in: [src/types/index.ts:103](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L103)

The role of the sender (User, AI, System, or Tool).

***

### threadId

> **threadId**: `string`

Defined in: [src/types/index.ts:98](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L98)

The identifier of the conversation thread this message belongs to.

***

### timestamp

> **timestamp**: `number`

Defined in: [src/types/index.ts:113](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L113)

A Unix timestamp (in milliseconds) indicating when the message was created.
