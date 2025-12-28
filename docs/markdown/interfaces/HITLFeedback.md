[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / HITLFeedback

# Interface: HITLFeedback

Defined in: src/types/hitl-types.ts:274

The standardized feedback structure returned by the user.

## Remarks

This is the canonical format for user feedback. The framework converts this
into a successful tool result when resuming execution. The LLM sees this
as a normal tool completion.

## Properties

### approved

> **approved**: `boolean`

Defined in: src/types/hitl-types.ts:280

Whether the action was approved/confirmed.
For non-boolean input types, this is true if the user submitted
(vs. cancelled/dismissed).

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: src/types/hitl-types.ts:327

Optional metadata about the feedback context.

***

### modifiedArgs?

> `optional` **modifiedArgs**: `Record`\<`string`, `unknown`\>

Defined in: src/types/hitl-types.ts:311

Modified tool arguments if allowModifyArgs was true and user modified them.

***

### reason?

> `optional` **reason**: `string`

Defined in: src/types/hitl-types.ts:317

Optional reason/comment provided by the user.
Particularly useful for rejections to explain why.

***

### ~~selectedValues?~~

> `optional` **selectedValues**: (`string` \| `number` \| `boolean`)[]

Defined in: src/types/hitl-types.ts:306

For select/multiselect, the selected value(s).

#### Deprecated

Use `value` instead

***

### ~~textInput?~~

> `optional` **textInput**: `string`

Defined in: src/types/hitl-types.ts:300

For text input type, the raw text entered.

#### Deprecated

Use `value` instead

***

### timestamp

> **timestamp**: `number`

Defined in: src/types/hitl-types.ts:322

Timestamp when feedback was provided.

***

### value?

> `optional` **value**: `unknown`

Defined in: src/types/hitl-types.ts:294

The user's input value, type depends on the inputType:
- boolean: true/false
- text: string
- number: number
- select: the selected option's value
- multiselect: array of selected values
- date/datetime: ISO string
- file: file reference object
- confirm: undefined (use approved field)
- custom: matches customSchema
