[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / SystemPromptSpec

# Interface: SystemPromptSpec

Defined in: [src/types/index.ts:540](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L540)

Named preset for system prompts, supporting variables and a default merge strategy.

 SystemPromptSpec

## Properties

### defaultVariables?

> `optional` **defaultVariables**: `Record`\<`string`, `any`\>

Defined in: [src/types/index.ts:555](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L555)

Default variables applied if not provided at use time.

***

### id?

> `optional` **id**: `string`

Defined in: [src/types/index.ts:545](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L545)

Optional explicit ID; when in a registry map, the key is typically the tag.

***

### mergeStrategy?

> `optional` **mergeStrategy**: [`SystemPromptMergeStrategy`](../type-aliases/SystemPromptMergeStrategy.md)

Defined in: [src/types/index.ts:560](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L560)

Default strategy to combine this spec with lower levels. Defaults to 'append'.

***

### template

> **template**: `string`

Defined in: [src/types/index.ts:550](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L550)

Template string. Supports simple {{variable}} placeholders and {{fragment:name}} for PromptManager fragments.
