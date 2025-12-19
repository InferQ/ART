[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / OutputParser

# Interface: OutputParser

Defined in: [src/core/interfaces.ts:111](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L111)

Interface for parsing structured output from LLM responses.

## Methods

### parseExecutionOutput()

> **parseExecutionOutput**(`output`): `Promise`\<[`ExecutionOutput`](ExecutionOutput.md)\>

Defined in: [src/core/interfaces.ts:146](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L146)

Parses the raw string output from the execution LLM call (per todo item).

#### Parameters

##### output

`string`

The raw string response from the execution LLM call.

#### Returns

`Promise`\<[`ExecutionOutput`](ExecutionOutput.md)\>

A promise resolving to the structured execution output.

***

### parsePlanningOutput()

> **parsePlanningOutput**(`output`): `Promise`\<\{ `intent?`: `string`; `plan?`: `string`; `thoughts?`: `string`; `title?`: `string`; `todoList?`: [`TodoItem`](TodoItem.md)[]; `toolCalls?`: [`ParsedToolCall`](ParsedToolCall.md)[]; \}\>

Defined in: [src/core/interfaces.ts:132](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L132)

Parses the raw planning LLM output into structured fields.

#### Parameters

##### output

`string`

#### Returns

`Promise`\<\{ `intent?`: `string`; `plan?`: `string`; `thoughts?`: `string`; `title?`: `string`; `todoList?`: [`TodoItem`](TodoItem.md)[]; `toolCalls?`: [`ParsedToolCall`](ParsedToolCall.md)[]; \}\>

#### Remarks

This method should be resilient to provider-specific wrappers and formats.
Implementations MUST attempt JSON-first parsing and then fall back to parsing
labeled sections. Supported fields:
- `title?`: A concise thread title (<= 10 words), derived from the user's intent and context.
- `intent?`: A short summary of the user's goal.
- `plan?`: A human-readable list/description of steps.
- `toolCalls?`: Structured tool call intents parsed from the output.
- `thoughts?`: Aggregated content extracted from <think> tags when present.

***

### parseSynthesisOutput()

> **parseSynthesisOutput**(`output`): `Promise`\<`string`\>

Defined in: [src/core/interfaces.ts:155](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L155)

Parses the raw string output from the synthesis LLM call to extract the final, user-facing response content.
This might involve removing extraneous tags or formatting.

#### Parameters

##### output

`string`

The raw string response from the synthesis LLM call.

#### Returns

`Promise`\<`string`\>

A promise resolving to the clean, final response string.

#### Throws

If the final response cannot be extracted (typically code `OUTPUT_PARSING_FAILED`).
