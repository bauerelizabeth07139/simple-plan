# simple-plan

**Plan → Execute → Verify → Fix**, enforced on every task, as a DeepSeek
Harness plugin. The skill ships inside the bundle: install the plugin and the
skill is there, with nothing to copy into a skills directory.

*A minimal planning skill: break the request into 2–7 steps, execute each with a
worker subagent, verify every deliverable with an independent memoryless
verifier subagent, and fix in at most three cycles before reporting honestly.*

## Install

**DeepSeek Harness Desktop** — open **Plugins** in the sidebar, choose **Add
plugin**, and enter:

```
https://github.com/bauerelizabeth07139/simple-plan
```

Then switch the new **dsh-simple-plan** bundle on. The Desktop app boots the
reserved `desktop` profile, so that is where it has to be enabled.

**dsh CLI** — install it into the profile you actually boot:

```sh
dsh plugin --profile web add bauerelizabeth07139/simple-plan
```

**No git on the machine?** pnpm resolves a git shorthand with `git ls-remote`,
which fails with `'git' is not recognized` when git is missing. Use the tarball
instead — that path is plain HTTPS:

```sh
dsh plugin --profile web add https://codeload.github.com/bauerelizabeth07139/simple-plan/tar.gz/master
```

The same address works in the Desktop **Add plugin** dialog. Replace `master`
with a commit SHA to pin an exact revision (`/tar.gz/<sha>`).

Uninstall with `dsh plugin --profile web remove dsh-simple-plan`.

## What it does

1. **Plan** — understand the request, break it into 2–7 concrete steps, each
   with a deliverable.
2. **Execute** — spawn a worker subagent per non-trivial step. A worker gets the
   task, the deliverable and the paths; it never gets the acceptance criteria.
3. **Verify** — spawn a verifier subagent per deliverable. Verifiers are
   memoryless (`subagent`, never `subagent_fork`) and report PASS or FAIL with
   evidence.
4. **Fix loop** — on FAIL, read the evidence, spawn a new worker for the
   specific defect, then a new verifier. At most three cycles.
5. **Report** — summarise what was done, list each verification result, and
   state ALL PASS or FAIL.

The full instructions live in [`skills/simple-plan/SKILL.md`](skills/simple-plan/SKILL.md).
The plugin registers that file as a bundled skill through the Harness skill
registry, so it can be triggered by the model and invoked by the user.

## How it differs from the Codex original

The rules are unchanged; the tool names are the Harness's:

| Codex | DeepSeek Harness |
|---|---|
| `multi_agent_v1__spawn_agent(message=…, fork_context=false)` | `subagent(description=…, prompt=…)` |
| `multi_agent_v1__wait_agent(targets=[…])` | subagents report back on their own; the parent collects results |
| `apply_patch` | `edit` / `write` |
| `shell` | `pwsh` (Windows) or the session's shell tool |
| `read_file` | `read` |

The one substantive gain: DSH gives every agent `read_image`, so a verifier can
inspect a screenshot even when the session model has no built-in vision. The
skill tells it to.

## Development

No build step and no runtime dependencies — `@deepseek-ai/cordis` and
`@deepseek-ai/dsh-skill` are peers supplied by the Harness.

```sh
npm test    # node >= 22: manifest, card metadata, loader patch, skill, syntax
```

`index.js` is the whole host half: it registers the bundled skill provider.
`cordis.patch.yml` is the loader row that mounts it.

## Repository layout

| Path | Purpose |
|---|---|
| `index.js` | the DSH plugin: registers the bundled skill |
| `cordis.patch.yml` | the loader row that activates the plugin |
| `skills/simple-plan/SKILL.md` | the skill itself, in Harness tool names |
| `locale/{en,zh}.json` | card title and description for the plugin lists |
| `assets/icon.svg` | card artwork |
| `test/plugin.test.mjs` | static composition checks |
| `SKILL.md`, `AGENTS.md` | the original Codex skill and instructions, unchanged |

## Codex usage (unchanged)

The repository still contains the original files, byte for byte. On Codex:

```sh
git clone https://github.com/bauerelizabeth07139/simple-plan.git
cd simple-plan
cp -r . ~/.codex/skills/.system/simple-plan
```

No `AGENTS.global.md` is needed for the Codex skill. Note that DSH also reads
`AGENTS.md` — including a user-global `$DSH_HOME/AGENTS.md` — so if you want the
rules applied outside a skill invocation, that file is the place.

## License

[MIT](LICENSE)
