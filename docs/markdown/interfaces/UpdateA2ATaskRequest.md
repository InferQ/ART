[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / UpdateA2ATaskRequest

# Interface: UpdateA2ATaskRequest

Defined in: [src/types/index.ts:1818](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1818)

Represents an update to an existing A2A task.

 UpdateA2ATaskRequest

## Properties

### metadata?

> `optional` **metadata**: `Partial`\<[`A2ATaskMetadata`](A2ATaskMetadata.md)\>

Defined in: [src/types/index.ts:1843](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1843)

Additional metadata updates.

***

### result?

> `optional` **result**: [`A2ATaskResult`](A2ATaskResult.md)

Defined in: [src/types/index.ts:1838](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1838)

Task result (if completing).

***

### status?

> `optional` **status**: [`A2ATaskStatus`](../enumerations/A2ATaskStatus.md)

Defined in: [src/types/index.ts:1828](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1828)

New task status (if changing).

***

### targetAgent?

> `optional` **targetAgent**: [`A2AAgentInfo`](A2AAgentInfo.md)

Defined in: [src/types/index.ts:1833](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1833)

Target agent assignment (if assigning/reassigning).

***

### taskId

> **taskId**: `string`

Defined in: [src/types/index.ts:1823](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1823)

Task ID to update.
