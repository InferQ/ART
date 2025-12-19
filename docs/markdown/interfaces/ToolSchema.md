[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ToolSchema

# Interface: ToolSchema

Defined in: [src/types/index.ts:455](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L455)

Defines the schema for a tool, including its input parameters.
Uses JSON Schema format for inputSchema.

 ToolSchema

## Properties

### description

> **description**: `string`

Defined in: [src/types/index.ts:465](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L465)

A clear description of what the tool does, intended for the LLM to understand its purpose and usage.

***

### examples?

> `optional` **examples**: `object`[]

Defined in: [src/types/index.ts:480](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L480)

Optional array of examples demonstrating how to use the tool, useful for few-shot prompting of the LLM.

#### description?

> `optional` **description**: `string`

#### input

> **input**: `any`

#### output?

> `optional` **output**: `any`

***

### inputSchema

> **inputSchema**: [`JsonSchema`](../type-aliases/JsonSchema.md)

Defined in: [src/types/index.ts:470](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L470)

A JSON Schema object defining the structure, types, and requirements of the input arguments the tool expects.

***

### name

> **name**: `string`

Defined in: [src/types/index.ts:460](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L460)

A unique name identifying the tool (used in LLM prompts and registry lookups). Must be unique.

***

### outputSchema?

> `optional` **outputSchema**: [`JsonSchema`](../type-aliases/JsonSchema.md)

Defined in: [src/types/index.ts:475](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L475)

An optional JSON Schema object defining the expected structure of the data returned in the `output` field of a successful `ToolResult`.
