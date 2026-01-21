[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / StateSavingStrategy

# Type Alias: StateSavingStrategy

> **StateSavingStrategy** = `"explicit"` \| `"implicit"`

Defined in: [src/types/index.ts:1324](https://github.com/InferQ/ART/blob/1b9328719efc8f19d3a8a92e9b589737d6fa0375/src/types/index.ts#L1324)

Defines the strategy for saving AgentState.

## Remarks

- 'explicit': AgentState is only saved when `StateManager.setAgentState()` is explicitly called by the agent.
              `StateManager.saveStateIfModified()` will be a no-op for AgentState persistence.
- 'implicit': AgentState is loaded by `StateManager.loadThreadContext()`, and if modified by the agent,
              `StateManager.saveStateIfModified()` will attempt to automatically persist these changes
              by comparing the current state with a snapshot taken at load time.
              `StateManager.setAgentState()` will still work for explicit saves.
