# Changelog

All notable changes to this project will be documented in this file.

## [0.4.10] - 2025-12-27

### 🔧 Configurable Execution Framework
- **ExecutionConfig Interface**: New configuration options for PES Agent execution behavior:
    - `maxIterations`: Max LLM calls per todo item (default: 5)
    - `taefMaxRetries`: Max TAEF validation retries (default: 2)
    - `toolResultMaxLength`: Max chars for tool result serialization (default: 60000)
    - `enableA2ADelegation`: Opt-in for A2A delegation tool (default: false)
- **Configuration Hierarchy**: Settings resolve from call options > thread config > instance config.

### 📊 Step Output Table
- **Structured Persistence**: New `StepOutputEntry` interface for structured step outputs.
- **Cross-Step Data Access**: `stepOutputs` map added to `PESAgentStateData` for any step to access any previous step's data.
- **Resume Capability**: Full state persisted after each step completion for reliable resume from failure/pause.
- **Fixed Synthesis Truncation**: Changed from hardcoded 200 chars to configurable `toolResultMaxLength` (default: 60000).

### 🛠️ Improvements
- **A2A Delegation Opt-in**: `delegate_to_agent` tool now only injected when `enableA2ADelegation: true`.
- **Removed Redundant Tool Injection**: Tools no longer duplicated in user message (already in system prompt via JIT).
- **Generic Prompt Examples**: Removed tool-specific references (webSearch, webExtract) for framework-agnostic prompts.

### 📖 Documentation
- Updated `art-framework-api-guide.md` with `ExecutionConfig` and `StepOutputEntry` sections.
- Updated `pes-agent.md` with execution configuration and step output table documentation.

## [0.4.7] - 2025-12-27

### 🛠️ Stability & Robustness (PES Agent)
- **Execution Loop Integrity**: Addressed a critical issue where `item.result` was not being populated if the execution loop terminated due to max iterations or lacked explicit final content.
- **Enhanced Fallback Logic**:
    - **Smart Result Capture**: Implemented intelligent fallback to the *last* tool execution result when explicit LLM content is missing.
    - **Context Awareness**: Updated context building for synthesis and subsequent steps to utilize tool results when `item.result` is empty, eliminating "undefined" errors in prompts.
    - **Stale Content Protection**: Ensured `lastContent` is only updated with meaningful content, preventing empty strings from overriding valid previous outputs.
- **HITL Resumption Fixes**:
    - **State Reset**: Fixed a bug where resuming from a suspended state failed to reset `isPaused` and item status, causing the execution loop to skip the resumed task.
    - **A2A Integration**: Ensured Agent-to-Agent (A2A) task results are correctly captured and used in the result fallback chain.
- **Regression Testing**: Added `test/pes-agent-result.test.ts` with deep state verification to prevent future regressions in result population and resumption flows.

## [0.4.6] - 2025-12-26

### 🚦 Tool-Aware Execution Framework (TAEF)
- **Bridging the Plan-Execute Gap**: Addressed a critical architectural gap where tools declared in the planning phase were not strictly enforced during execution.
- **New TodoItem Schema**: Added `stepType` ('tool' | 'reasoning'), `requiredTools`, and `expectedOutcome` to explicitly define step requirements.
- **Smart Validation**: 
    - **Strict Mode**: Automatically retries execution if required tools are skipped.
    - **Advisory Mode**: Logs warnings for missing tool calls without blocking.
    - **Reasoning Steps**: explicit 'reasoning' steps skip tool validation logic.
- **Enhanced Prompts**: Updated planning prompts to classify steps and execution prompts to enforce tool usage based on step type.

### 🛑 HITL Blocking Tools V2
- **Robust Suspension Handling**: Fixed `suspensionId` generation to ensure reliable tracking even if tools return incomplete metadata.
- **Rejection Workflows**: Implemented specific system prompts to handle user rejections, instructing the agent to attempt alternatives rather than retrying the same blocked action.
- **State Persistence**: Added `checkForSuspendedState` API to allow applications to resume suspended tool calls even after page refreshes.

### 🐛 Improvements & Fixes
- **Timestamp Fix**: Ensured `createdTimestamp` is correctly populated on all TodoItems during initialization.
- **Validation Loop Protection**: Introduced `MAX_VALIDATION_RETRIES` to prevent infinite loops when agents stubbornly refuse to call tools.
- **Empty Query Handling**: Added `isResume` flag to distinguish between intentional empty query resumes and accidental empty inputs.
- **Test Coverage**: Added comprehensive test suites (`test/taef-validation.test.ts`, `test/hitl-blocking-tools.test.ts`) covering step classification, validation logic, and suspension flows.

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
