[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / SystemPromptOverride

# Interface: SystemPromptOverride

Defined in: [src/types/index.ts:587](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L587)

Override provided at instance/thread/call level to select a tag and/or provide variables,
or to provide freeform content and a merge strategy.

 SystemPromptOverride

## Properties

### content?

> `optional` **content**: `string`

Defined in: [src/types/index.ts:602](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L602)

Freeform content to apply directly (escape hatch).

***

### strategy?

> `optional` **strategy**: [`SystemPromptMergeStrategy`](../type-aliases/SystemPromptMergeStrategy.md)

Defined in: [src/types/index.ts:607](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L607)

Merge behavior against previous level: append | prepend.

***

### tag?

> `optional` **tag**: `string`

Defined in: [src/types/index.ts:592](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L592)

Preset tag from the registry (e.g., 'default', 'legal_advisor').

***

### variables?

> `optional` **variables**: `Record`\<`string`, `any`\>

Defined in: [src/types/index.ts:597](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L597)

Variables to substitute in the selected template.
