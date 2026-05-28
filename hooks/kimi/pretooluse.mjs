#!/usr/bin/env node
import "./platform.mjs";
import "../suppress-stderr.mjs";
/**
 * Kimi Code CLI preToolUse hook for context-mode.
 *
 * Kimi Code PreToolUse supports:
 *   - Exit code 0 with JSON:
 *     { hookSpecificOutput: { permissionDecision: "deny", permissionDecisionReason: "..." } }
 *     → block the tool call
 *   - Exit code 2 → block (stderr used as reason)
 *
 * Unlike Codex, Kimi Code does not explicitly reject ask/modify/additionalContext
 * in its JSON output, so we emit them and let the host accept or ignore them
 * (fails-open if unsupported).
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readStdin, parseStdin, getInputProjectDir, getSessionId, KIMI_OPTS } from "../session-helpers.mjs";
import { routePreToolUse, initSecurity } from "../core/routing.mjs";
import { formatDecision } from "../core/formatters.mjs";

const __hookDir = dirname(fileURLToPath(import.meta.url));
await initSecurity(resolve(__hookDir, "..", "..", "build"));

const raw = await readStdin();
const input = parseStdin(raw);
const tool = input.tool_name ?? "";
const toolInput = input.tool_input ?? {};
const projectDir = getInputProjectDir(input, KIMI_OPTS);

const decision = routePreToolUse(tool, toolInput, projectDir, "kimi", getSessionId(input, KIMI_OPTS));
const response = formatDecision("kimi", decision);
const output = response ?? {
  hookSpecificOutput: { hookEventName: "PreToolUse" },
};
process.stdout.write(JSON.stringify(output) + "\n");
