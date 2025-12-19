[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / SystemPromptsRegistry

# Interface: SystemPromptsRegistry

Defined in: [src/types/index.ts:568](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L568)

Registry of available system prompt presets (tags) at the instance level.

 SystemPromptsRegistry

## Properties

### defaultTag?

> `optional` **defaultTag**: `string`

Defined in: [src/types/index.ts:573](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L573)

Tag to use when no other tag is specified.

***

### specs

> **specs**: `Record`\<`string`, [`SystemPromptSpec`](SystemPromptSpec.md)\>

Defined in: [src/types/index.ts:578](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L578)

Mapping of tag -> spec.
