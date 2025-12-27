[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / A2ATaskMetadata

# Interface: A2ATaskMetadata

Defined in: [src/types/index.ts:1458](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1458)

Represents metadata about A2A task execution.

 A2ATaskMetadata

## Properties

### completedAt?

> `optional` **completedAt**: `number`

Defined in: [src/types/index.ts:1478](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1478)

Timestamp when the task was completed/failed (if applicable).

***

### correlationId?

> `optional` **correlationId**: `string`

Defined in: [src/types/index.ts:1498](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1498)

Correlation ID for tracking related tasks across the system.

***

### createdAt

> **createdAt**: `number`

Defined in: [src/types/index.ts:1463](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1463)

Timestamp when the task was created (Unix timestamp in milliseconds).

***

### delegatedAt?

> `optional` **delegatedAt**: `number`

Defined in: [src/types/index.ts:1483](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1483)

Timestamp when the task was delegated to a remote agent (if applicable).

***

### estimatedCompletionMs?

> `optional` **estimatedCompletionMs**: `number`

Defined in: [src/types/index.ts:1518](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1518)

Estimated completion time in milliseconds (if provided by remote agent).

***

### initiatedBy?

> `optional` **initiatedBy**: `string`

Defined in: [src/types/index.ts:1493](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1493)

The user or system that initiated this task.

***

### lastUpdated?

> `optional` **lastUpdated**: `number`

Defined in: [src/types/index.ts:1488](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1488)

Timestamp when the task was last updated (for compatibility).

***

### maxRetries?

> `optional` **maxRetries**: `number`

Defined in: [src/types/index.ts:1508](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1508)

Maximum number of retry attempts allowed.

***

### retryCount?

> `optional` **retryCount**: `number`

Defined in: [src/types/index.ts:1503](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1503)

Number of retry attempts made for this task.

***

### startedAt?

> `optional` **startedAt**: `number`

Defined in: [src/types/index.ts:1473](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1473)

Timestamp when the task was started (if applicable).

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [src/types/index.ts:1523](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1523)

Tags or labels for categorizing tasks.

***

### timeoutMs?

> `optional` **timeoutMs**: `number`

Defined in: [src/types/index.ts:1513](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1513)

Timeout duration in milliseconds.

***

### updatedAt

> **updatedAt**: `number`

Defined in: [src/types/index.ts:1468](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1468)

Timestamp when the task was last updated (Unix timestamp in milliseconds).
