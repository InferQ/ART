[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ExecutionOutput

# Interface: ExecutionOutput

Defined in: [src/types/pes-types.ts:44](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/pes-types.ts#L44)

## Properties

### content?

> `optional` **content**: `string`

Defined in: [src/types/pes-types.ts:46](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/pes-types.ts#L46)

***

### nextStepDecision?

> `optional` **nextStepDecision**: `"continue"` \| `"wait"` \| `"complete_item"` \| `"update_plan"`

Defined in: [src/types/pes-types.ts:48](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/pes-types.ts#L48)

***

### thoughts?

> `optional` **thoughts**: `string`

Defined in: [src/types/pes-types.ts:45](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/pes-types.ts#L45)

***

### toolCalls?

> `optional` **toolCalls**: [`ParsedToolCall`](ParsedToolCall.md)[]

Defined in: [src/types/pes-types.ts:47](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/pes-types.ts#L47)

***

### updatedPlan?

> `optional` **updatedPlan**: `object`

Defined in: [src/types/pes-types.ts:49](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/pes-types.ts#L49)

#### intent?

> `optional` **intent**: `string`

#### plan?

> `optional` **plan**: `string`

#### todoList?

> `optional` **todoList**: [`TodoItem`](TodoItem.md)[]
