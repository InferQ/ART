[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / IToolExecutor

# Interface: IToolExecutor

Defined in: [src/core/interfaces.ts:175](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L175)

Interface for the executable logic of a tool.

## Properties

### schema

> `readonly` **schema**: [`ToolSchema`](ToolSchema.md)

Defined in: [src/core/interfaces.ts:177](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L177)

The schema definition for this tool.

## Methods

### execute()

> **execute**(`input`, `context`): `Promise`\<[`ToolResult`](ToolResult.md)\>

Defined in: [src/core/interfaces.ts:185](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/core/interfaces.ts#L185)

Executes the tool's logic.

#### Parameters

##### input

`any`

Validated input arguments matching the tool's inputSchema.

##### context

[`ExecutionContext`](ExecutionContext.md)

Execution context containing threadId, traceId, etc.

#### Returns

`Promise`\<[`ToolResult`](ToolResult.md)\>

A promise resolving to the structured tool result.
