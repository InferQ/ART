[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / A2ATaskResult

# Interface: A2ATaskResult

Defined in: [src/types/index.ts:1604](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1604)

Represents the result of an A2A task execution.

 A2ATaskResult

## Properties

### data?

> `optional` **data**: `any`

Defined in: [src/types/index.ts:1614](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1614)

The data returned by the task execution.

***

### durationMs?

> `optional` **durationMs**: `number`

Defined in: [src/types/index.ts:1636](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1636)

Execution duration in milliseconds.

***

### error?

> `optional` **error**: `string`

Defined in: [src/types/index.ts:1619](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1619)

Error message if the task failed.

***

### metadata?

> `optional` **metadata**: `object`

Defined in: [src/types/index.ts:1624](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1624)

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

Defined in: [src/types/index.ts:1609](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1609)

Whether the task execution was successful.
