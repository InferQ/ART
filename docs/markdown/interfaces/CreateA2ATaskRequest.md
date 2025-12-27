[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / CreateA2ATaskRequest

# Interface: CreateA2ATaskRequest

Defined in: [src/types/index.ts:1665](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1665)

Represents a request to create a new A2A task.

 CreateA2ATaskRequest

## Properties

### callbackUrl?

> `optional` **callbackUrl**: `string`

Defined in: [src/types/index.ts:1710](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1710)

Callback URL for notifications.

***

### dependencies?

> `optional` **dependencies**: `string`[]

Defined in: [src/types/index.ts:1705](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1705)

Task dependencies.

***

### input

> **input**: `any`

Defined in: [src/types/index.ts:1675](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1675)

Input data for the task.

***

### instructions?

> `optional` **instructions**: `string`

Defined in: [src/types/index.ts:1680](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1680)

Instructions for task execution.

***

### maxRetries?

> `optional` **maxRetries**: `number`

Defined in: [src/types/index.ts:1720](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1720)

Maximum retry attempts.

***

### parameters?

> `optional` **parameters**: `Record`\<`string`, `any`\>

Defined in: [src/types/index.ts:1685](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1685)

Task parameters.

***

### preferredTargetAgent?

> `optional` **preferredTargetAgent**: [`A2AAgentInfo`](A2AAgentInfo.md)

Defined in: [src/types/index.ts:1700](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1700)

Preferred target agent (if any).

***

### priority?

> `optional` **priority**: [`A2ATaskPriority`](../enumerations/A2ATaskPriority.md)

Defined in: [src/types/index.ts:1690](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1690)

Task priority.

***

### sourceAgent

> **sourceAgent**: [`A2AAgentInfo`](A2AAgentInfo.md)

Defined in: [src/types/index.ts:1695](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1695)

Source agent information.

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [src/types/index.ts:1725](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1725)

Task tags.

***

### taskType

> **taskType**: `string`

Defined in: [src/types/index.ts:1670](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1670)

The type of task to be executed.

***

### timeoutMs?

> `optional` **timeoutMs**: `number`

Defined in: [src/types/index.ts:1715](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1715)

Task timeout in milliseconds.
