/**
 * Tests for the todo-diff utility
 * Tests change detection between todo lists during dynamic plan updates.
 */

import { describe, it, expect } from 'vitest';
import {
  computeTodoListDiff,
  createInitialChanges
} from '../src/utils/todo-diff';
import {
  TodoItem,
  TodoItemStatus,
  TodoItemChangeType
} from '../src/types';

describe('computeTodoListDiff', () => {
  /**
   * Helper function to create a TodoItem for testing
   */
  function createTodoItem(
    id: string,
    description: string,
    status: TodoItemStatus = TodoItemStatus.PENDING
  ): TodoItem {
    return {
      id,
      description,
      status,
      createdTimestamp: Date.now(),
      updatedTimestamp: Date.now(),
    };
  }

  describe('detects added items', () => {
    it('should detect items added to an empty list', () => {
      const previous: TodoItem[] = [];
      const current: TodoItem[] = [
        createTodoItem('1', 'Task 1'),
        createTodoItem('2', 'Task 2'),
      ];

      const result = computeTodoListDiff(previous, current);

      expect(result.added).toHaveLength(2);
      expect(result.modified).toHaveLength(0);
      expect(result.removed).toHaveLength(0);
      expect(result.changes).toHaveLength(2);

      expect(result.added[0].type).toBe(TodoItemChangeType.ADDED);
      expect(result.added[0].itemId).toBe('1');
      expect(result.added[0].item?.description).toBe('Task 1');

      expect(result.added[1].type).toBe(TodoItemChangeType.ADDED);
      expect(result.added[1].itemId).toBe('2');
      expect(result.added[1].item?.description).toBe('Task 2');
    });

    it('should detect items added to an existing list', () => {
      const previous: TodoItem[] = [
        createTodoItem('1', 'Task 1'),
      ];
      const current: TodoItem[] = [
        createTodoItem('1', 'Task 1'),
        createTodoItem('2', 'Task 2'),
      ];

      const result = computeTodoListDiff(previous, current);

      expect(result.added).toHaveLength(1);
      expect(result.added[0].itemId).toBe('2');
      expect(result.modified).toHaveLength(0);
      expect(result.removed).toHaveLength(0);
    });
  });

  describe('detects removed items', () => {
    it('should detect all items removed', () => {
      const previous: TodoItem[] = [
        createTodoItem('1', 'Task 1'),
        createTodoItem('2', 'Task 2'),
      ];
      const current: TodoItem[] = [];

      const result = computeTodoListDiff(previous, current);

      expect(result.removed).toHaveLength(2);
      expect(result.added).toHaveLength(0);
      expect(result.modified).toHaveLength(0);

      expect(result.removed[0].type).toBe(TodoItemChangeType.REMOVED);
      expect(result.removed[0].itemId).toBe('1');
      expect(result.removed[0].previousItem?.description).toBe('Task 1');

      expect(result.removed[1].type).toBe(TodoItemChangeType.REMOVED);
      expect(result.removed[1].itemId).toBe('2');
      expect(result.removed[1].previousItem?.description).toBe('Task 2');
    });

    it('should detect some items removed', () => {
      const previous: TodoItem[] = [
        createTodoItem('1', 'Task 1'),
        createTodoItem('2', 'Task 2'),
        createTodoItem('3', 'Task 3'),
      ];
      const current: TodoItem[] = [
        createTodoItem('1', 'Task 1'),
      ];

      const result = computeTodoListDiff(previous, current);

      expect(result.removed).toHaveLength(2);
      expect(result.removed.map(r => r.itemId).sort()).toEqual(['2', '3']);
    });
  });

  describe('detects modified items', () => {
    it('should detect description changes', () => {
      const previous: TodoItem[] = [
        createTodoItem('1', 'Task 1'),
      ];
      const current: TodoItem[] = [
        createTodoItem('1', 'Task 1 Updated'),
      ];

      const result = computeTodoListDiff(previous, current);

      expect(result.modified).toHaveLength(1);
      expect(result.added).toHaveLength(0);
      expect(result.removed).toHaveLength(0);

      expect(result.modified[0].type).toBe(TodoItemChangeType.MODIFIED);
      expect(result.modified[0].itemId).toBe('1');
      expect(result.modified[0].previousItem?.description).toBe('Task 1');
      expect(result.modified[0].item?.description).toBe('Task 1 Updated');
    });

    it('should detect status changes other than PENDING->IN_PROGRESS', () => {
      const previous: TodoItem[] = [
        createTodoItem('1', 'Task 1', TodoItemStatus.PENDING),
      ];
      const current: TodoItem[] = [
        createTodoItem('1', 'Task 1', TodoItemStatus.COMPLETED),
      ];

      const result = computeTodoListDiff(previous, current);

      expect(result.modified).toHaveLength(1);
      expect(result.modified[0].previousItem?.status).toBe(TodoItemStatus.PENDING);
      expect(result.modified[0].item?.status).toBe(TodoItemStatus.COMPLETED);
    });

    it('should detect dependency changes', () => {
      const previous: TodoItem[] = [
        createTodoItem('1', 'Task 1'),
      ];
      const current: TodoItem[] = [
        { ...createTodoItem('1', 'Task 1'), dependencies: ['2'] },
      ];

      const result = computeTodoListDiff(previous, current);

      expect(result.modified).toHaveLength(1);
    });

    it('should ignore timestamp-only changes', () => {
      const baseItem = createTodoItem('1', 'Task 1');
      const previous: TodoItem[] = [baseItem];
      const current: TodoItem[] = [
        { ...baseItem, updatedTimestamp: baseItem.updatedTimestamp + 1000 },
      ];

      const result = computeTodoListDiff(previous, current);

      expect(result.modified).toHaveLength(0);
    });
  });

  describe('handles mixed changes', () => {
    it('should detect added, modified, and removed items in one diff', () => {
      const previous: TodoItem[] = [
        createTodoItem('1', 'Task 1'),
        createTodoItem('2', 'Task 2'),
        createTodoItem('3', 'Task 3'),
      ];
      const current: TodoItem[] = [
        createTodoItem('1', 'Task 1'),           // Unchanged
        createTodoItem('2', 'Task 2 Updated'),  // Modified
        createTodoItem('4', 'Task 4'),          // Added (3 was removed)
      ];

      const result = computeTodoListDiff(previous, current);

      expect(result.added).toHaveLength(1);
      expect(result.added[0].itemId).toBe('4');

      expect(result.modified).toHaveLength(1);
      expect(result.modified[0].itemId).toBe('2');

      expect(result.removed).toHaveLength(1);
      expect(result.removed[0].itemId).toBe('3');
    });
  });

  describe('edge cases', () => {
    it('should handle empty inputs', () => {
      const result1 = computeTodoListDiff(undefined, []);
      const result2 = computeTodoListDiff([], undefined);
      const result3 = computeTodoListDiff(null, null);

      expect(result1.changes).toHaveLength(0);
      expect(result2.changes).toHaveLength(0);
      expect(result3.changes).toHaveLength(0);
    });

    it('should handle both lists empty', () => {
      const result = computeTodoListDiff([], []);

      expect(result.changes).toHaveLength(0);
      expect(result.added).toHaveLength(0);
      expect(result.modified).toHaveLength(0);
      expect(result.removed).toHaveLength(0);
    });

    it('should detect same ID with different content as MODIFIED', () => {
      const previous: TodoItem[] = [
        createTodoItem('1', 'Task 1'),
      ];
      const current: TodoItem[] = [
        createTodoItem('1', 'Completely Different Task'),
      ];

      const result = computeTodoListDiff(previous, current);

      // Same ID means modification, not removal+addition
      expect(result.modified).toHaveLength(1);
      expect(result.added).toHaveLength(0);
      expect(result.removed).toHaveLength(0);
    });
  });

  describe('convenience accessors', () => {
    it('should provide added convenience accessor', () => {
      const previous: TodoItem[] = [];
      const current: TodoItem[] = [
        createTodoItem('1', 'Task 1'),
        createTodoItem('2', 'Task 2'),
      ];

      const result = computeTodoListDiff(previous, current);

      expect(result.added).toEqual(result.changes.filter(c => c.type === TodoItemChangeType.ADDED));
    });

    it('should provide modified convenience accessor', () => {
      const previous: TodoItem[] = [
        createTodoItem('1', 'Task 1'),
      ];
      const current: TodoItem[] = [
        createTodoItem('1', 'Task 1 Updated'),
      ];

      const result = computeTodoListDiff(previous, current);

      expect(result.modified).toEqual(result.changes.filter(c => c.type === TodoItemChangeType.MODIFIED));
    });

    it('should provide removed convenience accessor', () => {
      const previous: TodoItem[] = [
        createTodoItem('1', 'Task 1'),
      ];
      const current: TodoItem[] = [];

      const result = computeTodoListDiff(previous, current);

      expect(result.removed).toEqual(result.changes.filter(c => c.type === TodoItemChangeType.REMOVED));
    });
  });
});

describe('createInitialChanges', () => {
  function createTodoItem(
    id: string,
    description: string,
    status: TodoItemStatus = TodoItemStatus.PENDING
  ): TodoItem {
    return {
      id,
      description,
      status,
      createdTimestamp: Date.now(),
      updatedTimestamp: Date.now(),
    };
  }

  it('should mark all items as added', () => {
    const todoList: TodoItem[] = [
      createTodoItem('1', 'Task 1'),
      createTodoItem('2', 'Task 2'),
      createTodoItem('3', 'Task 3'),
    ];

    const result = createInitialChanges(todoList);

    expect(result.changes).toHaveLength(3);
    expect(result.added).toHaveLength(3);
    expect(result.modified).toHaveLength(0);
    expect(result.removed).toHaveLength(0);

    result.changes.forEach(change => {
      expect(change.type).toBe(TodoItemChangeType.ADDED);
    });
  });

  it('should handle empty todo list', () => {
    const result = createInitialChanges([]);

    expect(result.changes).toHaveLength(0);
    expect(result.added).toHaveLength(0);
  });

  it('should include full item data in changes', () => {
    const todoList: TodoItem[] = [
      createTodoItem('1', 'Task 1'),
    ];

    const result = createInitialChanges(todoList);

    expect(result.changes[0].item).toEqual(todoList[0]);
    expect(result.changes[0].itemId).toBe('1');
  });
});
