[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / A2ATaskMetadata

# Interface: A2ATaskMetadata

Defined in: [src/types/index.ts:1543](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1543)

Represents metadata about A2A task execution.

 A2ATaskMetadata

## Properties

### completedAt?

> `optional` **completedAt**: `number`

Defined in: [src/types/index.ts:1563](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1563)

Timestamp when the task was completed/failed (if applicable).

***

### correlationId?

> `optional` **correlationId**: `string`

Defined in: [src/types/index.ts:1583](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1583)

Correlation ID for tracking related tasks across the system.

***

### createdAt

> **createdAt**: `number`

Defined in: [src/types/index.ts:1548](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1548)

Timestamp when the task was created (Unix timestamp in milliseconds).

***

### delegatedAt?

> `optional` **delegatedAt**: `number`

Defined in: [src/types/index.ts:1568](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1568)

Timestamp when the task was delegated to a remote agent (if applicable).

***

### estimatedCompletionMs?

> `optional` **estimatedCompletionMs**: `number`

Defined in: [src/types/index.ts:1603](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1603)

Estimated completion time in milliseconds (if provided by remote agent).

***

### initiatedBy?

> `optional` **initiatedBy**: `string`

Defined in: [src/types/index.ts:1578](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1578)

The user or system that initiated this task.

***

### lastUpdated?

> `optional` **lastUpdated**: `number`

Defined in: [src/types/index.ts:1573](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1573)

Timestamp when the task was last updated (for compatibility).

***

### maxRetries?

> `optional` **maxRetries**: `number`

Defined in: [src/types/index.ts:1593](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1593)

Maximum number of retry attempts allowed.

***

### retryCount?

> `optional` **retryCount**: `number`

Defined in: [src/types/index.ts:1588](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1588)

Number of retry attempts made for this task.

***

### startedAt?

> `optional` **startedAt**: `number`

Defined in: [src/types/index.ts:1558](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1558)

Timestamp when the task was started (if applicable).

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [src/types/index.ts:1608](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1608)

Tags or labels for categorizing tasks.

***

### timeoutMs?

> `optional` **timeoutMs**: `number`

Defined in: [src/types/index.ts:1598](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1598)

Timeout duration in milliseconds.

***

### updatedAt

> **updatedAt**: `number`

Defined in: [src/types/index.ts:1553](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1553)

Timestamp when the task was last updated (Unix timestamp in milliseconds).
