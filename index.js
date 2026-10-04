/**
 * `dsh-simple-plan` — a DeepSeek Harness host plugin that ships one skill.
 *
 * The skill is the repository's own `SKILL.md`, translated to the harness's
 * tool names and kept in `skills/simple-plan/`. The plugin registers it as a
 * bundled skill provider, so installing the bundle is all it takes: nothing is
 * copied into a skills directory, and the skill disappears again with the
 * bundle rather than lingering in a user folder.
 *
 * @module dsh-simple-plan
 */

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { BUNDLED_SKILL_RANK } from "@deepseek-ai/dsh-skill";

/** Plugin identity, used by the loader row. */
export const name = "dsh-simple-plan";
/** The registry this plugin registers into. */
export const inject = ["skills"];

const ROOT = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = join(ROOT, "skills", "simple-plan");
const SKILL_PATH = join(SKILL_ROOT, "SKILL.md");
const SKILL_NAME = "simple-plan";

const DESCRIPTION =
	"Adds strict verification to every task: plan 2-7 steps, execute them with " +
	"worker subagents, verify each deliverable with a memoryless verifier " +
	"subagent, and fix in at most three cycles before reporting honestly.";

/**
 * Read the skill body without its YAML front-matter — the Harness carries the
 * name and description separately, so the front-matter would only be repeated.
 * @returns {Promise<string>} the markdown the model receives.
 */
async function readSkill() {
	return (await readFile(SKILL_PATH, "utf8"))
		.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/u, "")
		.trim();
}

/**
 * Register the bundled skill.
 * @param {object} ctx - registrant context; must carry `skills`.
 */
export function apply(ctx) {
	ctx.skills.registerProvider(() => {
		const candidate = {
			name: SKILL_NAME,
			description: DESCRIPTION,
			invocation: { modelInvocable: true, userInvocable: true },
			provider: name,
			source: "bundled",
			rank: BUNDLED_SKILL_RANK,
			locator: pathToFileURL(SKILL_PATH),
			resourceBase: { kind: "directory", path: SKILL_ROOT },
		};
		return {
			name,
			list: async () => [candidate],
			get: async (selected) =>
				selected.name === candidate.name
					? { ...candidate, content: await readSkill() }
					: undefined,
		};
	});
	ctx.logger.info(`${name}: bundled skill "${SKILL_NAME}" registered`);
}
