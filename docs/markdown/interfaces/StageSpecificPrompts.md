[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / StageSpecificPrompts

# Interface: StageSpecificPrompts

Defined in: [src/types/index.ts:1899](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1899)

Defines stage-specific system prompts for planning and synthesis.

 StageSpecificPrompts

## Properties

### execution?

> `optional` **execution**: `string`

Defined in: [src/types/index.ts:1920](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1920)

Custom system prompt template for tool execution steps.
If provided, overrides the default execution prompt.
Supports variable interpolation: ${item.description}, ${completedItemsContext}, etc.

***

### planning?

> `optional` **planning**: `string`

Defined in: [src/types/index.ts:1905](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1905)

System prompt to guide the planning phase.
Focuses on reasoning, expertise, and tool selection.

***

### synthesis?

> `optional` **synthesis**: `string`

Defined in: [src/types/index.ts:1912](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1912)

System prompt to guide the synthesis phase.
Focuses on tone, formatting, and final response structure.
