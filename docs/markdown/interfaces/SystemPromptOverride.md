[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / SystemPromptOverride

# Interface: SystemPromptOverride

Defined in: [src/types/index.ts:636](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L636)

Override provided at instance/thread/call level to select a tag and/or provide variables,
or to provide freeform content and a merge strategy.

 SystemPromptOverride

## Properties

### content?

> `optional` **content**: `string`

Defined in: [src/types/index.ts:651](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L651)

Freeform content to apply directly (escape hatch).

***

### strategy?

> `optional` **strategy**: [`SystemPromptMergeStrategy`](../type-aliases/SystemPromptMergeStrategy.md)

Defined in: [src/types/index.ts:656](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L656)

Merge behavior against previous level: append | prepend.

***

### tag?

> `optional` **tag**: `string`

Defined in: [src/types/index.ts:641](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L641)

Preset tag from the registry (e.g., 'default', 'legal_advisor').

***

### variables?

> `optional` **variables**: `Record`\<`string`, `any`\>

Defined in: [src/types/index.ts:646](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L646)

Variables to substitute in the selected template.
