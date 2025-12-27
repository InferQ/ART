[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / StageSpecificPrompts

# Interface: StageSpecificPrompts

Defined in: [src/types/index.ts:1826](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1826)

Defines stage-specific system prompts for planning and synthesis.

 StageSpecificPrompts

## Properties

### execution?

> `optional` **execution**: `string`

Defined in: [src/types/index.ts:1847](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1847)

Custom system prompt template for tool execution steps.
If provided, overrides the default execution prompt.
Supports variable interpolation: ${item.description}, ${completedItemsContext}, etc.

***

### planning?

> `optional` **planning**: `string`

Defined in: [src/types/index.ts:1832](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1832)

System prompt to guide the planning phase.
Focuses on reasoning, expertise, and tool selection.

***

### synthesis?

> `optional` **synthesis**: `string`

Defined in: [src/types/index.ts:1839](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1839)

System prompt to guide the synthesis phase.
Focuses on tone, formatting, and final response structure.
