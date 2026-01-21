[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / A2AAgentInfo

# Interface: A2AAgentInfo

Defined in: [src/types/index.ts:1484](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1484)

Represents agent information for A2A task assignment.

 A2AAgentInfo

## Properties

### agentId

> **agentId**: `string`

Defined in: [src/types/index.ts:1489](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1489)

Unique identifier for the agent.

***

### agentName

> **agentName**: `string`

Defined in: [src/types/index.ts:1494](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1494)

Human-readable name for the agent.

***

### agentType

> **agentType**: `string`

Defined in: [src/types/index.ts:1499](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1499)

The type or role of the agent (e.g., 'reasoning', 'data-processing', 'synthesis').

***

### authentication?

> `optional` **authentication**: `object`

Defined in: [src/types/index.ts:1519](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1519)

Authentication configuration for communicating with the agent.

#### apiKey?

> `optional` **apiKey**: `string`

API key for authorization (if type is 'api_key').

#### token?

> `optional` **token**: `string`

Bearer token for authorization (if type is 'bearer').

#### type

> **type**: `"bearer"` \| `"api_key"` \| `"none"`

Type of authentication required.

***

### capabilities?

> `optional` **capabilities**: `string`[]

Defined in: [src/types/index.ts:1509](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1509)

Agent capabilities or specializations.

***

### endpoint?

> `optional` **endpoint**: `string`

Defined in: [src/types/index.ts:1504](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1504)

Base URL or endpoint for communicating with the agent.

***

### status?

> `optional` **status**: `"available"` \| `"busy"` \| `"offline"`

Defined in: [src/types/index.ts:1514](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1514)

Current load or availability status of the agent.
