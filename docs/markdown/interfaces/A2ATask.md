[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / A2ATask

# Interface: A2ATask

Defined in: [src/types/index.ts:1572](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1572)

Represents a task for Agent-to-Agent (A2A) communication and delegation.
Used for asynchronous task delegation between AI agents in distributed systems.

 A2ATask

## Properties

### callbackUrl?

> `optional` **callbackUrl**: `string`

Defined in: [src/types/index.ts:1651](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1651)

Callback URL or identifier for task completion notifications.

***

### dependencies?

> `optional` **dependencies**: `string`[]

Defined in: [src/types/index.ts:1657](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1657)

Dependencies that must be completed before this task can start.

***

### metadata

> **metadata**: [`A2ATaskMetadata`](A2ATaskMetadata.md)

Defined in: [src/types/index.ts:1639](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1639)

Task execution metadata.

***

### payload

> **payload**: `object`

Defined in: [src/types/index.ts:1594](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1594)

The data payload containing task parameters and context.

#### input

> **input**: `any`

Input data required for task execution.

#### instructions?

> `optional` **instructions**: `string`

Instructions or configuration for the task.

#### parameters?

> `optional` **parameters**: `Record`\<`string`, `any`\>

Additional parameters specific to the task type.

#### taskType

> **taskType**: `string`

The type of task to be executed (e.g., 'analyze', 'synthesize', 'transform').

***

### priority

> **priority**: [`A2ATaskPriority`](../enumerations/A2ATaskPriority.md)

Defined in: [src/types/index.ts:1633](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1633)

Task priority level.

***

### result?

> `optional` **result**: [`A2ATaskResult`](A2ATaskResult.md)

Defined in: [src/types/index.ts:1645](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1645)

The result of task execution (if completed).

***

### sourceAgent

> **sourceAgent**: [`A2AAgentInfo`](A2AAgentInfo.md)

Defined in: [src/types/index.ts:1621](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1621)

Information about the agent that created/requested this task.

***

### status

> **status**: [`A2ATaskStatus`](../enumerations/A2ATaskStatus.md)

Defined in: [src/types/index.ts:1588](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1588)

Current status of the task.

***

### targetAgent?

> `optional` **targetAgent**: [`A2AAgentInfo`](A2AAgentInfo.md)

Defined in: [src/types/index.ts:1627](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1627)

Information about the agent assigned to execute this task (if assigned).

***

### taskId

> **taskId**: `string`

Defined in: [src/types/index.ts:1577](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1577)

Unique identifier for the task.

***

### threadId

> **threadId**: `string`

Defined in: [src/types/index.ts:1582](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1582)

The thread this task belongs to (top-level for efficient filtering).
