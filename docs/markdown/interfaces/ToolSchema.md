[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ToolSchema

# Interface: ToolSchema

Defined in: [src/types/index.ts:458](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L458)

Defines the schema for a tool, including its input parameters.
Uses JSON Schema format for inputSchema.

 ToolSchema

## Properties

### blockingConfig?

> `optional` **blockingConfig**: [`BlockingToolConfig`](BlockingToolConfig.md)

Defined in: [src/types/index.ts:509](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L509)

Configuration for blocking tools (HITL).
Only applicable when executionMode is 'blocking'.

***

### description

> **description**: `string`

Defined in: [src/types/index.ts:468](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L468)

A clear description of what the tool does, intended for the LLM to understand its purpose and usage.

***

### displayConfig?

> `optional` **displayConfig**: [`DisplayToolConfig`](DisplayToolConfig.md)

Defined in: [src/types/index.ts:516](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L516)

Configuration for display tools (Generative UI).
Only applicable when executionMode is 'display'.

***

### examples?

> `optional` **examples**: `object`[]

Defined in: [src/types/index.ts:483](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L483)

Optional array of examples demonstrating how to use the tool, useful for few-shot prompting of the LLM.

#### description?

> `optional` **description**: `string`

#### input

> **input**: `any`

#### output?

> `optional` **output**: `any`

***

### executionMode?

> `optional` **executionMode**: `"functional"` \| `"blocking"` \| `"display"` \| `"immediate"`

Defined in: [src/types/index.ts:502](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L502)

Defines the execution mode (category) of the tool.

#### Remarks

Tools are categorized into three modes with different framework handling:

- `functional` (default, also 'immediate' for backward compat): Regular tools that
  execute synchronously and return results immediately.

- `blocking`: HITL tools that require human input to complete. They return 'suspended'
  status initially. When user provides feedback, the framework programmatically
  completes the tool with the feedback as output - no re-execution needed.

- `display`: Generative UI tools that render visual content. They complete immediately
  but their output is meant for rendering rather than LLM consumption.

***

### inputSchema

> **inputSchema**: [`JsonSchema`](../type-aliases/JsonSchema.md)

Defined in: [src/types/index.ts:473](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L473)

A JSON Schema object defining the structure, types, and requirements of the input arguments the tool expects.

***

### name

> **name**: `string`

Defined in: [src/types/index.ts:463](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L463)

A unique name identifying the tool (used in LLM prompts and registry lookups). Must be unique.

***

### outputSchema?

> `optional` **outputSchema**: [`JsonSchema`](../type-aliases/JsonSchema.md)

Defined in: [src/types/index.ts:478](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L478)

An optional JSON Schema object defining the expected structure of the data returned in the `output` field of a successful `ToolResult`.
