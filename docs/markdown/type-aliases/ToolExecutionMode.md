[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ToolExecutionMode

# Type Alias: ToolExecutionMode

> **ToolExecutionMode** = `"functional"` \| `"blocking"` \| `"display"`

Defined in: [src/types/hitl-types.ts:36](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/hitl-types.ts#L36)

Defines the three categories of tools in the ART framework.

## Remarks

Each category has different execution semantics and framework handling:

- `functional`: Regular tools that execute synchronously and return results immediately.
  Examples: webSearch, calculator, fileRead, apiCall

- `blocking`: Tools that require human input to complete. They return 'suspended' status
  initially, and the framework waits for user feedback. The user's feedback becomes
  the tool's result - no re-execution needed.
  Examples: confirmAction, getUserInput, selectOption, requestApproval

- `display`: Tools for generative UI that render content without producing a traditional
  "result". They complete immediately but their output is visual/interactive.
  Examples: renderChart, showModal, displayProgress, generateUI
