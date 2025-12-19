[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / OpenAIAdapterOptions

# Interface: OpenAIAdapterOptions

Defined in: [src/integrations/reasoning/openai.ts:22](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/openai.ts#L22)

Configuration options required for the `OpenAIAdapter`.

## Properties

### apiBaseUrl?

> `optional` **apiBaseUrl**: `string`

Defined in: [src/integrations/reasoning/openai.ts:28](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/openai.ts#L28)

Optional: Override the base URL for the OpenAI API (e.g., for Azure OpenAI or custom proxies).

***

### apiKey

> **apiKey**: `string`

Defined in: [src/integrations/reasoning/openai.ts:24](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/openai.ts#L24)

Your OpenAI API key. Handle securely.

***

### defaultMaxTokens?

> `optional` **defaultMaxTokens**: `number`

Defined in: [src/integrations/reasoning/openai.ts:30](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/openai.ts#L30)

Optional: Default maximum tokens for responses.

***

### defaultTemperature?

> `optional` **defaultTemperature**: `number`

Defined in: [src/integrations/reasoning/openai.ts:32](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/openai.ts#L32)

Optional: Default temperature for responses.

***

### model?

> `optional` **model**: `string`

Defined in: [src/integrations/reasoning/openai.ts:26](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/openai.ts#L26)

The default OpenAI model ID to use (e.g., 'gpt-5.2-instant', 'gpt-5.2-thinking', 'gpt-5.2-pro').
