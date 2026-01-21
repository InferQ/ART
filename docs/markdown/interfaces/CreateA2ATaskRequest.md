[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / CreateA2ATaskRequest

# Interface: CreateA2ATaskRequest

Defined in: [src/types/index.ts:1750](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1750)

Represents a request to create a new A2A task.

 CreateA2ATaskRequest

## Properties

### callbackUrl?

> `optional` **callbackUrl**: `string`

Defined in: [src/types/index.ts:1795](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1795)

Callback URL for notifications.

***

### dependencies?

> `optional` **dependencies**: `string`[]

Defined in: [src/types/index.ts:1790](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1790)

Task dependencies.

***

### input

> **input**: `any`

Defined in: [src/types/index.ts:1760](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1760)

Input data for the task.

***

### instructions?

> `optional` **instructions**: `string`

Defined in: [src/types/index.ts:1765](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1765)

Instructions for task execution.

***

### maxRetries?

> `optional` **maxRetries**: `number`

Defined in: [src/types/index.ts:1805](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1805)

Maximum retry attempts.

***

### parameters?

> `optional` **parameters**: `Record`\<`string`, `any`\>

Defined in: [src/types/index.ts:1770](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1770)

Task parameters.

***

### preferredTargetAgent?

> `optional` **preferredTargetAgent**: [`A2AAgentInfo`](A2AAgentInfo.md)

Defined in: [src/types/index.ts:1785](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1785)

Preferred target agent (if any).

***

### priority?

> `optional` **priority**: [`A2ATaskPriority`](../enumerations/A2ATaskPriority.md)

Defined in: [src/types/index.ts:1775](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1775)

Task priority.

***

### sourceAgent

> **sourceAgent**: [`A2AAgentInfo`](A2AAgentInfo.md)

Defined in: [src/types/index.ts:1780](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1780)

Source agent information.

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [src/types/index.ts:1810](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1810)

Task tags.

***

### taskType

> **taskType**: `string`

Defined in: [src/types/index.ts:1755](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1755)

The type of task to be executed.

***

### timeoutMs?

> `optional` **timeoutMs**: `number`

Defined in: [src/types/index.ts:1800](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1800)

Task timeout in milliseconds.
