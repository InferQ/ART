[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ExecutionConfig

# Interface: ExecutionConfig

Defined in: [src/types/index.ts:1789](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1789)

Configuration options for the execution phase of the PES Agent.
Controls TAEF (Tool-Aware Execution Framework) behavior.

 ExecutionConfig

## Properties

### enableA2ADelegation?

> `optional` **enableA2ADelegation**: `boolean`

Defined in: [src/types/index.ts:1818](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1818)

Whether to enable A2A (Agent-to-Agent) delegation during execution.
When true, injects the delegate_to_agent tool into execution context.
Default: false

***

### maxIterations?

> `optional` **maxIterations**: `number`

Defined in: [src/types/index.ts:1795](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1795)

Maximum number of LLM iterations per todo item during execution.
Default: 5

***

### taefMaxRetries?

> `optional` **taefMaxRetries**: `number`

Defined in: [src/types/index.ts:1802](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1802)

Maximum number of TAEF tool validation retries when required tools are not invoked.
Default: 2

***

### toolResultMaxLength?

> `optional` **toolResultMaxLength**: `number`

Defined in: [src/types/index.ts:1810](https://github.com/hashangit/ART/blob/4b6e07b019bda196c951a1bba064e95e97bd080e/src/types/index.ts#L1810)

Maximum character length for tool result serialization in step context.
Higher values preserve more data for the LLM but increase token usage.
Default: 60000 (effectively no practical limit)
