[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / A2ATaskStatus

# Enumeration: A2ATaskStatus

Defined in: [src/types/index.ts:1361](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1361)

Represents the possible states of an A2A (Agent-to-Agent) task.

## Enumeration Members

### CANCELLED

> **CANCELLED**: `"CANCELLED"`

Defined in: [src/types/index.ts:1371](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1371)

Task has been cancelled before completion.

***

### COMPLETED

> **COMPLETED**: `"COMPLETED"`

Defined in: [src/types/index.ts:1367](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1367)

Task has been completed successfully.

***

### FAILED

> **FAILED**: `"FAILED"`

Defined in: [src/types/index.ts:1369](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1369)

Task has failed during execution.

***

### IN\_PROGRESS

> **IN\_PROGRESS**: `"IN_PROGRESS"`

Defined in: [src/types/index.ts:1365](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1365)

Task has been assigned to an agent and is being processed.

***

### PENDING

> **PENDING**: `"PENDING"`

Defined in: [src/types/index.ts:1363](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1363)

Task has been created but not yet assigned to an agent.

***

### REVIEW

> **REVIEW**: `"REVIEW"`

Defined in: [src/types/index.ts:1375](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1375)

Task is being reviewed for quality assurance.

***

### WAITING

> **WAITING**: `"WAITING"`

Defined in: [src/types/index.ts:1373](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1373)

Task is waiting for external dependencies or manual intervention.
