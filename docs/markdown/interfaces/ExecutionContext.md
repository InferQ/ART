[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ExecutionContext

# Interface: ExecutionContext

Defined in: [src/types/index.ts:941](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L941)

Context provided to a tool during its execution.

 ExecutionContext

## Properties

### hitlContext?

> `optional` **hitlContext**: [`HITLContext`](HITLContext.md)

Defined in: [src/types/index.ts:973](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L973)

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

Defined in: [src/types/index.ts:946](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L946)

The ID of the thread in which the tool is being executed.

***

### traceId?

> `optional` **traceId**: `string`

Defined in: [src/types/index.ts:951](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L951)

The trace ID for this execution cycle, if available.

***

### userId?

> `optional` **userId**: `string`

Defined in: [src/types/index.ts:956](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L956)

The user ID associated with the execution, if available.
