# Simple Plan

A minimal Codex skill that adds strict verification to every task.

## What It Does

1. **Plan** - Break user request into concrete steps
2. **Execute** - Spawn worker subagents for each step
3. **Verify** - Spawn strict verifier subagents for each deliverable
4. **Fix Loop** - If verification fails, fix and re-verify (up to 3 cycles)
5. **Report** - Summarize results

## Installation

`
git clone https://github.com/bauerelizabeth07139/simple-plan.git
cd simple-plan
cp -r . ~/.codex/skills/.system/simple-plan
`

No AGENTS.global.md needed. This skill is lightweight.

## Rules

- All subagents inherit parent model. No model override.
- Workers and verifiers are separate. Never mixed.
- Verifiers are memoryless (fork_context=false).
- Maximum 3 fix cycles per deliverable.

## Version

1.0.0
