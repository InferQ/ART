[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / OutputParser

# Class: OutputParser

Defined in: [src/systems/reasoning/OutputParser.ts:122](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/systems/reasoning/OutputParser.ts#L122)

Default implementation of the IOutputParser interface.

## Remarks

This class provides robust parsing capabilities for structured output from LLMs.
It is designed to handle variations in LLM output formatting across different providers
and models. The parser uses a multi-tier strategy for extracting structured data:

1. XML Tag Extraction: Extracts content from XML-like tags (e.g., <think>)
   using the XmlMatcher utility. This separates "thoughts" or "reasoning" from
   the main structured output.

2. JSON Extraction: Attempts multiple strategies to find and parse JSON:
   - Priority 1: Explicit JSON markers (---JSON_OUTPUT_START--- ... ---JSON_OUTPUT_END---)
   - Priority 2: Markdown code blocks (```json ... ``` or ``` ... ```)
   - Priority 3: Strip markdown fences and attempt direct parsing
   - Priority 4: Find JSON object by brace matching for mixed content

3. Schema Validation: Uses Zod schemas to validate parsed structures:
   - ParsedToolCall validation ensures tool calls have required fields
   - TodoItem validation ensures todo items conform to expected structure

4. Fallback Parsing: If JSON extraction fails, attempts to extract information
   from labeled sections (e.g., "Title: ...", "Intent: ...", "Plan: ...")

The parser is resilient to:
- Malformed or incomplete XML tags
- Missing or malformed JSON
- Mixed content (text + JSON)
- Provider-specific formatting differences

 OutputParser

## Implements

IOutputParser

## Implements

- `OutputParser`

## Constructors

### Constructor

> **new OutputParser**(): `OutputParser`

#### Returns

`OutputParser`

## Methods

### parseExecutionOutput()

> **parseExecutionOutput**(`output`): `Promise`\<[`ExecutionOutput`](../interfaces/ExecutionOutput.md)\>

Defined in: [src/systems/reasoning/OutputParser.ts:377](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/systems/reasoning/OutputParser.ts#L377)

Parses the raw string output from an execution LLM call (per todo item).

#### Parameters

##### output

`string`

The raw string response from the execution LLM.

#### Returns

`Promise`\<[`ExecutionOutput`](../interfaces/ExecutionOutput.md)\>

A promise resolving to an ExecutionOutput object containing:
         - thoughts (string, optional): Extracted from <think> tags
         - toolCalls (ParsedToolCall[], optional): Parsed tool call requests
         - nextStepDecision (string, optional): How to proceed
         - updatedPlan (object, optional): Plan modifications
         - content (string, optional): Freeform text response

#### Remarks

The execution phase generates output that may include:
- thoughts: Reasoning extracted from <think> tags
- toolCalls: Structured tool call requests for the current step
- nextStepDecision: Decision on how to proceed (continue, wait, complete_item, update_plan)
- updatedPlan: Modifications to the execution plan
- content: Freeform text response

This method:
1. Extracts thoughts from <think> tags using XmlMatcher
2. Attempts to parse the remaining content as JSON
3. Validates toolCalls against Zod schema
4. Extracts structured fields if JSON parsing succeeds
5. Falls back to treating everything as freeform content if JSON fails

The nextStepDecision values guide the TAEF execution:
- 'continue': Proceed with next iteration
- 'wait': Pause execution (rare in execution phase)
- 'complete_item': Mark current todo item as complete
- 'update_plan': Modify the execution plan

#### Throws

Never throws; errors are handled gracefully with empty results.

#### Implementation of

`IOutputParser.parseExecutionOutput`

***

### parsePlanningOutput()

> **parsePlanningOutput**(`output`): `Promise`\<\{ `intent?`: `string`; `plan?`: `string`; `thoughts?`: `string`; `title?`: `string`; `todoList?`: [`TodoItem`](../interfaces/TodoItem.md)[]; `toolCalls?`: [`ParsedToolCall`](../interfaces/ParsedToolCall.md)[]; \}\>

Defined in: [src/systems/reasoning/OutputParser.ts:232](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/systems/reasoning/OutputParser.ts#L232)

Parses the raw string output from the planning LLM call.

#### Parameters

##### output

`string`

The raw string response from the planning LLM.

#### Returns

`Promise`\<\{ `intent?`: `string`; `plan?`: `string`; `thoughts?`: `string`; `title?`: `string`; `todoList?`: [`TodoItem`](../interfaces/TodoItem.md)[]; `toolCalls?`: [`ParsedToolCall`](../interfaces/ParsedToolCall.md)[]; \}\>

A promise resolving to an object containing:
         - title (string, optional): Concise thread title
         - intent (string, optional): User's goal summary
         - plan (string, optional): Human-readable plan description
         - toolCalls (ParsedToolCall[], optional): Parsed tool call requests
         - todoList (TodoItem[], optional): List of execution steps
         - thoughts (string, optional): Extracted from <think> tags

#### Remarks

The planning phase generates structured output including:
- title: A concise thread title (<= 10 words)
- intent: A summary of the user's goal
- plan: A human-readable description of the approach
- toolCalls: Structured tool call requests
- todoList: A list of TodoItem objects representing the execution plan
- thoughts: Content extracted from <think> XML tags

This method:
1. Extracts thoughts from <think> tags using XmlMatcher
2. Attempts to parse the remaining content as JSON
3. Validates toolCalls against Zod schema
4. Validates todoList against Zod schema
5. Falls back to section-based parsing if JSON fails

The fallback section-based parsing looks for labeled sections like:
"Title: ...", "Intent: ...", "Plan: ..." using regex patterns.

#### Throws

Never throws; errors are handled gracefully with empty results.

#### Implementation of

`IOutputParser.parsePlanningOutput`

***

### parseSynthesisOutput()

> **parseSynthesisOutput**(`output`): `Promise`\<`string`\>

Defined in: [src/systems/reasoning/OutputParser.ts:479](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/systems/reasoning/OutputParser.ts#L479)

Parses the raw string output from the synthesis LLM call.

#### Parameters

##### output

`string`

The raw string response from the synthesis LLM.

#### Returns

`Promise`\<`string`\>

A promise resolving to the cleaned, final response string.

#### Remarks

The synthesis phase generates the final, user-facing response.
This method typically just trims the output, as synthesis output
is usually freeform text without structured components.

Future enhancements might include:
- Removing extraneous tags or markers
- Formatting cleanup
- Extracting specific sections if needed

#### Throws

Never throws; always returns at least an empty string.

#### Implementation of

`IOutputParser.parseSynthesisOutput`
