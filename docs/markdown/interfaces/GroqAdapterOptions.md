[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / GroqAdapterOptions

# Interface: GroqAdapterOptions

Defined in: [src/integrations/reasoning/groq.ts:62](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/integrations/reasoning/groq.ts#L62)

Configuration options required for the `GroqAdapter`.

## Properties

### apiBaseUrl?

> `optional` **apiBaseUrl**: `string`

Defined in: [src/integrations/reasoning/groq.ts:68](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/integrations/reasoning/groq.ts#L68)

Optional: Override the base URL for the Groq API.

***

### apiKey

> **apiKey**: `string`

Defined in: [src/integrations/reasoning/groq.ts:64](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/integrations/reasoning/groq.ts#L64)

Your Groq API key. Handle securely.

***

### defaultMaxTokens?

> `optional` **defaultMaxTokens**: `number`

Defined in: [src/integrations/reasoning/groq.ts:70](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/integrations/reasoning/groq.ts#L70)

Optional: Default maximum tokens for responses.

***

### defaultTemperature?

> `optional` **defaultTemperature**: `number`

Defined in: [src/integrations/reasoning/groq.ts:72](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/integrations/reasoning/groq.ts#L72)

Optional: Default temperature for responses.

***

### model?

> `optional` **model**: `string`

Defined in: [src/integrations/reasoning/groq.ts:66](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/integrations/reasoning/groq.ts#L66)

The default Groq model ID to use (e.g., 'llama-3.3-70b-versatile', 'mixtral-8x7b-32768').
