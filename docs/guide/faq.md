# FAQ

Frequently asked questions about 牛马Agent.

## Positioning

### How does 牛马Agent compare to native agent teams and other tools?

**vs. native agent teams (Claude Code subagents/agent teams and similar single-vendor features).**
Native teams give you the smoothest experience inside one vendor and one session — if you only run Claude Code and your work fits in a session, they are a great default. 牛马Agent adds what a single vendor structurally cannot:

- **Cross-vendor groups** — Claude Code, Codex CLI, Grok Build, Kimi Code, ChatGPT Web, and more in one group, so you can route work to whichever model or subscription fits each role.
- **Durable state** — groups, messages, delivery/read/reply facts, and tasks live in an append-only ledger owned by a daemon. Restarting a terminal (or your machine) does not dissolve the team.
- **Remote operations** — check, pause, resume, and redirect a running group from Telegram, Slack, Discord, Feishu, DingTalk, WeCom, or Weixin.
- **An audit trail** — every message and its delivery state is replayable for review and debugging.

**vs. parallel task runners (worktree/task-board tools).**
These tools excel at fanning out isolated tasks in parallel. 牛马Agent's focus is the coordination layer they intentionally skip: agents that talk to each other, choose whether a message should interrupt or wait in Mail, hand off tracked work, and expose delivery/read/reply state — plus daemon-owned lifecycle and IM-side operations. The two approaches compose well: keep a task runner for fan-out and use 牛马Agent as the durable coordination plane.

**vs. IM assistant gateways (personal-assistant products that live in your chat app).**
Those products put a general assistant in your messenger. 牛马Agent is built for delivery-grade collaboration on real work: tracked tasks with owners and outcomes, explicit delivery/read/reply semantics, multi-agent groups bound to a repository scope, and a tiered token and capability-allowlist security model.

In short: 牛马Agent does not replace your agents — it is the coordination layer that turns them into a durable, observable team. See also [Positioning](/reference/positioning) for what 牛马Agent deliberately is and is not.

## Installation & Setup

### 如何安装和更新牛马Agent？

按[源码安装说明](./getting-started/index.md#从源码安装)构建。更新时先备份 `NIUMA_HOME`，然后更新源码并重新构建同一个命令。

### How do I uninstall 牛马Agent without losing my groups?

Run `niuma-agent home` first and stop the running product. Pip installations should be
removed with `python -m pip uninstall niuma-agent`. For a website-script install,
verify the complete `.niuma-agent-standalone` ownership marker and remove only the
owned executable and marker; do not delete a shared command directory. 牛马Agent
intentionally retains `NIUMA_HOME`, so groups, ledgers, settings, credentials,
and browser profiles remain available after reinstall. Exact macOS/Linux and
Windows standalone steps are in the
[distribution and migration guide](../rust-migration.md#uninstall-without-removing-user-data).

### How do I upgrade from an older version (0.3.x)?

You must uninstall the old version first:

```bash
# For pipx users
pipx uninstall niuma-agent

# For pip users
pip uninstall niuma-agent

# Remove any leftover binaries
rm -f ~/.local/bin/niuma-agent ~/.local/bin/niumad
```

Then install the new version. Note that 0.4.x has a completely different command structure from 0.3.x.

### What are the system requirements?

- Linux x86-64 with glibc 2.28+, Apple Silicon macOS 11+, or Windows x86-64
- At least one supported agent runtime CLI

构建需要 Rust 1.88+、Node.js 24 和 npm。使用迁移脚本时需要 Python 3 与 PyYAML。

### Can I choose a different product implementation?

You do not. 牛马Agent 0.4.36 has one Rust product implementation. The 0.4.35
`niuma-agent python` / `niuma-agent rust` selectors and persisted implementation preference
are retired.

### How do I check if 牛马Agent is working?

```bash
niuma-agent status
niuma-agent doctor
```

These show native product and daemon status, agent runtimes, installation
ownership, and environment diagnostics.

### Does a leftover `niuma-web.lock` mean 牛马Agent is still running?

No. The operating-system file lock is authoritative; the file may retain the
last owner's PID after a crash. `niuma-agent` automatically reclaims an unlocked file,
replaces the PID, and starts its embedded daemon when the Web process starts.
Manual lock deletion or a separate `niuma-agent daemon start` is not required. If 牛马Agent
reports that another instance is running, that process still holds the real file
lock and should be stopped normally.

### Why does an embedded browser open a physical Chrome window on Linux?

Projected browsers require `Xvfb` to stay off the host desktop. Install `xvfb` (and optionally
`x11vnc` for the VNC viewer), run `niuma-agent doctor`, then use **Restart ChatGPT browser**. Current 牛马Agent
fails browser startup when Xvfb is missing instead of silently falling back to the host `DISPLAY`.

## Agents

### Which AI agents are supported?

- Claude Code (`claude`)
- Cline CLI (`cline`)
- Codex CLI (`codex`)
- GitHub Copilot CLI (`copilot`)
- Cursor CLI (`cursor-agent`)
- Devin CLI (`devin`)
- Kiro CLI (`kiro-cli`)
- Kilo Code CLI (`kilo`)
- Antigravity CLI (`agy`)
- Droid (`droid`)
- Grok Build (`grok`)
- Hermes Agent (`hermes`)
- Kimi Code (`kimi`)
- OpenCode (`opencode`)
- Amp (`amp`)
- Auggie (`auggie`)
- Custom (manual fallback; provide your own command and MCP wiring)

### What's the difference between Foreman and Peer?

- **Foreman**: The first enabled agent. Coordinates work, receives system notifications, can manage other agents.
- **Peer**: Independent expert. Has their own judgment, can only manage themselves.

### How do I add a custom agent?

```bash
niuma-agent actor add my-agent --runtime custom --command "my-custom-cli"
```

### Agent won't start?

1. Check the terminal tab for error messages
2. Verify MCP is configured: `niuma-agent setup --runtime <name>`
3. Ensure the CLI is installed and in PATH
4. Try: `niuma-agent actor restart <actor_id>`

## Messaging

### How do I send a message to a specific agent?

```bash
niuma-agent send "Please do X" --to agent-name
```

Or in the Web UI, type `@agent-name` in your message.

### Agent isn't responding to my messages?

1. Check if the agent is running (green indicator in Web UI)
2. Check the inbox: `niuma-agent inbox --actor-id <agent-id>`
3. Look at the terminal tab for errors
4. Try restarting the agent

### How do read receipts work?

Agents call `niuma_inbox_read` to receive and consume the next ordered batch.
The returned batch boundary is committed cumulatively; bootstrap previews and
Web polling do not consume messages.

## Remote Access

### How do I access 牛马Agent from my phone?

**Option 1: Cloudflare Tunnel**
```bash
cloudflared tunnel --url http://127.0.0.1:8848
```

**Option 2: IM Bridge**
```bash
niuma-agent im set telegram --token-env TELEGRAM_BOT_TOKEN
niuma-agent im start
```

**Option 3: Tailscale**
```bash
NIUMA_WEB_HOST=$(tailscale ip -4) niuma-agent
```

### Is it safe to expose the Web UI?

Before exposing the Web UI, create an **Admin Access Token** in **Settings > This instance > Web Access** and then sign in with that token.

Use Cloudflare Access or Tailscale for additional security.

## Performance

### How much resources does 牛马Agent use?

- Daemon: Minimal native background service
- Web UI: Standard React app
- Agents: Depends on the runtime

### The ledger file is getting large

牛马Agent supports snapshot/compaction. Large blobs are stored separately in the `blobs/` directory.

### How do I reduce message latency?

1. Ensure agents are already running
2. Use specific @mentions instead of broadcasts
3. Keep the daemon running (don't restart frequently)

## Troubleshooting

### Why do git worktrees remain after an agent stops? {#why-do-git-worktrees-remain-after-an-actor-stops}

牛马Agent does not manage worktree cleanup. Agents or custom native launch commands can create worktrees, and stopping an agent does not guarantee the runtime's cleanup flow. See [Git worktrees and long-lived agents](runtimes.md#git-worktrees-and-long-lived-actors) for ownership and manual cleanup steps.

### Daemon won't start

```bash
niuma-agent daemon status  # Check if already running
niuma-agent daemon stop    # Stop existing instance
niuma-agent daemon start   # Start fresh
```

### Port 8848 is unavailable

```bash
NIUMA_WEB_PORT=9000 niuma-agent
```

On Windows, Hyper-V / WSL / WinNAT / HNS can reserve a TCP port even when no
process is listening on it. If `8848` still fails to start and you do not see an
owning PID, check the excluded port ranges:

```powershell
netsh interface ipv4 show excludedportrange protocol=tcp
```

If `8848` falls inside one of those ranges, start 牛马Agent on a different port:

```powershell
niuma-agent web --port 9000
```

### MCP not working

```bash
niuma-agent setup --runtime <name>  # Re-run setup
niuma-agent doctor                  # Check configuration
```

### Web UI not loading

1. Check daemon is running: `niuma-agent daemon status`
2. Check the port: http://127.0.0.1:8848/
3. Check browser console for errors
4. Try a different browser

## Concepts

### What is a Working Group?

A working group is like an IM group chat with execution capabilities. It includes:
- An append-only ledger (message history)
- One or more agents
- Optional scopes (project directories)

### What is the Ledger?

The ledger is an append-only event stream that stores all messages, state changes, and decisions. It's the single source of truth for a working group.

### What is MCP?

MCP (Model Context Protocol) is how agents interact with 牛马Agent. It exposes a rich tool surface for messaging, context management, automation, and system control.

### What is a Scope?

A scope is a project directory attached to a working group. Agents work within scopes, and events are attributed to scopes.
