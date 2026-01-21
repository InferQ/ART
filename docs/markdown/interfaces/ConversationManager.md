[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ConversationManager

# Interface: ConversationManager

Defined in: [src/core/interfaces.ts:345](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L345)

Interface for managing conversation history.

## Methods

### addMessages()

> **addMessages**(`threadId`, `messages`): `Promise`\<`void`\>

Defined in: [src/core/interfaces.ts:353](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L353)

Appends one or more `ConversationMessage` objects to the history of a specific thread.
Typically called at the end of an execution cycle to save the user query and the final AI response.

#### Parameters

##### threadId

`string`

The ID of the thread to add messages to.

##### messages

[`ConversationMessage`](ConversationMessage.md)[]

An array containing the `ConversationMessage` objects to add.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the messages have been successfully added to storage.

***

### getMessages()

> **getMessages**(`threadId`, `options?`): `Promise`\<[`ConversationMessage`](ConversationMessage.md)[]\>

Defined in: [src/core/interfaces.ts:361](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/core/interfaces.ts#L361)

Retrieves messages from a specific thread's history, usually in reverse chronological order.

#### Parameters

##### threadId

`string`

The ID of the thread whose history is needed.

##### options?

[`MessageOptions`](MessageOptions.md)

Optional parameters to control retrieval, such as `limit` (max number of messages) or `beforeTimestamp` (for pagination). See `MessageOptions` type.

#### Returns

`Promise`\<[`ConversationMessage`](ConversationMessage.md)[]\>

A promise resolving to an array of `ConversationMessage` objects, ordered according to the implementation (typically newest first if not specified otherwise).
