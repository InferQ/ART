[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / AgentDiscoveryConfig

# Interface: AgentDiscoveryConfig

Defined in: [src/systems/a2a/AgentDiscoveryService.ts:67](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/a2a/AgentDiscoveryService.ts#L67)

Configuration for the AgentDiscoveryService

## Properties

### cacheTtlMs?

> `optional` **cacheTtlMs**: `number`

Defined in: [src/systems/a2a/AgentDiscoveryService.ts:75](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/a2a/AgentDiscoveryService.ts#L75)

Cache TTL in milliseconds

***

### discoveryEndpoint?

> `optional` **discoveryEndpoint**: `string`

Defined in: [src/systems/a2a/AgentDiscoveryService.ts:69](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/a2a/AgentDiscoveryService.ts#L69)

Base URL for the discovery endpoint. If not provided, a default will be used.

***

### enableCaching?

> `optional` **enableCaching**: `boolean`

Defined in: [src/systems/a2a/AgentDiscoveryService.ts:73](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/a2a/AgentDiscoveryService.ts#L73)

Whether to cache discovered agents

***

### timeoutMs?

> `optional` **timeoutMs**: `number`

Defined in: [src/systems/a2a/AgentDiscoveryService.ts:71](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/a2a/AgentDiscoveryService.ts#L71)

Timeout for discovery requests in milliseconds
