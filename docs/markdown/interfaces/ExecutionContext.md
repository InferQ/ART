[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ExecutionContext

# Interface: ExecutionContext

Defined in: [src/types/index.ts:953](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L953)

Context provided to a tool during its execution.

 ExecutionContext

## Properties

### hitlContext?

> `optional` **hitlContext**: [`HITLContext`](HITLContext.md)

Defined in: [src/types/index.ts:985](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L985)

HITL context for blocking tools.

#### Remarks

This enables blocking tools to differentiate between:
- Initial invocation (should return 'suspended' to request user input)
- Post-approval invocation (if completesOnApproval is false, tool is re-executed)

For most blocking tools with completesOnApproval=true (default), the tool is NOT
re-executed after approval - the framework creates the success result programmatically.
This field is only populated when completesOnApproval=false and the tool needs
to perform actual work after user approval.

***

### threadId

> **threadId**: `string`

Defined in: [src/types/index.ts:958](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L958)

The ID of the thread in which the tool is being executed.

***

### traceId?

> `optional` **traceId**: `string`

Defined in: [src/types/index.ts:963](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L963)

The trace ID for this execution cycle, if available.

***

### userId?

> `optional` **userId**: `string`

Defined in: [src/types/index.ts:968](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L968)

The user ID associated with the execution, if available.
