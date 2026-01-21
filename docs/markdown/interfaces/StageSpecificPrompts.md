[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / StageSpecificPrompts

# Interface: StageSpecificPrompts

Defined in: [src/types/index.ts:1911](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1911)

Defines stage-specific system prompts for planning and synthesis.

 StageSpecificPrompts

## Properties

### execution?

> `optional` **execution**: `string`

Defined in: [src/types/index.ts:1932](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1932)

Custom system prompt template for tool execution steps.
If provided, overrides the default execution prompt.
Supports variable interpolation: ${item.description}, ${completedItemsContext}, etc.

***

### planning?

> `optional` **planning**: `string`

Defined in: [src/types/index.ts:1917](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1917)

System prompt to guide the planning phase.
Focuses on reasoning, expertise, and tool selection.

***

### synthesis?

> `optional` **synthesis**: `string`

Defined in: [src/types/index.ts:1924](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1924)

System prompt to guide the synthesis phase.
Focuses on tone, formatting, and final response structure.
