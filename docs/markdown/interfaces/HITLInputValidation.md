[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / HITLInputValidation

# Interface: HITLInputValidation

Defined in: src/types/hitl-types.ts:214

Validation constraints for HITL input.

## Properties

### max?

> `optional` **max**: `number`

Defined in: src/types/hitl-types.ts:239

For number: maximum value.

***

### maxLength?

> `optional` **maxLength**: `number`

Defined in: src/types/hitl-types.ts:229

For text: maximum character length.

***

### maxSelections?

> `optional` **maxSelections**: `number`

Defined in: src/types/hitl-types.ts:259

For multiselect: maximum number of selections allowed.

***

### min?

> `optional` **min**: `number`

Defined in: src/types/hitl-types.ts:234

For number: minimum value.

***

### minLength?

> `optional` **minLength**: `number`

Defined in: src/types/hitl-types.ts:224

For text: minimum character length.

***

### minSelections?

> `optional` **minSelections**: `number`

Defined in: src/types/hitl-types.ts:254

For multiselect: minimum number of selections required.

***

### pattern?

> `optional` **pattern**: `string`

Defined in: src/types/hitl-types.ts:244

For text: regex pattern the input must match.

***

### patternMessage?

> `optional` **patternMessage**: `string`

Defined in: src/types/hitl-types.ts:249

Custom error message when pattern validation fails.

***

### required?

> `optional` **required**: `boolean`

Defined in: src/types/hitl-types.ts:219

Whether the input is required (non-empty).

#### Default

```ts
false
```
