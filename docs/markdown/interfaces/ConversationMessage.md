[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ConversationMessage

# Interface: ConversationMessage

Defined in: [src/types/index.ts:76](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L76)

Represents a single message within a conversation thread.

 ConversationMessage

## Properties

### content

> **content**: `string`

Defined in: [src/types/index.ts:96](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L96)

The textual content of the message.

***

### messageId

> **messageId**: `string`

Defined in: [src/types/index.ts:81](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L81)

A unique identifier for this specific message.

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `any`\>

Defined in: [src/types/index.ts:106](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L106)

Optional metadata associated with the message (e.g., related observation IDs, tool call info, UI state).

***

### role

> **role**: [`MessageRole`](../enumerations/MessageRole.md)

Defined in: [src/types/index.ts:91](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L91)

The role of the sender (User, AI, System, or Tool).

***

### threadId

> **threadId**: `string`

Defined in: [src/types/index.ts:86](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L86)

The identifier of the conversation thread this message belongs to.

***

### timestamp

> **timestamp**: `number`

Defined in: [src/types/index.ts:101](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L101)

A Unix timestamp (in milliseconds) indicating when the message was created.
