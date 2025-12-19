[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / AnthropicAdapterOptions

# Interface: AnthropicAdapterOptions

Defined in: [src/integrations/reasoning/anthropic.ts:21](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/anthropic.ts#L21)

Configuration options required for the `AnthropicAdapter`.

## Properties

### apiBaseUrl?

> `optional` **apiBaseUrl**: `string`

Defined in: [src/integrations/reasoning/anthropic.ts:27](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/anthropic.ts#L27)

Optional: Override the base URL for the Anthropic API.

***

### apiKey

> **apiKey**: `string`

Defined in: [src/integrations/reasoning/anthropic.ts:23](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/anthropic.ts#L23)

Your Anthropic API key. Handle securely.

***

### defaultMaxTokens?

> `optional` **defaultMaxTokens**: `number`

Defined in: [src/integrations/reasoning/anthropic.ts:29](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/anthropic.ts#L29)

Optional: Default maximum tokens for responses.

***

### defaultTemperature?

> `optional` **defaultTemperature**: `number`

Defined in: [src/integrations/reasoning/anthropic.ts:31](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/anthropic.ts#L31)

Optional: Default temperature for responses.

***

### model?

> `optional` **model**: `string`

Defined in: [src/integrations/reasoning/anthropic.ts:25](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/anthropic.ts#L25)

The default Anthropic model ID to use (e.g., 'claude_4.5_sonnet', 'claude_4.5_opus').
