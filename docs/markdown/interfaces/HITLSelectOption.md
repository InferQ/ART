[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / HITLSelectOption

# Interface: HITLSelectOption

Defined in: src/types/hitl-types.ts:183

An option for select/multiselect input types.

## Properties

### description?

> `optional` **description**: `string`

Defined in: src/types/hitl-types.ts:197

Optional description providing more context about this option.

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: src/types/hitl-types.ts:203

Whether this option is disabled (shown but not selectable).

#### Default

```ts
false
```

***

### icon?

> `optional` **icon**: `string`

Defined in: src/types/hitl-types.ts:208

Optional icon identifier for UI rendering.

***

### label

> **label**: `string`

Defined in: src/types/hitl-types.ts:192

Human-readable label displayed to the user.

***

### value

> **value**: `string` \| `number` \| `boolean`

Defined in: src/types/hitl-types.ts:187

The value returned when this option is selected.
