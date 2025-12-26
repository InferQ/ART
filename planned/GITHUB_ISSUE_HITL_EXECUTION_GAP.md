# HITL Tool Execution Gap: Tools Declared in Planning Phase Not Invoked During Execution

## Problem Summary

The ART framework has a **fundamental architectural gap** between how it instructs the LLM during planning and how it expects the LLM to behave during execution. The core issue is a **prompt-behavior disconnect**: when the planning phase creates a todo list that includes steps like "Execute webSearch tool to find data", the execution phase has no enforcement mechanism to ensure that tool is actually called.

### Symptoms
- Steps like "Execute webSearch" complete successfully without any tools being invoked
- HITL blocking tools (e.g., `displayConfirmation`) never trigger because the LLM describes what it would do instead of calling the tool
- The agent marks steps as COMPLETED regardless of whether declared tools were actually invoked

### Root Cause
1. **Planning Phase**: LLM writes natural language descriptions but doesn't declare tool requirements
2. **Execution Phase**: LLM "executes" steps by optionally calling tools, with no validation
3. **Completion**: Items are marked COMPLETED when LLM returns output, not when tools are called

## Proposed Solution: Tool-Aware Execution Framework (TAEF)

### Key Changes

1. **Step Type Classification**: Explicitly classify steps as `tool` (requires external invocation) or `reasoning` (LLM analysis only)

2. **Required Tools Declaration**: Planning phase declares which tools MUST be called for each tool step:
   ```typescript
   {
     "id": "step_1",
     "description": "Search for weather data",
     "stepType": "tool",
     "requiredTools": ["webSearch"],
     "expectedOutcome": "Retrieved weather statistics"
   }
   ```

3. **Conditional Validation**: Only enforce tool invocation on steps that declare `requiredTools` - reasoning steps skip validation

4. **Retry Mechanism**: For strict validation mode, re-prompt the LLM if required tools weren't invoked

5. **Backward Compatibility**: Items without `stepType` default to reasoning behavior (no validation)

## Files Affected

| File | Changes |
|------|---------|
| `src/types/pes-types.ts` | Add `stepType`, `requiredTools`, `expectedOutcome`, `toolValidationMode`, `validationStatus`, `actualToolCalls` to TodoItem |
| `src/systems/reasoning/OutputParser.ts` | Parse new fields from planning output |
| `src/core/agents/pes-agent.ts` | Enhanced planning prompt, step-type-aware execution prompts, validation logic |

## Related Documents

- [ART-FRAMEWORK-HITL-EXECUTION-ISSUES.md](./planned/ART-FRAMEWORK-HITL-EXECUTION-ISSUES.md) - Full analysis
- [FRAMEWORK_REQUIREMENT_BLOCKING_TOOLS.md](./planned/FRAMEWORK_REQUIREMENT_BLOCKING_TOOLS.md) - Original blocking tools feature request

## Acceptance Criteria

- [ ] Planning prompt instructs LLM to classify steps as `tool` or `reasoning`
- [ ] Planning prompt instructs LLM to include `requiredTools` for tool steps
- [ ] Execution phase uses step-type-aware prompts (tool steps emphasize invocation)
- [ ] Execution phase validates that required tools were actually called
- [ ] Advisory mode logs warning when validation fails
- [ ] Strict mode retries with enforcement prompt when validation fails
- [ ] Existing plans without TAEF fields continue to work (backward compatible)
- [ ] New tests added for TAEF validation logic

## Labels

`enhancement` `hitl` `agent-governance` `priority:high`
