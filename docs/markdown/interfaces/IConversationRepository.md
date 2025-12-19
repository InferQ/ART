[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / IConversationRepository

# Interface: IConversationRepository

Defined in: [src/core/interfaces.ts:508](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L508)

Repository for managing ConversationMessages.

## Methods

### addMessages()

> **addMessages**(`threadId`, `messages`): `Promise`\<`void`\>

Defined in: [src/core/interfaces.ts:509](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L509)

#### Parameters

##### threadId

`string`

##### messages

[`ConversationMessage`](ConversationMessage.md)[]

#### Returns

`Promise`\<`void`\>

***

### getMessages()

> **getMessages**(`threadId`, `options?`): `Promise`\<[`ConversationMessage`](ConversationMessage.md)[]\>

Defined in: [src/core/interfaces.ts:510](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L510)

#### Parameters

##### threadId

`string`

##### options?

[`MessageOptions`](MessageOptions.md)

#### Returns

`Promise`\<[`ConversationMessage`](ConversationMessage.md)[]\>
