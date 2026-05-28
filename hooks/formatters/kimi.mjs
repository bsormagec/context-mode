/**
 * Kimi Code formatter — converts routing decisions into Kimi Code hook output format.
 *
 * Kimi Code supports deny via JSON stdout:
 *   { hookSpecificOutput: { permissionDecision: "deny", permissionDecisionReason: "..." } }
 *
 * For ask/modify/context, we emit the same shape and let Kimi Code accept or
 * ignore them (fails-open if unsupported). This is more capable than Codex,
 * which explicitly rejects those fields.
 *
 * Decision shape from routing.mjs:
 *   - { action: "deny", reason: string }
 *   - { action: "ask" }
 *   - { action: "modify", updatedInput: object }
 *   - { action: "context", additionalContext: string }
 *   - null (passthrough)
 *
 * @param {object | null} decision - Normalized decision from routePreToolUse
 * @returns {object | null} Kimi Code hook response, or null for passthrough
 */

export function formatDecision(decision) {
  if (!decision) return null;

  switch (decision.action) {
    case "deny":
      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: decision.reason ?? "Blocked by context-mode",
        },
      };

    case "ask":
      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "ask",
        },
      };

    case "modify":
      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "allow",
          permissionDecisionReason: "Routed to context-mode sandbox",
          updatedInput: decision.updatedInput,
        },
      };

    case "context":
      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          additionalContext: decision.additionalContext ?? "",
        },
      };

    default:
      return null;
  }
}
