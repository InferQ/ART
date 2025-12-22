
import { describe, it, expect } from 'vitest';

describe('Synthesis summary bug fix', () => {
  it('should not throw when result is undefined', () => {
    const completedItems = [
      { description: 'Task 1', result: undefined, status: 'COMPLETED' },
      { description: 'Task 2', result: { foo: 'bar' }, status: 'COMPLETED' }
    ];

    const summary = `
Completed Tasks:
${completedItems.map(i => `- ${i.description}: ${(JSON.stringify(i.result) ?? 'null').substring(0, 200)}...`).join('\n')}
`;

    expect(summary).toContain('Task 1: null...');
    expect(summary).toContain('Task 2: {"foo":"bar"}...');
  });
});

describe('TypedSocket notify bug fix', () => {
  it('should not throw when data is undefined', () => {
    const data = undefined;
    const logOutput = `Notifying subscribers. Data: ${(JSON.stringify(data) ?? 'null').substring(0, 100)}...`;
    expect(logOutput).toContain('Data: null...');
  });
});

