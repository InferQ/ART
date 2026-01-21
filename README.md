# ✨ ART: Agentic Runtime Framework <img src="https://img.shields.io/badge/Version-v0.4.15-blue" alt="Version 0.4.15">

<p align="center">
  <img src="docs/art-logo.jpeg" alt="ART Framework Logo" width="200"/>
</p>
<p align="center">
  <img src="docs/art-banner.png" alt="ART Framework Overview" width="100%"/>
</p>

**ART (Agentic Reactive Triad) is a powerful, modular, and browser-first TypeScript framework for building sophisticated LLM-powered agents capable of complex reasoning, planning, and tool usage.**

It provides the missing runtime for production-ready agentic systems, emphasizing **Reliability**, **Observability**, and **Resilience**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

[![Sponsor on Patreon](https://img.shields.io/badge/Sponsor%20on-Patreon-F96854?logo=patreon&style=flat)](https://www.patreon.com/HashanWickramasinghe)

## The Reactive Triad

ART is architected around three core nodes that ensure your agents are production-ready:

1.  **Reactive Agent (Orchestration):** The flagship `PESAgent` uses a **Plan-Execute-Synthesize** workflow to handle complex, multi-step tasks with dynamic refinement.
2.  **Persistent State (Memory):** Durable state management that persists across sessions, crashes, and human-in-the-loop pauses.
3.  **Standardized UI (Observability):** A reactive socket system that streams granular "thoughts," tool calls, and status updates directly to your frontend.

## Key Features

#### 🧠 Advanced Reasoning (PES Agent)

- **Structured Planning:** Decomposes user intent into a discrete `TodoList` with dependency mapping.
- **TAEF (Tool-Aware Execution Framework):** Strictly validates tool usage to eliminate hallucinations and ensure protocol adherence.
- **Dynamic Refinement:** Self-correcting plans that adapt in real-time based on tool outputs.
- **Synthesis Engine:** Aggregates task results into rich responses with UI metadata and citations.

#### 🛡️ Production Robustness

- **HITL V2 (Human-in-the-Loop):** Seamlessly pause execution for human approval with full state preservation and resumption.
- **Crash Recovery:** Automatic state hydration ensures agents resume exactly where they left off.
- **A2A (Agent-to-Agent) Delegation:** Coordinate complex workflows by delegating sub-tasks to specialized agents.
- **Step Output Table:** Persists all historical tool results for consistent cross-step data access.

#### 🔌 Universal Connectivity

- **Multi-Provider Support:** First-class support for Gemini (Thinking), Claude (Extended Thinking), GPT (Reasoning), DeepSeek, Groq, and local models via Ollama.
- **MCP (Model Context Protocol):** Dynamically discover and execute tools from any MCP-compliant server.
- **Pluggable Storage:** Integrated adapters for IndexedDB (Browser), Supabase (Backend), and In-Memory.
- **OAuth & Auth Strategies:** Built-in support for PKCE, Generic OAuth, and API key management.

## Installation

```bash
npm install art-framework
# or
pnpm install art-framework
```

## Quick Start

```typescript
import { createArtInstance, PESAgent, OpenAIAdapter, CalculatorTool } from 'art-framework';

const art = await createArtInstance({
  storage: { type: 'indexedDB', dbName: 'AgentDB' },
  providers: {
    availableProviders: [{ name: 'openai', adapter: OpenAIAdapter }],
  },
  tools: [new CalculatorTool()],
  agentCore: PESAgent, // Default flagship agent
});

// Configure the thread (Where API keys live)
await art.stateManager.setThreadConfig('my-thread', {
  providerConfig: {
    providerName: 'openai',
    modelId: 'gpt-4o',
    adapterOptions: { apiKey: process.env.OPENAI_API_KEY },
  },
  enabledTools: ['CalculatorTool'],
});

// Process a request
const result = await art.process({
  query: 'Calculate the compound interest for $1000 at 5% over 10 years.',
  threadId: 'my-thread',
});

console.log(result.response.content);
```

## Documentation

- **[Concepts Guide](docs/concepts/pes-agent.md):** Deep dive into the PES Agent and Reactive Triad.
- **[How-To Guides](./docs/how-to):** Practical tutorials for [HITL](./docs/how-to/using-hitl-pausing.md), [MCP](./docs/concepts/mcp-system.md), and [Custom UI](./docs/how-to/connecting-your-ui.md).
- **[API Reference](https://inferq.github.io/ART/components/index.html):** Full technical documentation.
- **[Website](https://inferq.github.io/ART/):** Marketing site & Live Demos.

## Contributing

Contributions are welcome! Please refer to the [Contributing Guide](./CONTRIBUTING.md).

## License

ART Framework is released under the [MIT License](https://opensource.org/licenses/MIT).
