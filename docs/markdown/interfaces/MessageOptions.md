[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / MessageOptions

# Interface: MessageOptions

Defined in: [src/types/index.ts:1169](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1169)

Options for retrieving conversation messages.

 MessageOptions

## Properties

### afterTimestamp?

> `optional` **afterTimestamp**: `number`

Defined in: [src/types/index.ts:1184](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1184)

Retrieve messages created after this Unix timestamp (milliseconds).

***

### beforeTimestamp?

> `optional` **beforeTimestamp**: `number`

Defined in: [src/types/index.ts:1179](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1179)

Retrieve messages created before this Unix timestamp (milliseconds).

***

### limit?

> `optional` **limit**: `number`

Defined in: [src/types/index.ts:1174](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1174)

The maximum number of messages to retrieve.

***

### roles?

> `optional` **roles**: [`MessageRole`](../enumerations/MessageRole.md)[]

Defined in: [src/types/index.ts:1189](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1189)

Optionally filter messages by role (e.g., retrieve only 'AI' messages).
