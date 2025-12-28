[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / SystemPromptSpec

# Interface: SystemPromptSpec

Defined in: [src/types/index.ts:577](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L577)

Named preset for system prompts, supporting variables and a default merge strategy.

 SystemPromptSpec

## Properties

### defaultVariables?

> `optional` **defaultVariables**: `Record`\<`string`, `any`\>

Defined in: [src/types/index.ts:592](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L592)

Default variables applied if not provided at use time.

***

### id?

> `optional` **id**: `string`

Defined in: [src/types/index.ts:582](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L582)

Optional explicit ID; when in a registry map, the key is typically the tag.

***

### mergeStrategy?

> `optional` **mergeStrategy**: [`SystemPromptMergeStrategy`](../type-aliases/SystemPromptMergeStrategy.md)

Defined in: [src/types/index.ts:597](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L597)

Default strategy to combine this spec with lower levels. Defaults to 'append'.

***

### template

> **template**: `string`

Defined in: [src/types/index.ts:587](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L587)

Template string. Supports simple {{variable}} placeholders and {{fragment:name}} for PromptManager fragments.
