# Changelog

All notable changes to this project will be documented in this file.

## [0.4.4] beta - 2025-12-24

### 🚀 New Features & Integrations
- **Groq Adapter Integration**: Added ultra-fast LPU-powered inference support via the new `GroqAdapter`. Includes full streaming support, tool-calling capabilities, and OpenAI-compatible message translation.
- **Improved OpenRouter Support**: Enhanced token streaming and added a legacy reasoning toggle for better compatibility with varied models.
- **Cinematic Marketing Experience**: Redesigned the PESAgent Workflow section with high-tech "scrollytelling" animations and interactive motion flows.
- **Embedded Documentation Viewer**: Added a built-in markdown viewer for concepts and how-to guides, providing a seamless DX within the marketing site.

### 🛠️ Improvements & Fixes
- **Robust Persistence**: Added comprehensive guides and tests for Anthropic and OpenRouter integration.
- **SPA Routing**: Optimized GitHub Pages deployment with React Router SPA routing fixes and catch-all route support.
- **Utility Enhancements**: Added `safeStringify` to prevent errors when handling complex or undefined objects in logs and observations.
- **DX & Docs**: Expanded conceptual documentation for PES Agent, State Management, and Provider Adapters.

## [0.4.0] beta - 2025-12-18

### 🚀 Core Framework Overhaul (PES Agent)
- **Structured Planning & Execution**: Introduced a state-aware **Plan-Execute-Synthesize (PES)** model. Agents now maintain a structured `todoList` with individual lifecycle tracking for tasks (`pending`, `in_progress`, `completed`, `failed`).
- **Dynamic Plan Updates**: The PES agent can now autonomously update its intent and plan based on execution results, allowing for more complex multi-step reasoning.
- **Reasoning Extraction**: Enhanced `OutputParser` to natively extract reasoning "thoughts" (supporting `<think>` tags) and structured tool calls (JSON blocks) from LLM responses.
- **Robust Type System**: Added `src/types/pes-types.ts` to formalize the PES state management and execution pipeline.

### 💎 Gemini Integration Enhancements
- **Operational Resilience**: Implemented automated retry logic for `generateContent` and streaming calls to handle transient network or API failures.
- **Rich Metadata Extraction**: Fixed and improved metadata harvesting from Gemini streams, ensuring accurate token usage and finish reason reporting even in fragmented responses.
- **System Prompt Refinement**: Improved handling of system prompts, including better validation and role-based interleaving for improved LLM performance.
- **Base/Runtime Config Merging**: Enhanced `ProviderManagerImpl` to allow merging global provider settings with thread-specific runtime options.

### 📱 New Showcase: React Chat Application
- **Integrated Agent Demo**: Added a modern React-based Chat App in `examples/chat-app` that demonstrates the full power of ART:
    - **Live Thought Streaming**: Real-time visualization of LLM reasoning process.
    - **Visual Plan Tracking**: A UI components that observes and renders the agent's internal todo list and intent updates.
    - **State Persistence**: Demonstrates `indexedDB` storage for session and thread state management.
    - **Modern UI**: Built with Vite, Tailwind CSS, and Radix-based components.

### 📖 Documentation & DX
- **Observation System**: Added comprehensive documentation in `docs/concepts/observations.md` detailing the new event-driven state monitoring system.
- **Agent Rules Engine**: Introduced a `.roo` rules directory containing specialized sets for Architecting, Coding, Testing, and Debugging to standardize developer workflows.
- **Legacy Cleanup**: Removed deprecated `PromptManager.ts` and legacy documentation (`WARP.md`) to streamline the codebase.

### 🧹 Refactors & Maintenance
- Simplified `SystemPromptResolver` logic by removing external template fragment dependencies.
- Updated `package.json` with new dependencies and bumped version to `0.4.0`.
- Consolidated core interfaces for better developer accessibility.

```
Note: The core Agent of the ART-framework has significantly changed and now is a more robust ReAct Agent with built in looping capabilities and iterates over a Todo List. This could be a breaking upgrade so you need to accommodate the change in the Agent within your application when upgrading to v0.4.0
```

## [0.3.8] - 2025-12-15
- Beta release of core reasoning and tool-calling capabilities.
