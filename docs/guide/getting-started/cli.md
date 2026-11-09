# CLI Quick Start

Get started with 牛马Agent using the command line.

English | [简体中文](./cli-zh) | [日本語](./cli-ja)

## Before You Start

Install 牛马Agent using the [installation guide](./#installation). This walkthrough
uses Claude Code: install its CLI and sign in first. If Claude asks you to trust
your project, you can answer in the project beforehand or later in the agent's
terminal (Step 4). You can use another [supported runtime](../runtimes) that you
have already configured.

Check that 牛马Agent is available in your terminal:

```bash
niuma-agent --version
niuma-agent doctor
```

`doctor` reports the installation, detected runtimes and daemon status. Detecting
a runtime does not verify its provider login. The daemon can be stopped at this
point; start it next.

## Step 1: Start the Daemon

```bash
niuma-agent daemon start
niuma-agent daemon status
```

`daemon start` reuses an already-running compatible daemon. Commands such as
`attach`, `actor` and `send` need the daemon to be running.

## Step 2: Create a Working Group

```bash
cd /path/to/your/project
niuma-agent attach .
```

This creates a new Group, binds the current directory as its project workspace
(a "scope"), and selects it as the active Group. The output includes its
`group_id`. To return to an existing Group, use `niuma-agent groups` and
`niuma-agent use <group_id>`; running `niuma-agent attach .` again creates another Group.

In 牛马Agent, a Group member running or connected to an agent runtime is called an agent. The CLI keeps the command name
`niuma-agent actor` and fields such as `actor_id` for that same member.

## Step 3: Add Your First Agent

```bash
niuma-agent actor add assistant --runtime claude
```

The first non-internal agent in the Group's member list is the "foreman"
(coordinator). Disabling that agent does not automatically promote another.

牛马Agent injects the 牛马Agent MCP integration when it starts this Claude Code session;
no separate `niuma-agent setup` step is needed for this example. Other runtimes may
require setup. See [Supported Runtimes](../runtimes) and
[`niuma-agent setup`](/reference/cli#niuma-setup) for their integration requirements.

## Step 4: Start the Agent

```bash
niuma-agent group start
```

`group start` starts the Group's enabled agents. To start just one agent, use:

```bash
niuma-agent actor start assistant
```

Check `niuma-agent actor list` for agent state. If startup requires an interactive
prompt, use the agent's terminal in the [Web UI](#start-web-ui-optional).

## Step 5: Send a Message

```bash
niuma-agent send "Hello! Please introduce yourself." --to assistant
```

## Step 6: View Responses

Follow the Group's recorded messages and other events as JSON:

```bash
niuma-agent tail -f
```

Look for the agent's `chat.message` events. Its native terminal output is
available in the Web UI. Press **Ctrl+C** to stop following; this leaves the
agents running.

`niuma-agent inbox` serves a different purpose: it reads and **consumes** an agent's
unread Mail, marking that batch as read. Use `tail` or Web chat to view responses.

## Adding More Agents

Once Codex is installed and signed in, add a second agent:

```bash
niuma-agent actor add reviewer --runtime codex
niuma-agent actor start reviewer
```

Send to specific agents:

```bash
niuma-agent send "Please implement the feature" --to assistant
niuma-agent send "Please review the code" --to reviewer
niuma-agent send "Please coordinate the next step" --to "@foreman"
niuma-agent send "Team-wide constraint: pause deploys until CI is green" --to "@all"
```

Use task-backed delegation when the work should survive chat context switches and needs an owner, outcome, or completion evidence:

```bash
niuma-agent tracked-send "Please implement the feature and reply with validation evidence." \
  --to assistant \
  --title "Implement feature" \
  --outcome "Feature is implemented and validation evidence is reported"
```

The multiline example uses Bash line continuations. In PowerShell, enter it on
one line.

## Reply to Messages

Replace `<event_id>` with the `id` of the message you want to answer from `tail`:

```bash
niuma-agent reply <event_id> "Thanks, that looks good!"
niuma-agent reply <event_id> "Non-urgent follow-up" --to assistant --mode mail
```

Mail is for agent recipients and does not prompt them immediately.

## Selecting a Group and Sender

Commands that accept `--group` resolve it in this order: the explicit option,
the `NIUMA_GROUP_ID` environment variable, then the active Group selected by
`attach` or `niuma-agent use`. Changing directories alone does not switch Groups.
Messaging uses `--by`, then `NIUMA_ACTOR_ID`, then `user`. An agent therefore
keeps its own Group when another session changes the active Group.

## Common Commands

For other instances, use `niuma-agent connect` to discover accessible Groups, then
`niuma-agent send --dst-instance ... --dst-group ...`. Reply with the incoming local
Event ID. See [Agent collaboration](../connect.md#agent-collaboration) for the
complete discovery, send and reply flow, including Direct connections.

### Group Management

```bash
niuma-agent groups              # List all groups
niuma-agent use <group_id>      # Switch group
niuma-agent active              # Show active group
niuma-agent group show <group_id> # Show group metadata
niuma-agent group start         # Start this Group's enabled agents
niuma-agent group stop          # Stop this Group's agents; keep history
```

### Agent Management {#actor-management}

```bash
niuma-agent actor list                    # List agents
niuma-agent actor add <id> --runtime <r>  # Add agent
niuma-agent actor start <id>              # Start agent
niuma-agent actor stop <id>               # Stop agent
niuma-agent actor restart <id>            # Restart agent
niuma-agent actor remove <id>             # Remove agent
```

### Messaging

```bash
niuma-agent send "message"                # No --to: default recipient policy applies (default: foreman)
niuma-agent send "msg" --to assistant     # To specific agent
niuma-agent send "msg" --to "@foreman"      # Ask the coordinator
niuma-agent send "msg" --to "@all"          # Explicit broadcast, not default task dispatch
niuma-agent tracked-send "work" --to assistant --title "Task title" --outcome "Done criterion"
niuma-agent reply <event_id> "response"   # Reply to message
niuma-agent inbox --actor-id assistant    # Read and consume an agent's unread Mail
niuma-agent tail -n 50                    # Recent events
niuma-agent tail -f                       # Follow events
```

### Daemon Control

```bash
niuma-agent daemon status    # Check status
niuma-agent daemon start     # Start daemon
niuma-agent daemon stop      # Stop daemon and its managed processes across Groups
```

## Start Web UI (Optional)

In another terminal, start the Web UI:

```bash
niuma-agent web
```

`niuma-agent` with no subcommand starts the same services; in an interactive terminal
it also opens a status panel for this launch, and `niuma-agent --headless` is identical
to `niuma-agent web`. Both reuse the daemon if it is already running, or start it if
needed. Open http://127.0.0.1:8848/ with the
default settings; if you configured a different binding, use the address shown
at startup. Use `niuma-agent web --port 9000` to choose another port.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NIUMA_HOME` | `~/.niuma-agent` | Runtime directory |
| `NIUMA_WEB_PORT` | `8848` | Web UI port when no saved binding or `--port` takes precedence |

Use the same `NIUMA_HOME` for commands that should share Groups and runtime
state. See the [CLI reference](/reference/cli#environment-variables) for all Web
binding options and their precedence.

## Stop Working

After exiting `tail -f` with **Ctrl+C**, stop the current Group's agents:

```bash
niuma-agent group stop
```

The Group and its recorded history remain available. `niuma-agent group start` starts
its agents again. Use `niuma-agent daemon stop` when you want to stop the whole instance,
including managed processes in other Groups.

## Troubleshooting

### Daemon not starting?

```bash
niuma-agent daemon status
niuma-agent doctor
```

If the daemon is stopped, run `niuma-agent daemon start`. If it is unresponsive, inspect
the reported error before deliberately stopping and restarting it; a daemon
restart interrupts managed processes across Groups.

### Agent not responding?

```bash
# Check agent status
niuma-agent actor list

# Inspect recorded errors and messages
niuma-agent tail -n 50
```

Inspect the agent's terminal in the Web UI for login, trust or approval prompts.
Check its [runtime integration](../runtimes). After fixing the cause, retry with
`niuma-agent actor start <actor_id>` or deliberately restart it with
`niuma-agent actor restart <actor_id>`.

### Can't find my group?

```bash
# List all groups
niuma-agent groups

# Select an existing Group
niuma-agent use <group_id>
niuma-agent active
```

Confirm that this terminal uses the expected `NIUMA_HOME`. Use `attach` when you
intend to create a new Group or explicitly attach a scope to an existing one.

## Next Steps

- [Workflows](/guide/workflows) - Learn collaboration patterns
- [CLI Reference](/reference/cli) - Complete command reference
- [IM Bridge](/guide/im-bridge/) - Set up mobile access
