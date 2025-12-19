[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ExecutionContext

# Interface: ExecutionContext

Defined in: [src/types/index.ts:889](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L889)

Context provided to a tool during its execution.

 ExecutionContext

## Properties

### threadId

> **threadId**: `string`

Defined in: [src/types/index.ts:894](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L894)

The ID of the thread in which the tool is being executed.

***

### traceId?

> `optional` **traceId**: `string`

Defined in: [src/types/index.ts:899](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L899)

The trace ID for this execution cycle, if available.

***

### userId?

> `optional` **userId**: `string`

Defined in: [src/types/index.ts:904](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L904)

The user ID associated with the execution, if available.
