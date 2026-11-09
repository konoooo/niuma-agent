# CLI Reference

Complete command reference for the 牛马Agent CLI.

## Global Commands

### `niuma-agent`

Start the daemon and the Web UI, reusing an existing daemon or starting one if
needed.

```bash
niuma-agent                    # In a terminal: daemon + Web UI, with the terminal interface
niuma-agent --headless         # Daemon + Web UI with plain log output (same as `niuma-agent web`)
niuma-agent --help             # Show help
```

In an interactive terminal, `niuma-agent` opens a terminal interface for this launch.
Its main screen is a status panel: the version, the actual Web address, the
`NIUMA_HOME` in use, whether this launch started the daemon, the Groups, and the
native sessions this 牛马Agent knows. Terminals that recognize URLs open the Web
address directly, for example with Ctrl+click in Windows Terminal. Lists refresh
every few seconds while they are on screen; a failed refresh keeps the last list
and says how old it is.

The Groups table has NAME, STATUS and RUNNING columns. STATUS uses the Web UI's
words: Running, Idle, Paused, Offline and Stopped. Stopped means the Group was
stopped. Offline means it was not stopped or paused, but no agent is running:
for example a new Group, or one whose agents exited or whose native sessions are
closed. RUNNING counts the managed agents that are running and the native
members ready to receive from that Group; it is neither the number of members
nor the number of busy models. The native sessions table has APP, DIRECTORY,
STATUS and ID columns; ID is the end of the session's source id, which
`/sessions` shows in full.

On the regular screens, browsing and every action use the arrow keys, Enter, Tab
and Esc, without letter shortcuts. Up/Down moves the highlight, Enter opens or runs the highlighted
row, and Esc goes back one level or cancels a confirmation. On the main screen, Up/Down selects a Group, PgUp/PgDn pages through a list
longer than the screen, and Enter opens its page. Tab on an empty command line, or typing `/`, opens the command menu:
Up/Down moves through it, Tab completes the selected command without running
it, Enter runs it, and Esc closes it. Left/Right, Home/End, Delete and
Ctrl+A/E/U edit a typed command. Pasting only inserts text: in terminals with
bracketed paste, pasted newlines do not run a command.

A Group's page shows its recorded state, how many tasks it has in each state,
its agents and a link that opens it in the Web UI. Its rows are Tasks and the
actions the Group's state allows: Start for a stopped Group (and Stop while it
still reports running agents), Resume and Stop for a paused one, and Start and
Stop otherwise. Each action asks for a confirmation
that names the Group and what will happen. The confirmation starts on Cancel:
choose the action with Up/Down and press Enter to run it, so pressing Enter
twice changes nothing. Starting runs the enabled agents that
are not running and lets enabled native members receive again, so Start also
helps a running Group whose other agents have exited; stopping stops the managed
agents and stops delivery to native members, whose apps stay open. Tasks lists the Group's tasks: Left/Right switches between the unfinished
ones (Active, then Planned) and the Done ones, and PgUp/PgDn pages through a
long list. Enter shows one task read-only, with its status, assignee,
checklist, notes and outcome; tasks are edited in the Web UI.

When agents wait for your answer in a Group, the main screen shows the number
after its name (`[~3]` is from an earlier read, `[?]` cannot be confirmed), and
its page adds a Waiting for you row. That row lists the open requests and
PgUp/PgDn pages through them; Enter opens one. In a request, Up/Down moves
between its options, Other and Send answer, and Enter selects the highlighted
row: nothing is chosen until you press Enter on it. Other opens an editor where
Ctrl+J starts a new line and Enter or Esc returns. Send answer records the
answer; when the result is uncertain, only the same answer can be retried.
Requests that cannot be answered here, such as ones from another Group, say so
and are answered in the Web conversation.

Commands:

- `/groups` opens the page of the Group selected on the main screen.
- `/sessions` lists every native session this 牛马Agent knows. Enter shows the
  selected session's details.
- `/setup` connects Codex, Claude Code, Pi or OpenCode sessions; see
  [Native sessions](../guide/local-sessions).
- `/help` lists the commands and keys. It scrolls with Up/Down when the terminal
  is short.
- `/quit` (or `/exit`, or Ctrl+C on any page) stops what this launch started:
  the Web server, and the daemon when this launch started it. A daemon that was
  already running keeps running. If stopping takes too long, a second Ctrl+C
  forces an exit (after `/quit`, press Ctrl+C twice). After the interface
  closes, the terminal shows what actually stopped.

The interface is English only and needs at least 60x16 characters; on a wider
terminal it stays within 100 columns. In a smaller terminal it shows only a
notice and accepts only Ctrl+C, so nothing can be confirmed unseen. It does not use the mouse; Ctrl+Z does not
suspend it (use `/quit`), and Ctrl+L redraws the screen. `NO_COLOR` turns its
colors off.

`niuma-agent` runs headless, with plain log output and no terminal interface, when
given `--headless`, when its input or output is not a terminal, or when
`NIUMA_WEB_MODE` / `NIUMA_WEB_READONLY` select read-only Exhibit mode. Use
`--headless` on servers, in containers, under a service manager and in scripts.
It applies only to this launch, so `niuma-agent --headless` with a subcommand is an
error. Other options keep the interface: `niuma-agent --port 9000` in a terminal opens
it on port 9000.

### `niuma-agent doctor`

Check your environment and diagnose issues.

```bash
niuma-agent doctor             # Full environment check
```

Browser readiness uses the same Chrome/Edge discovery as the projected Web runtime on
Linux, macOS, and Windows, and may additionally recognize system Chromium.
On Linux, the report includes projected-browser readiness: system Chrome/Edge, required `Xvfb`
isolation, and the optional `x11vnc` VNC viewer. A missing `x11vnc` does not prevent browser
isolation; 牛马Agent falls back to its CDP screencast viewer.

The installation section reports the executable handling the current invocation,
the first `niuma-agent` selected by PATH, and all other `niuma-agent` commands. A `CONFLICT`
status means an older installation is ahead of the current launcher; move the
current launcher's directory to the front of PATH and open a new terminal.

### `niuma-agent runtime list`

List available agent runtimes.

```bash
niuma-agent runtime list       # List supported runtimes and whether each is available
niuma-agent runtime list --all # Also include the custom runtime
```

## Local native sessions

`niuma-agent sessions enable|disable --runtime codex|claude|pi|opencode` installs or removes the same-user native integration; `/setup` in the terminal interface runs the same enable step for the apps you pick. Use `niuma-agent sessions list [--include-offline]`, `send --to <source_id> --text <text>`, and `create --sources <ids...>` to collaborate without pairwise invitations.

Use `niuma-agent sessions join --group <group_id> --sources <ids...>` to add sources to an existing Group, or `leave --group <group_id> --from <source_id>` to pause one source's access without stopping its native process. `recovery --group <group_id> --actor <actor_id>` reads local recovery instructions; adding `--refresh` explicitly rechecks Codex's existing receive channel. Neither form starts or resumes the native application or replays messages. See [Native sessions](../guide/local-sessions) for requirements, reload steps and lifecycle semantics.

## Daemon Commands

### `niuma-agent daemon`

Manage the 牛马Agent daemon.

```bash
niuma-agent daemon status      # Check daemon status
niuma-agent daemon start       # Start daemon
niuma-agent daemon stop        # Stop daemon
```

Notes:

- `niuma-agent daemon start` refuses to spawn a duplicate daemon if the pid-file process is still alive but IPC is not responding.
- Check `niuma-agent daemon status` and `niuma-agent doctor` before restarting an unresponsive daemon. `niuma-agent daemon stop` stops its managed processes across Groups; after it completes, `niuma-agent daemon start` starts the daemon again.

## Membership and Reach Commands

Membership is optional. Local 牛马Agent remains usable without an account. Reach is
a Linux/macOS preview and requires an Admin Access Token in **Settings > Web
Access** before publishing the local Web surface.

```bash
niuma-agent login             # Bind this machine through device authorization
niuma-agent logout            # Retire this account device and clear its local identity
niuma-agent reach install     # Install or upgrade the pinned cloudflared helper
niuma-agent reach on          # Publish the authenticated Web surface
niuma-agent reach status      # Show account, hostname, Web, and publication state
niuma-agent reach off         # Stop publication without removing local identity
```

The token-bearing Web URL is shown here; keep it private. ChatGPT/Web Model
connector credentials are agent-specific and are managed from that agent's Web
Model settings. Windows helper installation is not included in this release
candidate, so Reach is unavailable there.

## Group Commands

### `niuma-agent attach`

Create a working group with a project scope, or attach a scope to an explicitly
selected group. The selected group becomes active for subsequent commands.

```bash
niuma-agent attach .           # Attach current directory as scope
niuma-agent attach /path/to/project
niuma-agent attach . --group <group_id> # Attach a scope to an existing Group
```

Without `--group`, each invocation creates a new Group. To select an existing
Group without attaching a scope, use `niuma-agent groups` and `niuma-agent use <group_id>`.
Relative paths in `niuma-agent attach` and `niuma-agent group use` resolve from the invoking
terminal's directory, independently of where the daemon was started.

### `niuma-agent groups`

List all working groups.

```bash
niuma-agent groups             # List groups
```

### `niuma-agent use`

Switch to a different working group.

```bash
niuma-agent use <group_id>     # Switch to group
```

### `niuma-agent group`

Manage the current working group.

```bash
niuma-agent group create --title "my-group"         # Create group
niuma-agent group show <group_id>                   # Show group metadata
niuma-agent group update --group <id> --title "..." # Update title/topic
niuma-agent group use <group_id> .                  # Set active scope
niuma-agent group start --group <id>                # Start the Group's agents
niuma-agent group stop --group <id>                 # Stop the Group's agents
niuma-agent group set-state idle --group <id>       # Set state: active/idle/paused/stopped
niuma-agent group detach-scope <scope_key> --group <id>
niuma-agent group delete --group <id> --confirm <id>
```

`set-state stopped` is the same as `group stop`: it stops the Group's agents and
delivery to its native members, never only its recorded state.

## Agent Commands {#actor-commands}

### `niuma-agent actor add`

Add a new agent to the Group.

```bash
niuma-agent actor add <actor_id> --runtime claude
niuma-agent actor add <actor_id> --runtime codex
niuma-agent actor add <actor_id> --runtime web_model
niuma-agent actor add <actor_id> --runtime custom --command "my-agent"
```

Options:
- `--runtime`: Agent runtime (claude, codex, web_model, droid, etc.)
- `--command`: Custom command (for custom runtime)
- `--title`: Display title
- `--model-label`: Optional model name the operator declares for people and external tools; 牛马Agent does not check it or use it to launch the runtime

For a ChatGPT Web Model agent, create and start the agent from the target Group in the 牛马Agent Web UI, then finish ChatGPT sign-in, MCP URL and chat binding in **Settings → This instance → Web Models → ChatGPT**.

### `niuma-agent actor`

Manage agents.

```bash
niuma-agent actor list                    # List actors
niuma-agent actor add <actor_id> --scope /path/to/project
niuma-agent actor start <actor_id>        # Start actor
niuma-agent actor stop <actor_id>         # Stop actor
niuma-agent actor restart <actor_id>      # Restart actor
niuma-agent actor remove <actor_id>       # Remove actor
niuma-agent actor update <actor_id> --scope /path/to/project
niuma-agent actor update <actor_id> --model-label "gpt-5-codex"   # An empty value clears it
niuma-agent actor secrets <actor_id> ...  # Manage runtime-only secrets
```

Agent scope arguments are project paths at the CLI boundary. 牛马Agent resolves them
to the attached scope key before persistence.

## Message Commands

### `niuma-agent send`

Send a message.

```bash
niuma-agent send "Hello"                  # No --to: default recipient policy applies (default: foreman)
niuma-agent send "Hello" --to @foreman    # Send to foreman
niuma-agent send "Hello" --to peer-1      # Send to a specific agent
niuma-agent send "Announcement" --to @all # Explicit broadcast
niuma-agent send "Please answer" --to peer-1 --mode request-reply
niuma-agent send "For later" --to peer-1 --mode mail
niuma-agent send "Review this scope" --path src/api
```

`--mode` accepts `send`, `request-reply`, or `mail` and defaults to `send`.
`request-reply` requires concrete recipients; `mail` remains in Inbox without an
immediate runtime prompt.

### `niuma-agent tracked-send`

Create a task and send one linked delegation message.

```bash
niuma-agent tracked-send "Please implement this and reply with validation evidence." \
  --to peer-1 \
  --title "Implement feature" \
  --outcome "Feature is implemented and validation evidence is reported"
```

The CLI also forwards `--checklist`, `--assignee`, `--waiting-on`, `--handoff-to`,
`--notes`, `--task-priority`, and `--idempotency-key` to the daemon. The linked
message always uses Send.

### `niuma-agent reply`

Reply to a message.

```bash
niuma-agent reply <event_id> "Reply text" --to peer-1
niuma-agent reply <event_id> "Reply for later" --to peer-1 --mode mail
```

`--mode` accepts `send` or `mail` and defaults to `send`. Both modes close a
matching Send + Reply obligation; Mail stores the reply without immediately
prompting the recipient. Mail is agent-only. A send or reply may address
`user` alone or one/more agents, but never both in the same message.

### `niuma-agent deliver`

Promote an existing Mail to Send, or retry a blocked/failed delivery, without
creating another chat message.

```bash
niuma-agent deliver <event_id> --to peer-1
niuma-agent deliver <event_id> --to peer-1 --force-ambiguous
```

`--force-ambiguous` is required when prior delivery may already have reached the
runtime and therefore may produce a duplicate prompt.

### `niuma-agent cancel-reply`

Cancel every still-open reply obligation for an existing Send + Reply message.

```bash
niuma-agent cancel-reply <event_id>
```

### `niuma-agent inbox`

Read and consume an agent's unread Mail, advancing its read cursor. This changes
the agent's unread state; it is not a read-only view of the agent's responses.
Use `niuma-agent tail` or Web chat to view recorded messages without consuming Mail.

```bash
niuma-agent inbox --actor-id <id>         # Read and consume the next unread Mail batch
niuma-agent inbox --actor-id <id> --limit 10
```

### `niuma-agent inbox-summary`

Summarize the Mail still waiting for every agent in a Group, without consuming it.

```bash
niuma-agent inbox-summary --cutoff 2026-10-30T00:00:00Z   # Per agent: waiting Mail, how much was sent at or before the cutoff, the oldest's age when known
```

It does not move read cursors, start agents or send notices, and returns no
message text. The user, the system and the Group's Foreman may use it (`--by`,
default `user`); peers may not.

### `niuma-agent tail`

Tail the ledger.

```bash
niuma-agent tail                          # Show recent events
niuma-agent tail -n 50                    # Show last 50 events
niuma-agent tail -f                       # Follow new events
```

## IM Bridge Commands

### `niuma-agent im`

Manage IM Bridge.

```bash
niuma-agent im set telegram --token-env TELEGRAM_BOT_TOKEN
niuma-agent im set slack --bot-token-env SLACK_BOT_TOKEN --app-token-env SLACK_APP_TOKEN
niuma-agent im set discord --token-env DISCORD_BOT_TOKEN
niuma-agent im set mattermost --mattermost-url https://mattermost.example.com --bot-token-env MATTERMOST_BOT_TOKEN
niuma-agent im set feishu --app-key-env FEISHU_APP_ID --app-secret-env FEISHU_APP_SECRET
niuma-agent im set dingtalk --app-key-env DINGTALK_APP_KEY --app-secret-env DINGTALK_APP_SECRET --robot-code-env DINGTALK_ROBOT_CODE

niuma-agent im start                      # Start IM bridge
niuma-agent im stop                       # Stop IM bridge
niuma-agent im status                     # Check IM bridge status
niuma-agent im logs                       # View IM bridge logs
niuma-agent im logs -f                    # Follow IM bridge logs
```

## Group Space Commands

### `niuma-agent space`

Manage Group Space provider-backed shared memory.

```bash
niuma-agent space status
niuma-agent space credential status
niuma-agent space credential set --auth-json '{"cookies":[{"name":"SID","value":"...","domain":".google.com"}]}'
niuma-agent space credential set --auth-json-file ./notebooklm.storage_state.json
niuma-agent space credential clear
niuma-agent space health

niuma-agent space bind [remote_space_id]    # omit to auto-create NotebookLM notebook
niuma-agent space unbind

niuma-agent space ingest --kind context_sync --payload '{"vision":"v0.5 plan"}'
niuma-agent space ingest --kind resource_ingest --payload '{"source_type":"file","file_path":"space/spec.md","title":"Spec"}' --idempotency-key ingest-file-1
niuma-agent space ingest --kind resource_ingest --payload '{"source_type":"web_page","url":"https://example.com/spec"}' --idempotency-key ingest-url-1

niuma-agent space query "What is the latest shared plan?"
niuma-agent space query "Summarize risks from these sources" --options '{"source_ids":["src_1","src_2"]}'

niuma-agent space jobs list
niuma-agent space jobs list --state failed --limit 20
niuma-agent space jobs retry <job_id>
niuma-agent space jobs cancel <job_id>
```

Notes:
- `--group` is optional; defaults to the active group.
- Current provider is `notebooklm`.
- `--payload` and `--options` must be JSON objects.
- `niuma-agent space query --options` only supports `source_ids` (array of source IDs).
- `language` / `lang` are not valid query options (put language requirement in query text).
- Provider credentials are write-only; CLI/Web only return masked metadata.
- `niuma-agent space health` validates credential format and adapter compatibility.
- The native client follows the `notebooklm-py` v0.8.1 protocol baseline and
  supports attached-scope local files, pasted text, Web URL, YouTube, and
  Google Drive Docs/Slides/Sheets ingestion.
- Explicit ingest persists its job before one provider attempt. Failed jobs are
  retried only with `niuma-agent space jobs retry`; there is no hidden background
  ingest retry loop.
- Automatic two-way repo and daily-memory mirroring is retired for 0.4.36.
  Use explicit ingest/source operations; Rust still reads legacy 0.4.35 sync
  metadata in status views without resuming remote mutations.
- Artifact generation is asynchronous and does not save locally by default.
  Request wait/save explicitly when a local artifact is required. Native Rust
  download currently supports media, report/study-guide, infographic, and
  slide-deck outputs; interactive quiz/flashcard/mind-map and data-table
  downloads are intentionally unavailable; generate/list still work and the
  capability matrix reports the boundary.

## Product Implementation

### Rust-only 0.4.36

`niuma-agent` directly runs the native product executable. Product-engine selectors
are retired: `niuma-agent python` and `niuma-agent rust` are no longer commands, and an old
`NIUMA_HOME/implementation.json` file is ignored rather than migrated or used as
a runtime choice. Use ordinary commands directly:

```bash
niuma-agent                 # launch daemon + Web
niuma-agent status          # show product, daemon, groups, agents and agent runtimes
niuma-agent doctor          # inspect the native installation and environment
niuma-agent daemon start    # explicit daemon lifecycle
```

The former `niumad` executable is also retired. Scripts should use
`niuma-agent daemon start|stop|status|run`. Compatible daemon state filenames such as
`niumad.addr.json` remain unchanged so a 0.4.35 home can be adopted safely.

## Setup Commands

### `niuma-agent setup`

Prepare or report the MCP integration for an agent runtime.

```bash
niuma-agent setup                         # Configure every supported runtime; unavailable CLIs are reported
niuma-agent setup --runtime claude        # Report 牛马Agent-owned per-session MCP for Claude Code
niuma-agent setup --runtime codex         # Auto-configure for Codex
niuma-agent setup --runtime copilot       # Auto-configure for GitHub Copilot CLI
niuma-agent setup --runtime cursor        # Show prompt-assisted setup contract for Cursor CLI
niuma-agent setup --runtime devin         # Auto-configure for Devin CLI
niuma-agent setup --runtime kiro          # Auto-configure for Kiro CLI
niuma-agent setup --runtime kimi          # Configure native Kimi Code MCP
niuma-agent setup --runtime kimi --runtime-mode acp  # Report session-owned MCP
niuma-agent setup --runtime auggie --runtime-mode acp # Report session-owned MCP
niuma-agent setup --runtime kiro --runtime-mode acp   # Official V3; session-owned MCP
niuma-agent setup --runtime hermes --runtime-mode acp # Official ACP; session-owned MCP
niuma-agent setup --runtime droid --runtime-mode acp  # Official ACP; session-owned MCP
niuma-agent setup --runtime pi            # Report 牛马Agent-owned RPC session MCP
niuma-agent setup --runtime kilo          # Show prompt-assisted setup contract for Kilo Code CLI
niuma-agent setup --runtime antigravity   # Show prompt-assisted setup contract for Antigravity CLI
```

Without `--runtime`, setup performs one batch pass: installed CLI runtimes are configured,
prompt-assisted/manual runtimes return their configuration contract, and missing runtimes are
reported without aborting the remaining setup work.

### `niuma-agent update`

源码版本通过更新代码、重新构建升级。`niuma-agent update --check --offline` 可查看当前程序位置与安装类型。在线检查读取[发布索引](../releases.json)，`stable` 和 `rc` 分别对应正式版和候选版，未发布的频道用 `null` 表示。

## Web Commands

### `niuma-agent web`

Start the Web UI, reusing an existing daemon or starting one if needed, just
like `niuma-agent --headless`: never with the terminal interface, always with plain log
output. Unlike `niuma-agent --headless`, it accepts `--exhibit` (or `--mode exhibit`)
for a read-only Web UI.

```bash
niuma-agent web                           # Start Web UI
niuma-agent web --port 9000               # Custom port
niuma-agent web --exhibit                 # Read-only exhibit mode
niuma-agent web --mode exhibit            # Equivalent explicit mode
```

Only one Web process may run for a given `NIUMA_HOME`. If another 牛马Agent process
for that home is active, an interactive launch displays its PID and asks whether
to stop it before continuing. Non-interactive launches fail instead of stopping
an existing process implicitly.

## MCP Commands

### `niuma-agent mcp`

Start the MCP server (for agent integration).

```bash
niuma-agent mcp                           # Start MCP server (stdio mode)
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NIUMA_HOME` | `~/.niuma-agent` | Runtime home directory |
| `NIUMA_WEB_HOST` | saved setting, then `127.0.0.1` | Web UI bind address; `--host` overrides both |
| `NIUMA_WEB_PORT` | saved setting, then `8848` | Web UI port; `--port` overrides both |
| `NIUMA_WEB_MODE` | `normal` | Set to `exhibit` for a read-only Web UI |
| `NIUMA_WEB_READONLY` | unset | Truthy value also enables read-only exhibit mode |

For `niuma-agent` and `niuma-agent web`, an existing live Web binding is reused when neither
`--host` nor `--port` is supplied. Otherwise, each value resolves from its command
option, saved **Web Access** setting, environment variable, then built-in default.
