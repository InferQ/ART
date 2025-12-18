# Changelog

All notable changes to this project will be documented in this file.
2. 
## [0.4.1] - 2025-12-18

### 🤖 Next-Gen LLM Adapter Upgrades
- **Gemini 3 Family Support**: 
    - Full support for **Gemini 3 Pro**, **Flash**, and **Deep Think** models.
    - Implemented **native `systemInstruction`** support for improved behavioral steering.
    - Added **`thinkingLevel` control** (low, minimal, medium, high) to balance reasoning depth and latency.
    - Updated default model to `gemini-3-flash`.
- **Claude 4.5 Family Support**:
    - Support for **Claude 4.5 Opus**, **Sonnet**, and **Haiku**.
    - Maintained and optimized support for **thinking tokens** and reasoning blocks.
    - Updated default model to `claude-4.5-sonnet`.
- **GPT-5 Family Support**:
    - Full support for **GPT-5**, **GPT-5.1**, and **GPT-5.2** (including Instant, Thinking, and Pro variants).
    - Updated default model to `gpt-5.2-instant`.
- **SDK Dependencies**: Upgraded `@google/genai`, `@anthropic-ai/sdk`, and `openai` to their latest December 2025 versions.

### 🛠 Refactors & Maintenance
- Improved integration test resilience by ensuring tests skip correctly when API keys are missing.
- Updated documentation and README to reflect v0.4.1 status.


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
