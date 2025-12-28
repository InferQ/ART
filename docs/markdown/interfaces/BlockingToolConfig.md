[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / BlockingToolConfig

# Interface: BlockingToolConfig

Defined in: src/types/hitl-types.ts:341

Configuration for blocking tools in the ToolSchema.

## Remarks

This is added to ToolSchema when executionMode is 'blocking'.
It defines how the tool interacts with the HITL system.

## Properties

### allowRetryOnReject?

> `optional` **allowRetryOnReject**: `boolean`

Defined in: src/types/hitl-types.ts:368

Whether rejection allows retry with modified arguments.
If true, rejection doesn't fail the step but allows re-planning.

#### Default

```ts
true
```

***

### approvalPrompt?

> `optional` **approvalPrompt**: `string`

Defined in: src/types/hitl-types.ts:353

Message to show in the approval dialog.
Can include {{variable}} placeholders that will be replaced
with values from the tool's input arguments.

***

### category?

> `optional` **category**: `string`

Defined in: src/types/hitl-types.ts:381

Category of the blocking action for UI grouping.
Examples: 'destructive', 'financial', 'external', 'sensitive'

***

### completesOnApproval?

> `optional` **completesOnApproval**: `boolean`

Defined in: src/types/hitl-types.ts:361

Whether the tool auto-completes successfully when approved.
If true (default), approval = success with feedback as output.
If false, the tool's execute() is called again with hitlContext.

#### Default

```ts
true
```

***

### feedbackSchema?

> `optional` **feedbackSchema**: [`HITLFeedbackSchema`](HITLFeedbackSchema.md)

Defined in: src/types/hitl-types.ts:346

The schema for feedback this tool expects.
If not provided, defaults to a simple confirm schema.

***

### riskLevel?

> `optional` **riskLevel**: `"low"` \| `"medium"` \| `"high"` \| `"critical"`

Defined in: src/types/hitl-types.ts:386

Risk level for UI styling/warnings.

***

### timeoutMs?

> `optional` **timeoutMs**: `number`

Defined in: src/types/hitl-types.ts:375

Timeout in milliseconds for user response.
If exceeded, the tool fails with a timeout error.

#### Default

```ts
undefined (no timeout)
```
