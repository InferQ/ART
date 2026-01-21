[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / SystemPromptsRegistry

# Interface: SystemPromptsRegistry

Defined in: [src/types/index.ts:617](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L617)

Registry of available system prompt presets (tags) at the instance level.

 SystemPromptsRegistry

## Properties

### defaultTag?

> `optional` **defaultTag**: `string`

Defined in: [src/types/index.ts:622](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L622)

Tag to use when no other tag is specified.

***

### specs

> **specs**: `Record`\<`string`, [`SystemPromptSpec`](SystemPromptSpec.md)\>

Defined in: [src/types/index.ts:627](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L627)

Mapping of tag -> spec.
