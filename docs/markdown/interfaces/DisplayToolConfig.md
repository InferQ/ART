[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / DisplayToolConfig

# Interface: DisplayToolConfig

Defined in: [src/types/hitl-types.ts:400](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L400)

Configuration for display tools in the ToolSchema.

## Remarks

This is added to ToolSchema when executionMode is 'display'.
Display tools render UI without producing traditional results.

## Properties

### componentType?

> `optional` **componentType**: `string`

Defined in: [src/types/hitl-types.ts:404](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L404)

The type of UI component this tool renders.

***

### dataSchema?

> `optional` **dataSchema**: `Record`\<`string`, `unknown`\>

Defined in: [src/types/hitl-types.ts:422](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L422)

Schema for the data this display component expects.

***

### displayMode?

> `optional` **displayMode**: `"persistent"` \| `"ephemeral"` \| `"modal"`

Defined in: [src/types/hitl-types.ts:410](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L410)

Whether the display persists or is ephemeral.

#### Default

```ts
'persistent'
```

***

### interactive?

> `optional` **interactive**: `boolean`

Defined in: [src/types/hitl-types.ts:417](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L417)

Whether this display supports user interaction.
If true, interactions may generate new messages.

#### Default

```ts
false
```
