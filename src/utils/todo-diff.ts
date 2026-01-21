/**
 * @module utils/todo-diff
 *
 * Utilities for computing differences between todo lists during dynamic plan updates.
 * Provides efficient O(n + m) diff algorithm for tracking changes.
 */

import {
  TodoItem,
  TodoListChanges,
  TodoItemChange,
  TodoItemChangeType
} from '@/types';

/**
 * Computes the differences between two todo lists.
 *
 * This function compares the previous and current todo lists to determine:
 * - Which items are new (added)
 * - Which items were modified
 * - Which items were removed
 *
 * Time Complexity: O(n + m) where n = previous length, m = current length
 * Space Complexity: O(n + m) for the result
 *
 * @param previous - The previous todo list state (before changes). Can be undefined or null.
 * @param current - The current todo list state (after changes). Can be undefined or null.
 * @returns A TodoListChanges object describing all detected changes.
 *
 * @example
 * ```ts
 * const previous = [
 *   createTodoItem('1', 'Task 1'),
 *   createTodoItem('2', 'Task 2')
 * ];
 * const current = [
 *   createTodoItem('1', 'Task 1'),
 *   createTodoItem('2', 'Task 2 Updated'),
 *   createTodoItem('3', 'Task 3')
 * ];
 *
 * const changes = computeTodoListDiff(previous, current);
 * // changes.added.length === 1 (Task 3)
 * // changes.modified.length === 1 (Task 2)
 * // changes.removed.length === 0
 * ```
 */
export function computeTodoListDiff(
  previous: TodoItem[] | undefined | null,
  current: TodoItem[] | undefined | null
): TodoListChanges {
  // Handle edge cases - treat undefined/null as empty arrays
  const prevList = previous ?? [];
  const currList = current ?? [];

  // Early exit if both are empty
  if (prevList.length === 0 && currList.length === 0) {
    return createEmptyChanges();
  }

  // Use Sets for O(1) ID lookups
  const previousIds = new Set(prevList.map(item => item.id));
  const currentIds = new Set(currList.map(item => item.id));
  const previousMap = new Map(prevList.map(item => [item.id, item]));
  const currentMap = new Map(currList.map(item => [item.id, item]));

  // Use deepClone function for creating copies (uses structuredClone if available)
  const deepClone = (obj: TodoItem): TodoItem => {
    if (typeof structuredClone === 'function') {
      return structuredClone(obj);
    }
    return { ...obj };
  };

  const changes: TodoItemChange[] = [];
  const added: TodoItemChange[] = [];
  const modified: TodoItemChange[] = [];
  const removed: TodoItemChange[] = [];
  const now = Date.now();

  // Find added and modified items
  for (const [id, currentItem] of currentMap) {
    const previousItem = previousMap.get(id);

    if (!previousItem) {
      // Item is new
      const change: TodoItemChange = {
        type: TodoItemChangeType.ADDED,
        itemId: id,
        timestamp: now,
        item: deepClone(currentItem),
      };
      changes.push(change);
      added.push(change);
    } else if (isItemModified(previousItem, currentItem)) {
      // Item was modified
      const change: TodoItemChange = {
        type: TodoItemChangeType.MODIFIED,
        itemId: id,
        timestamp: now,
        item: deepClone(currentItem),
        previousItem: deepClone(previousItem),
      };
      changes.push(change);
      modified.push(change);
    }
  }

  // Find removed items
  for (const [id, previousItem] of previousMap) {
    if (!currentMap.has(id)) {
      const change: TodoItemChange = {
        type: TodoItemChangeType.REMOVED,
        itemId: id,
        timestamp: now,
        previousItem: deepClone(previousItem),
      };
      changes.push(change);
      removed.push(change);
    }
  }

  // Return with convenience accessors (built in single pass above)
  return {
    timestamp: now,
    changes,
    added,
    modified,
    removed,
  };
}

/**
 * Creates an empty TodoListChanges object.
 * Useful for edge cases where there are no changes.
 */
function createEmptyChanges(): TodoListChanges {
  const now = Date.now();
  return {
    timestamp: now,
    changes: [],
    added: [],
    modified: [],
    removed: [],
  };
}

/**
 * Determines whether a TodoItem has been meaningfully modified.
 *
 * Excludes updatedTimestamp from comparison as it's expected to change.
 * Includes createdTimestamp for data integrity - if this differs, it may
 * indicate data corruption or an incorrectly matched item.
 *
 * @param previous - The previous state of the item
 * @param current - The current state of the item
 * @returns true if the item was meaningfully modified, false otherwise
 */
function isItemModified(previous: TodoItem, current: TodoItem): boolean {
  // Fields to compare (excluding updatedTimestamp which is expected to change)
  // Note: createdTimestamp IS included to detect data corruption - it should never change
  const fieldsToCompare: (keyof TodoItem)[] = [
    'id',
    'description',
    'status',
    'dependencies',
    'stepType',
    'requiredTools',
    'expectedOutcome',
    'toolValidationMode',
    'result',
    'thoughts',
    'toolCalls',
    'actualToolCalls',
    'toolResults',
    'validationStatus',
    'createdTimestamp',
  ];

  for (const field of fieldsToCompare) {
    if (!deepEqual(previous[field], current[field])) {
      return true;
    }
  }

  // If only timestamp changed, it's not a meaningful modification
  return false;
}

/**
 * Performs a deep equality check between two values.
 * Handles primitives, arrays, and plain objects.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns true if values are deeply equal, false otherwise
 */
function deepEqual(a: any, b: any): boolean {
  // Strict equality for primitives and same reference
  if (a === b) return true;

  // Handle null/undefined
  if (a == null || b == null) return false;

  // Type mismatch
  if (typeof a !== typeof b) return false;

  // Handle arrays explicitly before general objects
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  // Object comparison (plain objects only)
  if (typeof a === 'object') {
    if (typeof b !== 'object' || Array.isArray(b)) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => deepEqual(a[key], b[key]));
  }

  // Primitive value mismatch (after === check above)
  return false;
}

/**
 * Creates initial TodoListChanges where all items are marked as added.
 *
 * This is used during the initial planning phase when a brand new todo list
 * is created. Since there was no previous state, all items are marked as
 * ADDED rather than MODIFIED.
 *
 * @param todoList - The initial todo list from the planning phase. Can be undefined or null.
 * @returns TodoListChanges with all items marked as ADDED
 *
 * @example
 * ```ts
 * // In planning phase, after LLM generates initial plan
 * const initialChanges = createInitialChanges(planningOutput.todoList || []);
 * await observationManager.record({
 *   type: ObservationType.PLAN_UPDATE,
 *   content: { todoList: planningOutput.todoList, changes: initialChanges }
 * });
 * ```
 */
export function createInitialChanges(todoList: TodoItem[] | undefined | null): TodoListChanges {
  // Handle null/undefined input
  const list = todoList ?? [];

  const now = Date.now();
  const changes: TodoItemChange[] = list.map(item => ({
    type: TodoItemChangeType.ADDED,
    itemId: item.id,
    timestamp: now,
    item: structuredClone ? structuredClone(item) : { ...item },
  }));

  return {
    timestamp: now,
    changes,
    added: changes,
    modified: [],
    removed: [],
  };
}
