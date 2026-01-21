[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / TodoListChanges

# Interface: TodoListChanges

Defined in: [src/types/pes-types.ts:534](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/pes-types.ts#L534)

Describes the changes made to a todo list during dynamic plan updates.
Provides both a flat array of all changes and convenience accessors
for common filtering patterns.

 TodoListChanges

## Properties

### added

> **added**: [`TodoItemChange`](TodoItemChange.md)[]

Defined in: [src/types/pes-types.ts:552](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/pes-types.ts#L552)

Convenience accessor for items that were added.
Filters the changes array to include only ADDED type changes.

***

### changes

> **changes**: [`TodoItemChange`](TodoItemChange.md)[]

Defined in: [src/types/pes-types.ts:545](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/pes-types.ts#L545)

All changes as a flat array - the single source of truth.

***

### modified

> **modified**: [`TodoItemChange`](TodoItemChange.md)[]

Defined in: [src/types/pes-types.ts:559](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/pes-types.ts#L559)

Convenience accessor for items that were modified.
Filters the changes array to include only MODIFIED type changes.

***

### removed

> **removed**: [`TodoItemChange`](TodoItemChange.md)[]

Defined in: [src/types/pes-types.ts:566](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/pes-types.ts#L566)

Convenience accessor for items that were removed.
Filters the changes array to include only REMOVED type changes.

***

### timestamp

> **timestamp**: `number`

Defined in: [src/types/pes-types.ts:539](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/pes-types.ts#L539)

When these changes were detected (Unix timestamp in milliseconds).
