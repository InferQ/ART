[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / HITLFeedbackSchema

# Interface: HITLFeedbackSchema

Defined in: [src/types/hitl-types.ts:106](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L106)

Schema for what kind of feedback a blocking tool expects.

## Remarks

Tools declare this schema to inform the UI layer what input to collect.
The framework uses this to validate feedback and construct the tool result.

## Examples

```ts
// Simple confirmation
{
  inputType: 'confirm',
  prompt: 'Are you sure you want to delete this file?',
  confirmLabel: 'Delete',
  cancelLabel: 'Keep'
}
```

```ts
// Selection from options
{
  inputType: 'select',
  prompt: 'Which deployment environment should we use?',
  options: [
    { value: 'staging', label: 'Staging', description: 'Test environment' },
    { value: 'production', label: 'Production', description: 'Live environment' }
  ],
  required: true
}
```

```ts
// Text input with validation
{
  inputType: 'text',
  prompt: 'Please provide the API key for the service:',
  placeholder: 'sk-...',
  validation: {
    required: true,
    pattern: '^sk-[a-zA-Z0-9]{32,}$',
    patternMessage: 'Must be a valid API key starting with sk-'
  }
}
```

## Properties

### allowModifyArgs?

> `optional` **allowModifyArgs**: `boolean`

Defined in: [src/types/hitl-types.ts:160](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L160)

If true, user can modify the original tool arguments before submitting.
The modified args are returned in the feedback.

#### Default

```ts
false
```

***

### cancelLabel?

> `optional` **cancelLabel**: `string`

Defined in: [src/types/hitl-types.ts:153](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L153)

For confirm type: custom label for the reject button.

#### Default

```ts
'Reject'
```

***

### confirmLabel?

> `optional` **confirmLabel**: `string`

Defined in: [src/types/hitl-types.ts:147](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L147)

For confirm type: custom label for the approve button.

#### Default

```ts
'Approve'
```

***

### customSchema?

> `optional` **customSchema**: `Record`\<`string`, `unknown`\>

Defined in: [src/types/hitl-types.ts:165](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L165)

For custom inputType: application-defined JSON schema for the input.

***

### defaultValue?

> `optional` **defaultValue**: `unknown`

Defined in: [src/types/hitl-types.ts:136](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L136)

Optional default value to pre-fill.

***

### hint?

> `optional` **hint**: `string`

Defined in: [src/types/hitl-types.ts:170](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L170)

Optional hint text shown below the input.

***

### inputType

> **inputType**: [`HITLInputType`](../type-aliases/HITLInputType.md)

Defined in: [src/types/hitl-types.ts:110](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L110)

The type of input expected from the user.

***

### options?

> `optional` **options**: [`HITLSelectOption`](HITLSelectOption.md)[]

Defined in: [src/types/hitl-types.ts:126](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L126)

For select/multiselect: available options to choose from.

***

### placeholder?

> `optional` **placeholder**: `string`

Defined in: [src/types/hitl-types.ts:141](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L141)

Placeholder text for text/number inputs.

***

### prompt

> **prompt**: `string`

Defined in: [src/types/hitl-types.ts:116](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L116)

Human-readable prompt shown to the user.
This should clearly explain what input is needed and why.

***

### sensitive?

> `optional` **sensitive**: `boolean`

Defined in: [src/types/hitl-types.ts:177](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L177)

Whether this is a sensitive input (e.g., password, API key).
UI should mask the input if true.

#### Default

```ts
false
```

***

### title?

> `optional` **title**: `string`

Defined in: [src/types/hitl-types.ts:121](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L121)

Optional title for the feedback dialog/section.

***

### validation?

> `optional` **validation**: [`HITLInputValidation`](HITLInputValidation.md)

Defined in: [src/types/hitl-types.ts:131](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L131)

Validation constraints for the input.
