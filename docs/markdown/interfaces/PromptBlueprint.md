[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / PromptBlueprint

# Interface: PromptBlueprint

Defined in: [src/types/index.ts:1121](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1121)

Represents a Mustache template that can be rendered with a PromptContext to produce an ArtStandardPrompt.
Used by the PromptManager.assemblePrompt method.

 PromptBlueprint

## Properties

### template

> **template**: `string`

Defined in: [src/types/index.ts:1126](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1126)

The Mustache template string that will be rendered with context data to produce a JSON string representing an ArtStandardPrompt
