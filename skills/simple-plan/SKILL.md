---
name: simple-plan
description: "Adds strict verification to every task in DeepSeek Harness. Plan, execute, verify. If verification fails, fix and re-verify. Up to 3 cycles."
metadata:
  short-description: Plan, execute, verify, fix loop
---

# Simple Plan

Every task follows: Plan -> Execute -> Verify -> Fix if needed.

## Trigger Rule

This skill activates on every user message. Applies only to the main planning agent. Subagents do NOT run this workflow.

## Workflow

### Step 1: Plan
- Understand the user request.
- Break it into concrete steps (2-7 steps).
- Each step must have a clear deliverable.

### Step 2: Execute
- Spawn a worker subagent for each non-trivial step.
- Worker receives ONLY: task description + deliverable + file paths.
- Worker does NOT receive verification criteria.
- All subagents inherit the parent session's model. No model override.

```
subagent(
  description="<3-5 word task name>",
  prompt="<task description, deliverable, file paths>"
)
```

Subagents run in the background and report back when they settle. Keep working
on independent steps instead of polling; collect each result when it arrives.

### Step 3: Verify
- Spawn a verifier subagent for EACH deliverable.
- Verifier receives: artifact path + what to check.
- Verifier is strict: checks syntax, structure, content, functionality.
- Verifier reports PASS or FAIL with evidence.
- Use `subagent` for a verifier, never `subagent_fork`: a plain subagent starts
  with no memory of this conversation, which is what makes the verification
  independent. A forked verifier inherits your assumptions and is not memoryless.

```
subagent(
  description="Verify <artifact>",
  prompt="You are a strict verifier. Check this artifact.

**Artifact:** <path>

**What to check:**
1. File exists and is non-empty
2. No syntax errors
3. All required sections/fields present
4. Values are correct, not placeholders
5. If code: run it and check output
6. If UI: inspect the rendered result (DSH gives every agent the `read_image`
   tool, so a screenshot can be read even when the session model has no
   built-in vision)

Report: PASS or FAIL per check. End with VERDICT: ALL PASS or VERDICT: FAIL"
)
```

### Step 4: Fix Loop (if needed)
If any verifier reports FAIL:
1. Read the failure evidence.
2. Spawn a NEW worker to fix the specific issue.
3. Spawn a NEW verifier to re-check.
4. Repeat up to 3 times.
5. If still failing after 3 cycles, report honestly to user.

### Step 5: Report
- Summarize what was done.
- List verification results for each deliverable.
- Report overall: ALL PASS or FAIL (with details).

## Rules

1. All subagents inherit the parent session's model. No model override.
2. Workers and verifiers are separate subagents. Never mix roles.
3. Verifiers are memoryless — spawn them with `subagent`, not `subagent_fork`.
4. Never self-verify. Always use a subagent.
5. Maximum 3 fix cycles per deliverable.
6. Output language matches user language.

## Tool mapping (Codex → DeepSeek Harness)

| Codex | DeepSeek Harness |
|---|---|
| `multi_agent_v1__spawn_agent(message=…, fork_context=false)` | `subagent(description=…, prompt=…)` |
| `multi_agent_v1__wait_agent(targets=[…])` | subagents report back on their own; collect results when notified |
| `apply_patch` | `edit` / `write` |
| `shell` | `pwsh` (Windows) or the session's shell tool |
| `read_file` | `read` |
