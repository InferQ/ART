[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / A2ATaskResult

# Interface: A2ATaskResult

Defined in: [src/types/index.ts:1616](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1616)

Represents the result of an A2A task execution.

 A2ATaskResult

## Properties

### data?

> `optional` **data**: `any`

Defined in: [src/types/index.ts:1626](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1626)

The data returned by the task execution.

***

### durationMs?

> `optional` **durationMs**: `number`

Defined in: [src/types/index.ts:1648](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1648)

Execution duration in milliseconds.

***

### error?

> `optional` **error**: `string`

Defined in: [src/types/index.ts:1631](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1631)

Error message if the task failed.

***

### metadata?

> `optional` **metadata**: `object`

Defined in: [src/types/index.ts:1636](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1636)

Additional metadata about the execution.

#### Index Signature

\[`key`: `string`\]: `any`

#### sources?

> `optional` **sources**: `object`[]

##### Index Signature

\[`key`: `string`\]: `any`

***

### success

> **success**: `boolean`

Defined in: [src/types/index.ts:1621](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1621)

Whether the task execution was successful.
