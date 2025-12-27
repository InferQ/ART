[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ToolSchema

# Interface: ToolSchema

Defined in: [src/types/index.ts:437](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L437)

Defines the schema for a tool, including its input parameters.
Uses JSON Schema format for inputSchema.

 ToolSchema

## Properties

### description

> **description**: `string`

Defined in: [src/types/index.ts:447](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L447)

A clear description of what the tool does, intended for the LLM to understand its purpose and usage.

***

### examples?

> `optional` **examples**: `object`[]

Defined in: [src/types/index.ts:462](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L462)

Optional array of examples demonstrating how to use the tool, useful for few-shot prompting of the LLM.

#### description?

> `optional` **description**: `string`

#### input

> **input**: `any`

#### output?

> `optional` **output**: `any`

***

### executionMode?

> `optional` **executionMode**: `"immediate"` \| `"blocking"`

Defined in: [src/types/index.ts:470](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L470)

Defines the execution mode of the tool.
- 'immediate': The tool executes and returns a result immediately (default).
- 'blocking': The tool initiates a process that requires human intervention (HITL).
              The agent will suspend execution until resumed.

***

### inputSchema

> **inputSchema**: [`JsonSchema`](../type-aliases/JsonSchema.md)

Defined in: [src/types/index.ts:452](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L452)

A JSON Schema object defining the structure, types, and requirements of the input arguments the tool expects.

***

### name

> **name**: `string`

Defined in: [src/types/index.ts:442](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L442)

A unique name identifying the tool (used in LLM prompts and registry lookups). Must be unique.

***

### outputSchema?

> `optional` **outputSchema**: [`JsonSchema`](../type-aliases/JsonSchema.md)

Defined in: [src/types/index.ts:457](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L457)

An optional JSON Schema object defining the expected structure of the data returned in the `output` field of a successful `ToolResult`.
