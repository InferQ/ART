[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / createArtInstance

# Function: createArtInstance()

> **createArtInstance**(`config`): `Promise`\<[`ArtInstance`](../interfaces/ArtInstance.md)\>

Defined in: [src/core/agent-factory.ts:358](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/core/agent-factory.ts#L358)

High-level factory function to create and initialize a complete ART framework instance.
This simplifies the setup process by handling the instantiation and wiring of all
necessary components based on the provided configuration.

## Parameters

### config

[`ArtInstanceConfig`](../interfaces/ArtInstanceConfig.md)

The configuration object specifying storage, reasoning, tools, etc.

## Returns

`Promise`\<[`ArtInstance`](../interfaces/ArtInstance.md)\>

A promise that resolves to a ready-to-use `ArtInstance` object, providing access to the core `process` method and essential managers/systems.

## Throws

If initialization fails (e.g., invalid config, storage connection error).

## Example

```ts
const art = await createArtInstance({
  storage: { type: 'indexedDB', dbName: 'myAgentDb' },
  reasoning: { provider: 'openai', apiKey: '...' },
  tools: [new CalculatorTool()]
});
const response = await art.process({ query: "Calculate 5*5", threadId: "thread1" });
```
