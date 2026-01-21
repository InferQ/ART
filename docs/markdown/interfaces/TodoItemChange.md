[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / TodoItemChange

# Interface: TodoItemChange

Defined in: [src/types/pes-types.ts:494](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/pes-types.ts#L494)

Describes a single change to a TodoItem during dynamic plan updates.

The presence of optional fields depends on the change type:
- ADDED: `item` is present
- MODIFIED: both `item` and `previousItem` are present
- REMOVED: only `previousItem` is present

 TodoItemChange

## Properties

### item?

> `optional` **item**: [`TodoItem`](TodoItem.md)

Defined in: [src/types/pes-types.ts:517](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/pes-types.ts#L517)

For ADDED and MODIFIED changes: the new state of the item.

***

### itemId

> **itemId**: `string`

Defined in: [src/types/pes-types.ts:505](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/pes-types.ts#L505)

The ID of the TodoItem that changed.

***

### previousItem?

> `optional` **previousItem**: [`TodoItem`](TodoItem.md)

Defined in: [src/types/pes-types.ts:524](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/pes-types.ts#L524)

For MODIFIED changes: the state before modification.
For REMOVED changes: the state before removal.

***

### timestamp

> **timestamp**: `number`

Defined in: [src/types/pes-types.ts:511](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/pes-types.ts#L511)

When this change was detected (Unix timestamp in milliseconds).

***

### type

> **type**: [`TodoItemChangeType`](../enumerations/TodoItemChangeType.md)

Defined in: [src/types/pes-types.ts:499](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/pes-types.ts#L499)

The type of change that occurred.
