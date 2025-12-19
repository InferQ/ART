[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / A2ATaskResult

# Interface: A2ATaskResult

Defined in: [src/types/index.ts:1519](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1519)

Represents the result of an A2A task execution.

 A2ATaskResult

## Properties

### data?

> `optional` **data**: `any`

Defined in: [src/types/index.ts:1529](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1529)

The data returned by the task execution.

***

### durationMs?

> `optional` **durationMs**: `number`

Defined in: [src/types/index.ts:1551](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1551)

Execution duration in milliseconds.

***

### error?

> `optional` **error**: `string`

Defined in: [src/types/index.ts:1534](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1534)

Error message if the task failed.

***

### metadata?

> `optional` **metadata**: `object`

Defined in: [src/types/index.ts:1539](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1539)

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

Defined in: [src/types/index.ts:1524](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1524)

Whether the task execution was successful.
