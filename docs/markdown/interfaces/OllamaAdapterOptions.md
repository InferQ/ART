[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / OllamaAdapterOptions

# Interface: OllamaAdapterOptions

Defined in: [src/integrations/reasoning/ollama.ts:53](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/integrations/reasoning/ollama.ts#L53)

Configuration options required for the `OllamaAdapter`.

## Properties

### apiKey?

> `optional` **apiKey**: `string`

Defined in: [src/integrations/reasoning/ollama.ts:68](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/integrations/reasoning/ollama.ts#L68)

API key for Ollama (if secured). Defaults to "ollama" as commonly used.

***

### defaultModel?

> `optional` **defaultModel**: `string`

Defined in: [src/integrations/reasoning/ollama.ts:64](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/integrations/reasoning/ollama.ts#L64)

The default Ollama model ID to use (e.g., 'llama3', 'mistral').
This can be overridden by `RuntimeProviderConfig.modelId` or `CallOptions.model`.
It's recommended to set this if you primarily use one model with Ollama.

***

### ollamaBaseUrl?

> `optional` **ollamaBaseUrl**: `string`

Defined in: [src/integrations/reasoning/ollama.ts:58](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/integrations/reasoning/ollama.ts#L58)

The base URL for the Ollama API. Defaults to 'http://localhost:11434'.
The '/v1' suffix for OpenAI compatibility will be added automatically.
