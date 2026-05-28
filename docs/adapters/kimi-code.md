# Kimi Code CLI Setup

Setup guide for using context-mode with [Kimi Code CLI](https://moonshotai.github.io/kimi-code/en/customization/hooks.html).

## Overview

Kimi Code CLI uses a JSON stdin/stdout hook paradigm similar to Claude Code and Codex CLI, with TOML-based configuration in `~/.kimi-code/config.toml`.

## Prerequisites

- Kimi Code CLI installed (`kimi` binary in PATH)
- `context-mode` installed globally:
  ```bash
  npm install -g context-mode
  ```

## Capabilities

| Feature | Status |
|---------|--------|
| PreToolUse | ✅ deny / ask / modify / context |
| PostToolUse | ✅ |
| SessionStart | ✅ |
| PreCompact | ✅ |
| UserPromptSubmit | ✅ (handles `ContentPart[]` array format) |
| Stop | ✅ |
| Modify args | ✅ (via `updatedInput`) |
| Modify output | ✅ |
| Inject session context | ✅ (via `additionalContext`) |
| Block tools | ✅ (exit code 2 or `permissionDecision: "deny"`) |

## Differences from Codex CLI

Kimi Code uses the same JSON stdin/stdout wire protocol as Codex, but with some important differences:

- **`additionalContext` is accepted** in PreToolUse responses (Codex rejects it)
- **`updatedInput` is accepted** for modifying tool arguments (Codex rejects it)
- **`permissionDecision: "ask"` is accepted** (Codex rejects it)
- **Exit code 2** blocks a tool call (same as Codex)
- **`ContentPart[]` prompts** — Kimi sends user prompts as an array of `{ type: "text", text: "..." }` objects instead of a plain string

## Configuration

Add to `~/.kimi-code/config.toml`:

```toml
[[hooks]]
event = "PreToolUse"
matcher = "Bash|Shell|Read|Edit|Write|WebFetch|Agent|ctx_execute|ctx_execute_file|ctx_batch_execute|ctx_fetch_and_index|ctx_search|ctx_index|mcp__"
command = "context-mode hook kimi pretooluse"
timeout = 30

[[hooks]]
event = "PostToolUse"
command = "context-mode hook kimi posttooluse"
timeout = 30

[[hooks]]
event = "SessionStart"
command = "context-mode hook kimi sessionstart"
timeout = 30

[[hooks]]
event = "PreCompact"
command = "context-mode hook kimi precompact"
timeout = 30

[[hooks]]
event = "UserPromptSubmit"
command = "context-mode hook kimi userpromptsubmit"
timeout = 30

[[hooks]]
event = "Stop"
command = "context-mode hook kimi stop"
timeout = 30
```

## Hook Commands

| Event | Command |
|-------|---------|
| PreToolUse | `context-mode hook kimi pretooluse` |
| PostToolUse | `context-mode hook kimi posttooluse` |
| SessionStart | `context-mode hook kimi sessionstart` |
| PreCompact | `context-mode hook kimi precompact` |
| UserPromptSubmit | `context-mode hook kimi userpromptsubmit` |
| Stop | `context-mode hook kimi stop` |

## MCP Configuration

Add to `~/.kimi-code/mcp.json`:

```json
{
  "mcpServers": {
    "context-mode": {
      "command": "context-mode",
      "args": []
    }
  }
}
```

## Session Storage

Sessions are stored in `~/.kimi-code/context-mode/sessions/`.

## Verify Installation

Run the diagnostic:

```bash
kimi # start a new session
# Then type:
ctx doctor
```

Or test individual hooks manually:

```bash
echo '{"tool_name":"Bash","tool_input":{"command":"curl https://example.com"}}' \
  | context-mode hook kimi pretooluse
```

Expected output: a JSON response with routing guidance redirecting to `ctx_execute` / `ctx_fetch_and_index`.
