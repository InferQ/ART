# HITL Phase 2 Implementation Items

These items were deferred from the initial HITL (Human-in-the-Loop) release.

## 1. Suspension Timeout Mechanism

**Requirement**: Implement `SUSPENSION_TIMEOUT` to prevent agents from waiting indefinitely for user input.

-   **Details**:
    -   Add configurable timeout per tool or global setting.
    -   Implement `ObservationType.SUSPENSION_TIMEOUT` (Enum already exists in `types/index.ts:146`).
    -   Define default action on timeout (e.g., auto-reject or auto-approve based on config).
    -   Update `ToolSystem` to handle timeout events.

## 2. A2A + Blocking Tool Conflict Resolution

**Requirement**: Define and document/implement behavior when Agent-to-Agent (A2A) delegation occurs in the same step as a blocking tool.

-   **Current Behavior**: A2A tasks are delegated *before* blocking tools execution. If the user subsequently rejects the action via the blocking tool, the A2A tasks have already been dispatched and cannot be easily cancelled.
-   **Proposed Solution**:
    -   **Option A**: Document this behavior clearly as a limitation.
    -   **Option B (Preferred)**: Defer A2A delegation until after blocking tools successfully return (requires reordering execution logic).
    -   **Option C**: Implement a rollback/cancellation signal for dispatched A2A tasks (complex).

## References
-   Original Implementation Assessment: [Issue #36 Comment](https://github.com/InferQ/ART/issues/36#issuecomment-3693054169)
-   `FRAMEWORK_REQUIREMENT_BLOCKING_TOOLS.md` (Phase 2 section)
