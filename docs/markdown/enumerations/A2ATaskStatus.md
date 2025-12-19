[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / A2ATaskStatus

# Enumeration: A2ATaskStatus

Defined in: [src/types/index.ts:1349](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1349)

Represents the possible states of an A2A (Agent-to-Agent) task.

## Enumeration Members

### CANCELLED

> **CANCELLED**: `"CANCELLED"`

Defined in: [src/types/index.ts:1359](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1359)

Task has been cancelled before completion.

***

### COMPLETED

> **COMPLETED**: `"COMPLETED"`

Defined in: [src/types/index.ts:1355](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1355)

Task has been completed successfully.

***

### FAILED

> **FAILED**: `"FAILED"`

Defined in: [src/types/index.ts:1357](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1357)

Task has failed during execution.

***

### IN\_PROGRESS

> **IN\_PROGRESS**: `"IN_PROGRESS"`

Defined in: [src/types/index.ts:1353](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1353)

Task has been assigned to an agent and is being processed.

***

### PENDING

> **PENDING**: `"PENDING"`

Defined in: [src/types/index.ts:1351](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1351)

Task has been created but not yet assigned to an agent.

***

### REVIEW

> **REVIEW**: `"REVIEW"`

Defined in: [src/types/index.ts:1363](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1363)

Task is being reviewed for quality assurance.

***

### WAITING

> **WAITING**: `"WAITING"`

Defined in: [src/types/index.ts:1361](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1361)

Task is waiting for external dependencies or manual intervention.
