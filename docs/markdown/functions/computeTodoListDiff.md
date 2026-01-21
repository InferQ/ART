[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / computeTodoListDiff

# Function: computeTodoListDiff()

> **computeTodoListDiff**(`previous`, `current`): [`TodoListChanges`](../interfaces/TodoListChanges.md)

Defined in: [src/utils/todo-diff.ts:48](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/utils/todo-diff.ts#L48)

Computes the differences between two todo lists.

This function compares the previous and current todo lists to determine:
- Which items are new (added)
- Which items were modified
- Which items were removed

Time Complexity: O(n + m) where n = previous length, m = current length
Space Complexity: O(n + m) for the result

## Parameters

### previous

The previous todo list state (before changes). Can be undefined or null.

[`TodoItem`](../interfaces/TodoItem.md)[] | `null` | `undefined`

### current

The current todo list state (after changes). Can be undefined or null.

[`TodoItem`](../interfaces/TodoItem.md)[] | `null` | `undefined`

## Returns

[`TodoListChanges`](../interfaces/TodoListChanges.md)

A TodoListChanges object describing all detected changes.

## Example

```ts
const previous = [
  createTodoItem('1', 'Task 1'),
  createTodoItem('2', 'Task 2')
];
const current = [
  createTodoItem('1', 'Task 1'),
  createTodoItem('2', 'Task 2 Updated'),
  createTodoItem('3', 'Task 3')
];

const changes = computeTodoListDiff(previous, current);
// changes.added.length === 1 (Task 3)
// changes.modified.length === 1 (Task 2)
// changes.removed.length === 0
```
