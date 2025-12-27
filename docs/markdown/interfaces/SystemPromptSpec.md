[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / SystemPromptSpec

# Interface: SystemPromptSpec

Defined in: [src/types/index.ts:531](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L531)

Named preset for system prompts, supporting variables and a default merge strategy.

 SystemPromptSpec

## Properties

### defaultVariables?

> `optional` **defaultVariables**: `Record`\<`string`, `any`\>

Defined in: [src/types/index.ts:546](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L546)

Default variables applied if not provided at use time.

***

### id?

> `optional` **id**: `string`

Defined in: [src/types/index.ts:536](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L536)

Optional explicit ID; when in a registry map, the key is typically the tag.

***

### mergeStrategy?

> `optional` **mergeStrategy**: [`SystemPromptMergeStrategy`](../type-aliases/SystemPromptMergeStrategy.md)

Defined in: [src/types/index.ts:551](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L551)

Default strategy to combine this spec with lower levels. Defaults to 'append'.

***

### template

> **template**: `string`

Defined in: [src/types/index.ts:541](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L541)

Template string. Supports simple {{variable}} placeholders and {{fragment:name}} for PromptManager fragments.
