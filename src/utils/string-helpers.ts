/**
 * @module utils/string-helpers
 * Provides utility functions for safe string operations.
 */

/**
 * Safely converts a value to a JSON string with optional truncation.
 * Handles undefined, null, circular references, and other edge cases.
 *
 * @param value - The value to stringify
 * @param maxLength - Maximum length of the output string (default: 200)
 * @returns A safe string representation of the value
 *
 * @example
 * safeStringify({ name: 'test' }); // '{"name":"test"}'
 * safeStringify(undefined); // '[undefined]'
 * safeStringify(null); // 'null'
 * safeStringify({ long: '...' }, 50); // '{"long":"..."}...' (truncated)
 */
export function safeStringify(value: unknown, maxLength: number = 10000): string {
  if (value === undefined) {
    return '[undefined]';
  }

  try {
    const str = JSON.stringify(value);

    // JSON.stringify can return undefined for certain inputs (e.g., functions, symbols)
    if (str === undefined) {
      return '[non-serializable]';
    }

    if (str.length <= maxLength) {
      return str;
    }

    return str.substring(0, maxLength) + '...';
  } catch (error) {
    // Handle circular references or other stringify errors
    if (error instanceof TypeError && error.message.includes('circular')) {
      return '[circular reference]';
    }
    return '[stringify error]';
  }
}
