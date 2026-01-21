[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / McpToolDefinition

# Interface: McpToolDefinition

Defined in: [src/systems/mcp/types.ts:89](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/mcp/types.ts#L89)

Defines the schema for a tool provided by an MCP server.

 McpToolDefinition

## Properties

### description?

> `optional` **description**: `string`

Defined in: [src/systems/mcp/types.ts:99](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/mcp/types.ts#L99)

A description of what the tool does.

***

### inputSchema

> **inputSchema**: `any`

Defined in: [src/systems/mcp/types.ts:104](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/mcp/types.ts#L104)

The JSON schema for the tool's input.

***

### name

> **name**: `string`

Defined in: [src/systems/mcp/types.ts:94](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/mcp/types.ts#L94)

The name of the tool.

***

### outputSchema?

> `optional` **outputSchema**: `any`

Defined in: [src/systems/mcp/types.ts:109](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/systems/mcp/types.ts#L109)

The JSON schema for the tool's output.
