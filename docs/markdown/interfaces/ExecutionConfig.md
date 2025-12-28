[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ExecutionConfig

# Interface: ExecutionConfig

Defined in: [src/types/index.ts:1862](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1862)

Configuration options for the execution phase of the PES Agent.
Controls TAEF (Tool-Aware Execution Framework) behavior.

 ExecutionConfig

## Properties

### enableA2ADelegation?

> `optional` **enableA2ADelegation**: `boolean`

Defined in: [src/types/index.ts:1891](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1891)

Whether to enable A2A (Agent-to-Agent) delegation during execution.
When true, injects the delegate_to_agent tool into execution context.
Default: false

***

### maxIterations?

> `optional` **maxIterations**: `number`

Defined in: [src/types/index.ts:1868](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1868)

Maximum number of LLM iterations per todo item during execution.
Default: 5

***

### taefMaxRetries?

> `optional` **taefMaxRetries**: `number`

Defined in: [src/types/index.ts:1875](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1875)

Maximum number of TAEF tool validation retries when required tools are not invoked.
Default: 2

***

### toolResultMaxLength?

> `optional` **toolResultMaxLength**: `number`

Defined in: [src/types/index.ts:1883](https://github.com/hashangit/ART/blob/0a239b629fdf1f154ebbcba36600c92f3b8d9c05/src/types/index.ts#L1883)

Maximum character length for tool result serialization in step context.
Higher values preserve more data for the LLM but increase token usage.
Default: 60000 (effectively no practical limit)
