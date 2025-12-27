[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / SystemPromptOverride

# Interface: SystemPromptOverride

Defined in: [src/types/index.ts:578](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L578)

Override provided at instance/thread/call level to select a tag and/or provide variables,
or to provide freeform content and a merge strategy.

 SystemPromptOverride

## Properties

### content?

> `optional` **content**: `string`

Defined in: [src/types/index.ts:593](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L593)

Freeform content to apply directly (escape hatch).

***

### strategy?

> `optional` **strategy**: [`SystemPromptMergeStrategy`](../type-aliases/SystemPromptMergeStrategy.md)

Defined in: [src/types/index.ts:598](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L598)

Merge behavior against previous level: append | prepend.

***

### tag?

> `optional` **tag**: `string`

Defined in: [src/types/index.ts:583](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L583)

Preset tag from the registry (e.g., 'default', 'legal_advisor').

***

### variables?

> `optional` **variables**: `Record`\<`string`, `any`\>

Defined in: [src/types/index.ts:588](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L588)

Variables to substitute in the selected template.
