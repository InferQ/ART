[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / SystemPromptResolver

# Interface: SystemPromptResolver

Defined in: [src/core/interfaces.ts:94](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L94)

Resolves the final system prompt from base + instance/thread/call overrides
using tag+variables and merge strategies.

## Methods

### resolve()

> **resolve**(`input`, `traceId?`): `Promise`\<`string`\>

Defined in: [src/core/interfaces.ts:95](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/core/interfaces.ts#L95)

#### Parameters

##### input

###### base

`string`

###### call?

`string` \| [`SystemPromptOverride`](SystemPromptOverride.md)

###### instance?

`string` \| [`SystemPromptOverride`](SystemPromptOverride.md)

###### thread?

`string` \| [`SystemPromptOverride`](SystemPromptOverride.md)

##### traceId?

`string`

#### Returns

`Promise`\<`string`\>
