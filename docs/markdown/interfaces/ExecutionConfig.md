[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ExecutionConfig

# Interface: ExecutionConfig

Defined in: [src/types/index.ts:1874](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1874)

Configuration options for the execution phase of the PES Agent.
Controls TAEF (Tool-Aware Execution Framework) behavior.

 ExecutionConfig

## Properties

### enableA2ADelegation?

> `optional` **enableA2ADelegation**: `boolean`

Defined in: [src/types/index.ts:1903](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1903)

Whether to enable A2A (Agent-to-Agent) delegation during execution.
When true, injects the delegate_to_agent tool into execution context.
Default: false

***

### maxIterations?

> `optional` **maxIterations**: `number`

Defined in: [src/types/index.ts:1880](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1880)

Maximum number of LLM iterations per todo item during execution.
Default: 5

***

### taefMaxRetries?

> `optional` **taefMaxRetries**: `number`

Defined in: [src/types/index.ts:1887](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1887)

Maximum number of TAEF tool validation retries when required tools are not invoked.
Default: 2

***

### toolResultMaxLength?

> `optional` **toolResultMaxLength**: `number`

Defined in: [src/types/index.ts:1895](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1895)

Maximum character length for tool result serialization in step context.
Higher values preserve more data for the LLM but increase token usage.
Default: 60000 (effectively no practical limit)
