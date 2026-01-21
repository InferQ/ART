[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / McpServerStatus

# Interface: McpServerStatus

Defined in: [src/systems/mcp/types.ts:254](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/mcp/types.ts#L254)

Represents the internal status of an MCP server connection.
This is not part of the public configuration.

 McpServerStatus

## Properties

### id

> **id**: `string`

Defined in: [src/systems/mcp/types.ts:259](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/mcp/types.ts#L259)

The unique identifier for the server.

***

### lastConnected?

> `optional` **lastConnected**: `Date`

Defined in: [src/systems/mcp/types.ts:269](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/mcp/types.ts#L269)

The timestamp of the last successful connection.

***

### lastError?

> `optional` **lastError**: `string`

Defined in: [src/systems/mcp/types.ts:274](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/mcp/types.ts#L274)

The last error message received from the server.

***

### status

> **status**: `"connected"` \| `"disconnected"` \| `"error"` \| `"connecting"`

Defined in: [src/systems/mcp/types.ts:264](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/mcp/types.ts#L264)

The current connection status of the server.

***

### toolCount

> **toolCount**: `number`

Defined in: [src/systems/mcp/types.ts:279](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/mcp/types.ts#L279)

The number of tools registered from this server.
