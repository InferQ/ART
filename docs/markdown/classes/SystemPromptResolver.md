[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / SystemPromptResolver

# Class: SystemPromptResolver

Defined in: [src/systems/reasoning/SystemPromptResolver.ts:121](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/systems/reasoning/SystemPromptResolver.ts#L121)

Default implementation of ISystemPromptResolver interface.

## Remarks

This class manages the resolution and merging of system prompts across multiple levels:
1. Base prompt - The fundamental system instruction from agent persona or framework defaults
2. Instance-level override - Global configuration applied to all threads in an ART instance
3. Thread-level override - Configuration specific to a single conversation thread
4. Call-level override - Configuration for a specific LLM call

Each level can provide either:
- A preset tag that references a template from SystemPromptsRegistry
- Freeform content that is directly used

The resolution process:
1. Starts with the base prompt
2. Applies instance-level override (if provided)
3. Applies thread-level override (if provided)
4. Applies call-level override (if provided)

At each level, the override is:
- Rendered from a template if a tag is specified (with variable substitution)
- Used directly if freeform content is provided
- Applied using the specified merge strategy (append or prepend)

Template rendering supports:
- Simple variable interpolation: {{variableName}}
- Prompt fragment references: {{fragment:name}}

## Example

```typescript
const resolver = new SystemPromptResolver({
  specs: {
    'default': {
      template: 'You are {{name}}. Be {{tone}}.',
      defaultVariables: { name: 'AI Assistant', tone: 'helpful' }
    },
    'expert': {
      template: 'You are an expert in {{topic}}.',
      mergeStrategy: 'prepend'
    }
  },
  defaultTag: 'default'
});

const result = await resolver.resolve({
  base: 'System: You are helpful.',
  instance: { tag: 'expert', variables: { topic: 'physics' } },
  thread: { tag: 'default', strategy: 'append' }
}, 'trace-123');
// Result combines: base + expert (prepended) + default (appended)
```

 SystemPromptResolver

## Implements

ISystemPromptResolver

## Implements

- `SystemPromptResolver`

## Constructors

### Constructor

> **new SystemPromptResolver**(`registry?`): `SystemPromptResolver`

Defined in: [src/systems/reasoning/SystemPromptResolver.ts:135](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/systems/reasoning/SystemPromptResolver.ts#L135)

Creates a new SystemPromptResolver instance.

#### Parameters

##### registry?

[`SystemPromptsRegistry`](../interfaces/SystemPromptsRegistry.md)

Optional registry of prompt preset templates indexed by tag name.
                   If provided, overrides can reference templates by tag name.

#### Returns

`SystemPromptResolver`

## Methods

### resolve()

> **resolve**(`input`, `traceId?`): `Promise`\<`string`\>

Defined in: [src/systems/reasoning/SystemPromptResolver.ts:188](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/systems/reasoning/SystemPromptResolver.ts#L188)

Resolves the final system prompt by applying overrides in precedence order.

#### Parameters

##### input

Object containing the base prompt and optional overrides at each level.
               - base (string): The fundamental system prompt (required)
               - instance (string | SystemPromptOverride): Instance-level override
               - thread (string | SystemPromptOverride): Thread-level override
               - call (string | SystemPromptOverride): Call-level override

###### base

`string`

###### call?

`string` \| [`SystemPromptOverride`](../interfaces/SystemPromptOverride.md)

###### instance?

`string` \| [`SystemPromptOverride`](../interfaces/SystemPromptOverride.md)

###### thread?

`string` \| [`SystemPromptOverride`](../interfaces/SystemPromptOverride.md)

##### traceId?

`string`

Optional trace identifier for logging and debugging purposes.

#### Returns

`Promise`\<`string`\>

A promise resolving to the final, resolved system prompt string.

#### Remarks

The resolution process follows this precedence hierarchy (highest to lowest):
1. Call-level override (immediate, most specific)
2. Thread-level override (conversation-specific)
3. Instance-level override (instance-wide)
4. Base prompt (default)

For each override level:
- If a tag is provided and exists in registry: Render the template
- If freeform content is provided: Use it directly
- Apply using the specified merge strategy (defaults to 'append')
- Variables for template rendering come from defaultVariables merged with provided variables

Template variable substitution:
- Variables are wrapped in double braces: {{variableName}}
- Supports fragment references: {{fragment:name}} (for PromptManager integration)
- Missing variables render as empty strings

Merge strategies:
- 'append': Adds content to the end of existing prompt (default)
- 'prepend': Adds content to the beginning of existing prompt

Note: 'replace' strategy is intentionally unsupported to prevent custom prompts
from overriding framework-required structural contracts.

#### Example

```typescript
const result = await resolver.resolve({
  base: 'You are a helpful AI.',
  instance: {
    tag: 'technical',
    variables: { specialization: 'web development' }
  },
  thread: { content: 'Be concise in your responses.' }
}, 'trace-123');
```

#### Implementation of

`ISystemPromptResolver.resolve`
