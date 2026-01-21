[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ModelCapability

# Enumeration: ModelCapability

Defined in: [src/types/index.ts:178](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L178)

Represents the different capabilities a model might possess.
Used for model selection and validation.

## Enumeration Members

### CODE

> **CODE**: `"code"`

Defined in: [src/types/index.ts:190](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L190)

Specialized in understanding or generating code.

***

### RAG

> **RAG**: `"rag"`

Defined in: [src/types/index.ts:188](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L188)

Built-in or optimized for Retrieval-Augmented Generation.

***

### REASONING

> **REASONING**: `"reasoning"`

Defined in: [src/types/index.ts:192](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L192)

Advanced reasoning, planning, complex instruction following.

***

### STREAMING

> **STREAMING**: `"streaming"`

Defined in: [src/types/index.ts:184](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L184)

Supports streaming responses chunk by chunk.

***

### TEXT

> **TEXT**: `"text"`

Defined in: [src/types/index.ts:180](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L180)

Basic text generation/understanding.

***

### TOOL\_USE

> **TOOL\_USE**: `"tool_use"`

Defined in: [src/types/index.ts:186](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L186)

Capable of using tools/function calling.

***

### VISION

> **VISION**: `"vision"`

Defined in: [src/types/index.ts:182](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L182)

Ability to process and understand images.
