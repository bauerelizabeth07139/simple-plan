# Simple Plan - Repository Instructions

## Scope
These instructions apply to every file in this repository.

## Execution Policy
- Delegate implementation to worker subagents.
- Delegate verification to verifier subagents (fork_context=false).
- Never self-verify.

## Model Policy
- All subagents inherit the parent model. No model override.

## Worker vs Verifier
- Workers: receive task + deliverable. Do implementation. No verification criteria.
- Verifiers: receive artifact + what to check. Strict checking. Memoryless.
