[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / StageSpecificPrompts

# Interface: StageSpecificPrompts

Defined in: [src/types/index.ts:1776](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1776)

Defines stage-specific system prompts for planning and synthesis.

 StageSpecificPrompts

## Properties

### planning?

> `optional` **planning**: `string`

Defined in: [src/types/index.ts:1782](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1782)

System prompt to guide the planning phase.
Focuses on reasoning, expertise, and tool selection.

***

### synthesis?

> `optional` **synthesis**: `string`

Defined in: [src/types/index.ts:1789](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1789)

System prompt to guide the synthesis phase.
Focuses on tone, formatting, and final response structure.
