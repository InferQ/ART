[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / UpdateA2ATaskRequest

# Interface: UpdateA2ATaskRequest

Defined in: [src/types/index.ts:1733](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1733)

Represents an update to an existing A2A task.

 UpdateA2ATaskRequest

## Properties

### metadata?

> `optional` **metadata**: `Partial`\<[`A2ATaskMetadata`](A2ATaskMetadata.md)\>

Defined in: [src/types/index.ts:1758](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1758)

Additional metadata updates.

***

### result?

> `optional` **result**: [`A2ATaskResult`](A2ATaskResult.md)

Defined in: [src/types/index.ts:1753](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1753)

Task result (if completing).

***

### status?

> `optional` **status**: [`A2ATaskStatus`](../enumerations/A2ATaskStatus.md)

Defined in: [src/types/index.ts:1743](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1743)

New task status (if changing).

***

### targetAgent?

> `optional` **targetAgent**: [`A2AAgentInfo`](A2AAgentInfo.md)

Defined in: [src/types/index.ts:1748](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1748)

Target agent assignment (if assigning/reassigning).

***

### taskId

> **taskId**: `string`

Defined in: [src/types/index.ts:1738](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1738)

Task ID to update.
