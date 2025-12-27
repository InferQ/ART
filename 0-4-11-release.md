# 🚀 ART Framework v0.4.11: The "Unbreakable State" & Observability Update

**Date:** December 28, 2025

We are closing out the year with a massive focus on **robustness and consistency**. Version 0.4.11 is all about ensuring that your long-running agents—specifically those involving human intervention (HITL) and multi-agent delegation (A2A)—never lose their train of thought, even in edge-case scenarios.

We’ve also unified our observability model. Whether your agent is Planning, Executing, or Synthesizing, the stream of "Thoughts" now looks and behaves exactly the same.

---

## 🛡️ Critical Resilience & Data Integrity

We identified specific scenarios where complex agent workflows could drop data. We've plugged those gaps to ensure enterprise-grade reliability.

*   **HITL Partial Result Preservation:** Previously, if a batch of parallel tool calls contained *one* tool that required human approval (suspension), the results of the successful tools in that same batch could be lost. **Fixed.** We now persist `partialToolResults` immediately, so when the human approves the action, the agent resumes with the full context of what already happened.
*   **A2A Crash Recovery:** Agent-to-Agent delegation is powerful but complex. We’ve added `pendingA2ATasks` to the persistent state. If the host process crashes while waiting for a sub-agent, it can now recover and pick up exactly where it left off during the polling phase.
*   **Smarter "Think" Parsing:** We’ve hardened our OutputParser. If an LLM opens a `<think>` tag but forgets to close it (a common issue with reasoning models), we now treat the content as valid output rather than discarding it. No more silent failures on long chains of thought.

## 🧠 Enhanced Reasoning Context

Your agents are only as smart as the context we feed them. We’ve significantly upgraded what the agent "sees" during execution.

*   **Full History Visibility:** The execution prompt now includes **ALL** tool results from previous steps, not just the immediately preceding one. This allows the agent to correlate data from step 1 with step 5 without hallucinating.
*   **Execution Summary Memory:** We now persist a structured summary of completed steps to the `ConversationManager`. This means follow-up queries (after the agent finishes) have full awareness of exactly what actions were taken.
*   **Preserving Tool Metadata:** We fixed an issue where `tool_call_id` was sometimes stripped during history formatting. This ensures perfect compatibility with strict provider requirements (like OpenAI/Anthropic) when replaying history.

## ⚠️ Breaking Change: Unified Observability Standard

We have standardized how the **Thinking/Reasoning** process is observed across the entire lifecycle of the PES (Plan-Execute-Synthesize) Agent.

**Why?** Previously, "Planning" thoughts looked different from "Execution" thoughts in the socket stream. This made building UIs difficult.

**The Change:**
All phases now emit consistent `THOUGHTS` observations.
*   **New Metadata:** Every thought observation now includes `phase` ('planning' | 'execution' | 'synthesis').
*   **Execution Specifics:** Execution thoughts now include `stepId` and `stepDescription` automatically.

**Migration Guide:**
If you are listening to socket events, you need to update your enumerated types.

| Old (Deprecated) | New (Standardized) |
| :--- | :--- |
| `AGENT_THOUGHT_LLM_THINKING` | `PLANNING_LLM_THINKING` or `EXECUTION_LLM_THINKING` |
| `FINAL_SYNTHESIS_LLM_RESPONSE` | `SYNTHESIS_LLM_RESPONSE` |
| `AGENT_THOUGHT` (Context) | `PLANNING_THOUGHTS` or `EXECUTION_THOUGHTS` |

## 🔧 Developer Experience & Quality of Life

*   **Drastically Reduced Truncation:** We raised the default safety limit for JSON stringification from 200 characters to **10,000 characters**. You will no longer see useful debugging data arbitrarily cut off in the logs.
*   **Flexible Tool Outputs:** We discovered that some custom tools return `{ data: ... }` while others return `{ output: ... }` or `{ result: ... }`. The framework now intelligently scans for all three properties, ensuring we capture the tool's actual return value regardless of how you built it.
*   **New Documentation:** Check out `docs/concepts/interface-contracts.md` for a definitive guide on `IToolExecutor` and `ToolResult`.

---

*Thank you for building with ART. Please check the `CHANGELOG.md` for the raw commit history.*
