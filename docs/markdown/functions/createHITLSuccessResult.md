[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / createHITLSuccessResult

# Function: createHITLSuccessResult()

> **createHITLSuccessResult**(`originalCall`, `feedback`, `suspensionId?`): [`BlockingToolCompletedResult`](../interfaces/BlockingToolCompletedResult.md)

Defined in: src/types/hitl-types.ts:592

Creates a standardized successful result from HITL feedback.

## Parameters

### originalCall

The original tool call that was suspended

#### arguments?

`unknown`

#### callId

`string`

#### toolName

`string`

### feedback

[`HITLFeedback`](../interfaces/HITLFeedback.md)

The user's feedback

### suspensionId?

`string`

The suspension ID being resolved

## Returns

[`BlockingToolCompletedResult`](../interfaces/BlockingToolCompletedResult.md)

A properly formatted successful ToolResult
