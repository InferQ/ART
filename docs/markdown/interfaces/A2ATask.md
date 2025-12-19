[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / A2ATask

# Interface: A2ATask

Defined in: [src/types/index.ts:1560](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1560)

Represents a task for Agent-to-Agent (A2A) communication and delegation.
Used for asynchronous task delegation between AI agents in distributed systems.

 A2ATask

## Properties

### callbackUrl?

> `optional` **callbackUrl**: `string`

Defined in: [src/types/index.ts:1639](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1639)

Callback URL or identifier for task completion notifications.

***

### dependencies?

> `optional` **dependencies**: `string`[]

Defined in: [src/types/index.ts:1645](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1645)

Dependencies that must be completed before this task can start.

***

### metadata

> **metadata**: [`A2ATaskMetadata`](A2ATaskMetadata.md)

Defined in: [src/types/index.ts:1627](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1627)

Task execution metadata.

***

### payload

> **payload**: `object`

Defined in: [src/types/index.ts:1582](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1582)

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

Defined in: [src/types/index.ts:1621](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1621)

Task priority level.

***

### result?

> `optional` **result**: [`A2ATaskResult`](A2ATaskResult.md)

Defined in: [src/types/index.ts:1633](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1633)

The result of task execution (if completed).

***

### sourceAgent

> **sourceAgent**: [`A2AAgentInfo`](A2AAgentInfo.md)

Defined in: [src/types/index.ts:1609](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1609)

Information about the agent that created/requested this task.

***

### status

> **status**: [`A2ATaskStatus`](../enumerations/A2ATaskStatus.md)

Defined in: [src/types/index.ts:1576](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1576)

Current status of the task.

***

### targetAgent?

> `optional` **targetAgent**: [`A2AAgentInfo`](A2AAgentInfo.md)

Defined in: [src/types/index.ts:1615](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1615)

Information about the agent assigned to execute this task (if assigned).

***

### taskId

> **taskId**: `string`

Defined in: [src/types/index.ts:1565](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1565)

Unique identifier for the task.

***

### threadId

> **threadId**: `string`

Defined in: [src/types/index.ts:1570](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1570)

The thread this task belongs to (top-level for efficient filtering).
