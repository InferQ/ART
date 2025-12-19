[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / StateSavingStrategy

# Type Alias: StateSavingStrategy

> **StateSavingStrategy** = `"explicit"` \| `"implicit"`

Defined in: [src/types/index.ts:1232](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L1232)

Defines the strategy for saving AgentState.

## Remarks

- 'explicit': AgentState is only saved when `StateManager.setAgentState()` is explicitly called by the agent.
              `StateManager.saveStateIfModified()` will be a no-op for AgentState persistence.
- 'implicit': AgentState is loaded by `StateManager.loadThreadContext()`, and if modified by the agent,
              `StateManager.saveStateIfModified()` will attempt to automatically persist these changes
              by comparing the current state with a snapshot taken at load time.
              `StateManager.setAgentState()` will still work for explicit saves.
