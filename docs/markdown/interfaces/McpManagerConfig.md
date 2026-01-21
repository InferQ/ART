[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / McpManagerConfig

# Interface: McpManagerConfig

Defined in: [src/systems/mcp/types.ts:287](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/mcp/types.ts#L287)

Defines the configuration for the McpManager.

 McpManagerConfig

## Properties

### discoveryEndpoint?

> `optional` **discoveryEndpoint**: `string`

Defined in: [src/systems/mcp/types.ts:298](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/mcp/types.ts#L298)

An optional endpoint URL for discovering MCP servers.
Defaults to the Zyntopia API if not provided.

***

### enabled

> **enabled**: `boolean`

Defined in: [src/systems/mcp/types.ts:292](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/mcp/types.ts#L292)

Whether to enable MCP functionality. Defaults to false.
