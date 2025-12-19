[**ART Framework Component Reference**](../README.md)

***

[ART Framework Component Reference](../README.md) / ThreadContext

# Interface: ThreadContext

Defined in: [src/types/index.ts:705](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L705)

Encapsulates the complete context for a specific thread, combining configuration and state.
This object represents the full snapshot of a thread's environment.

 ThreadContext

## Properties

### config

> **config**: [`ThreadConfig`](ThreadConfig.md)

Defined in: [src/types/index.ts:710](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L710)

The configuration settings (`ThreadConfig`) currently active for the thread.

***

### state

> **state**: `null` \| [`AgentState`](AgentState.md)

Defined in: [src/types/index.ts:715](https://github.com/hashangit/ART/blob/9d7d0553c290c498bd29377ae972b6b43dc1b691/src/types/index.ts#L715)

The persistent state (`AgentState`) associated with the thread, or `null` if no state exists.
