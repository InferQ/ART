[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / DeepSeekAdapterOptions

# Interface: DeepSeekAdapterOptions

Defined in: [src/integrations/reasoning/deepseek.ts:19](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/deepseek.ts#L19)

Configuration options required for the `DeepSeekAdapter`.

## Properties

### apiBaseUrl?

> `optional` **apiBaseUrl**: `string`

Defined in: [src/integrations/reasoning/deepseek.ts:25](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/deepseek.ts#L25)

Optional: Override the base URL for the DeepSeek API. Defaults to 'https://api.deepseek.com/v1'.

***

### apiKey

> **apiKey**: `string`

Defined in: [src/integrations/reasoning/deepseek.ts:21](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/deepseek.ts#L21)

Your DeepSeek API key. Handle securely.

***

### model?

> `optional` **model**: `string`

Defined in: [src/integrations/reasoning/deepseek.ts:23](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/integrations/reasoning/deepseek.ts#L23)

The default DeepSeek model ID to use (e.g., 'deepseek-chat', 'deepseek-coder'). Defaults to 'deepseek-chat' if not provided.
