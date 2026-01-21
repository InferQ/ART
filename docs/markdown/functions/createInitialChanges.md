[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / createInitialChanges

# Function: createInitialChanges()

> **createInitialChanges**(`todoList`): [`TodoListChanges`](../interfaces/TodoListChanges.md)

Defined in: [src/utils/todo-diff.ts:248](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/utils/todo-diff.ts#L248)

Creates initial TodoListChanges where all items are marked as added.

This is used during the initial planning phase when a brand new todo list
is created. Since there was no previous state, all items are marked as
ADDED rather than MODIFIED.

## Parameters

### todoList

The initial todo list from the planning phase. Can be undefined or null.

[`TodoItem`](../interfaces/TodoItem.md)[] | `null` | `undefined`

## Returns

[`TodoListChanges`](../interfaces/TodoListChanges.md)

TodoListChanges with all items marked as ADDED

## Example

```ts
// In planning phase, after LLM generates initial plan
const initialChanges = createInitialChanges(planningOutput.todoList || []);
await observationManager.record({
  type: ObservationType.PLAN_UPDATE,
  content: { todoList: planningOutput.todoList, changes: initialChanges }
});
```
