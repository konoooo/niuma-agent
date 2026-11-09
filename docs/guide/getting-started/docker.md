# Docker Deployment

Run 牛马Agent in a Docker container — ideal for servers, teams, and reproducible environments.

The default `docker/Dockerfile` and `docker/docker-compose.yml` build the same
Rust-only product exposed by the website installer and native pip wheel. There
is no parallel Python image or engine selector.

## AI-Assisted Deployment

Copy the prompt below and paste it to any AI assistant — it will guide you through the entire deployment interactively.

::: details Click to copy AI deployment prompt

```text
You are a deployment assistant for 牛马Agent (Multi-Agent Collaboration Kernel).
Guide the user step-by-step through Docker deployment. Ask questions interactively, don't dump all steps at once.

## What you're deploying
牛马Agent is a multi-agent collaboration hub. The Docker image includes the native
牛马Agent executable, Node.js 24, and pre-installed AI agent CLIs (Claude Code,
Codex CLI, Factory CLI).

## Step 1: Get the source code
Ask: "Do you already have the 牛马Agent repo cloned? If yes, what's the path?"
If no:
  git clone https://github.com/konoooo/niuma-agent && cd niuma-agent

## Step 2: Build the image
  docker build -f docker/Dockerfile -t niuma-agent .
Note: multi-stage build — first compiles Web UI (Node.js), then the native Rust product.
If build fails, check: Docker version >= 20.10, sufficient disk space, network access to npm/crates.io.

## Step 3: Collect user config
Ask each one individually:
1. "What port do you want the Web UI on? (default: 8848)"
2. "Where are your project files? (absolute path, will be mounted to /workspace)"
3. "Which AI providers will you use, and which environment variable names will you configure?"
4. "Will this stay localhost-only until you create an Admin Access Token in Web Access?"
Do not ask the user to paste credentials into this conversation. Have them set
and export the needed variables privately in their own shell.

## Step 4: Run the container
Build the docker run command from the user's answers:
  docker run -d \
    -p 127.0.0.1:{port}:8848 \
    -v niuma-data:/data \
    -v {project_path}:/workspace \
    -e {API_KEY_ENV} \
    --name niuma-agent \
    niuma-agent
Replace {API_KEY_ENV} with a configured variable name, such as
ANTHROPIC_AUTH_TOKEN, and repeat -e for each variable needed. Do not include
credential values in the command.

## Step 5: Verify
Run these and report results:
  docker logs niuma-agent
  docker exec niuma-agent niuma-agent doctor

## Troubleshooting knowledge (use when relevant, don't preemptively dump):
- "cannot be used with root/sudo privileges": The Dockerfile uses a non-root `niuma-agent` user. Ensure using the latest Dockerfile.
- Volume permission errors after upgrading: `docker run --rm -v niuma-data:/data python:3.14-slim chown -R 1000:1000 /data`
- Claude CLI onboarding already pre-configured via: `{"hasCompletedOnboarding":true}` in /home/niuma-agent/.claude.json
- Custom Claude CLI config: `docker exec niuma-agent sh -c 'cat > /home/niuma-agent/.claude.json << EOF\n{your json}\nEOF'`
- Check runtime CLIs: `docker exec niuma-agent claude --version` / `codex --version`

## Optional: Docker Compose
If user prefers Compose, point them to the bundled docker/docker-compose.yml:
  cp docker/.env.example docker/.env
  # Edit docker/.env with port, API keys, workspace path, proxy, then create an Admin Access Token in Web Access before non-local exposure.
  docker volume create niuma-data
  # From project root:
  docker compose --env-file docker/.env -f docker/docker-compose.yml up -d --build
  # Or from docker directory:
  cd docker && docker compose up -d --build

## Key environment variables reference:
| Variable | Default | Description |
|----------|---------|-------------|
| NIUMA_HOME | /data | Data directory |
| NIUMA_WEB_HOST | 0.0.0.0 | Web bind address inside the container |
| NIUMA_WEB_PORT | 8848 | Web port |
| NIUMA_DAEMON_TRANSPORT | tcp | IPC transport |
| NIUMA_DAEMON_HOST | 127.0.0.1 | Daemon bind address |
| NIUMA_DAEMON_PORT | 9765 | Daemon IPC port |
| ANTHROPIC_AUTH_TOKEN | (none) | Auth token for Claude |
| OPENAI_API_KEY | (none) | API key for Codex runtime |

## Tone: concise, practical, one step at a time. Confirm each step succeeds before moving on.
```

:::

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed (20.10+)
- At least one AI agent API key (e.g. `ANTHROPIC_AUTH_TOKEN` for Claude)

## Quick Start

### 1. Build the Image

```bash
git clone https://github.com/konoooo/niuma-agent
cd niuma-agent
docker build -f docker/Dockerfile -t niuma-agent .
```

::: tip Build Context
The build uses a multi-stage approach: first it compiles the Web UI with Node.js,
then it embeds that bundle in the native Rust executable. The final image does
not contain the 牛马Agent Python product.
:::

### 2. Run the Container

Set and export `ANTHROPIC_AUTH_TOKEN` in your shell before running this example.
Docker passes its value by name; the command need not contain the credential.

```bash
docker run -d \
  --init \
  -p 127.0.0.1:8848:8848 \
  -v niuma-data:/data \
  -v /path/to/your/projects:/workspace \
  -e ANTHROPIC_AUTH_TOKEN \
  --name niuma-agent \
  niuma-agent
```

Open `http://localhost:8848` in your browser. The sample command binds the host port to `127.0.0.1` on purpose, so you can safely create an **Admin Access Token** in **Settings > This instance > Web Access** before any broader exposure.

The image includes Chromium, the required shared libraries, and `Xvfb` for
projected browser surfaces such as NotebookLM sign-in and Presentation browser
sessions. `x11vnc` enables the VNC-backed Browser view. The container permits
the non-loopback internal listener needed for port publishing, but protected
APIs still require first-admin bootstrap; keep the host port bound to
`127.0.0.1` until an Admin Access Token exists.

### 3. Verify

```bash
# Check container is running
docker logs niuma-agent

# Health check
docker exec niuma-agent niuma-agent doctor
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NIUMA_HOME` | `/data` | Data directory (groups, ledger, config) |
| `NIUMA_WEB_HOST` | `0.0.0.0` | Web server bind address inside the container |
| `NIUMA_WEB_PORT` | `8848` | Web server port |
| `NIUMA_DAEMON_TRANSPORT` | `tcp` | Daemon IPC transport (`tcp` or `unix`) |
| `NIUMA_DAEMON_HOST` | `127.0.0.1` | Daemon bind address |
| `NIUMA_DAEMON_PORT` | `9765` | Daemon IPC port |
| `ANTHROPIC_AUTH_TOKEN` | _(none)_ | Auth token for Claude Code runtime (do not set together with `ANTHROPIC_API_KEY`) |
| `ANTHROPIC_BASE_URL` | _(none)_ | Custom API endpoint for Claude Code |
| `OPENAI_API_KEY` | _(none)_ | API key for Codex runtime |
| `OPENAI_BASE_URL` | _(none)_ | 牛马Agent compatibility entry for Codex custom endpoints. 牛马Agent maps this to Codex CLI's `openai_base_url` runtime config when launching Codex agents. |

### Volume Mounts

| Container Path | Purpose |
|---------------|---------|
| `/data` | Persistent 牛马Agent state (groups, ledger, daemon config) |
| `/workspace` | Project files for agents to work on |

::: warning Protect Your Data
Always mount `/data` to a named volume or host path to persist state across container restarts.
:::

## Advanced Usage

### Daemon IPC Stays Local

Do not publish the daemon IPC port. It has no authentication, and the daemon
rejects `NIUMA_DAEMON_HOST=0.0.0.0` and every other non-loopback address.
Remote integrations must use the authenticated Web API; container-local
diagnostics can use `docker exec`.

Projected browser sessions now default to a headed browser for better site compatibility. In server/container environments without a native display, 牛马Agent uses its own `Xvfb` display automatically. The image also includes `x11vnc` so embedded browser panels can use the VNC-backed viewer when the browser is running on that 牛马Agent-owned display, while delivery and automation still use the daemon-owned CDP session. 牛马Agent does not attach VNC to an inherited host desktop display; those sessions use the CDP screencast fallback instead. The VNC endpoint is localhost-only inside the container and is intended for trusted single-user deployments; browser access from 牛马Agent Web is proxied through the authenticated WebSocket route. If you use projected browser features heavily and see Chromium renderer crashes inside the container, add `--ipc=host` to the `docker run` command. Playwright's Docker guidance recommends a larger shared-memory budget for Chromium workloads.

### Custom Claude CLI Configuration

The container comes with Claude CLI pre-configured (onboarding skipped). To customize further:

```bash
# Write config from host
docker exec niuma-agent sh -c 'cat > /home/niuma-agent/.claude.json << EOF
{
  "hasCompletedOnboarding": true,
  "customApiKey": "your-key"
}
EOF'

# Or copy a config file in
docker cp ~/.claude.json niuma-agent:/home/niuma-agent/.claude.json
```

### Run with Docker Compose

The repo ships a ready-to-use `docker/docker-compose.yml`. First copy and edit the env file:

```bash
cp docker/.env.example docker/.env
# Edit docker/.env — set API keys, workspace path, etc. Then create an Admin Access Token in Web Access before non-local exposure.
```

Create the data volume (required on first run, as the compose file uses `external: true`):

```bash
docker volume create niuma-data
```

Then choose either way to start:

```bash
# Option A: Run from project root (recommended)
docker compose --env-file docker/.env -f docker/docker-compose.yml up -d --build

# Option B: Run from docker directory
cd docker
docker compose up -d --build
```

::: info First Run vs Update
`--build` builds the image from source. On subsequent runs, you can omit it if the image hasn't changed — `docker compose up -d` will reuse the existing image.
:::

The `.env` file controls ports, volumes, API keys, and build-time proxy. See `docker/.env.example` for all options.

The bundled Compose file already enables `init: true`, which helps reap short-lived browser helper processes cleanly.

::: tip Build Behind a Proxy
Set `HTTP_PROXY` and `HTTPS_PROXY` in `.env` to pass proxy settings during
`docker compose build`. Build-time downloads include npm packages, Rust crates,
OS packages, and the bundled agent CLIs.
:::

#### Daily Operations

```bash
# Update deployment (build + restart)
docker compose --env-file docker/.env -f docker/docker-compose.yml up -d --build

# Force full rebuild (no cache)
docker compose --env-file docker/.env -f docker/docker-compose.yml up -d --build --no-cache

# View logs
docker compose --env-file docker/.env -f docker/docker-compose.yml logs -f

# Stop
docker compose --env-file docker/.env -f docker/docker-compose.yml down
```

### K8s Sidecar Pattern

For Kubernetes deployments, the daemon defaults to `127.0.0.1:9765` — suitable for sidecar containers sharing the same Pod network namespace. No extra configuration needed for intra-Pod communication.

Security note: the Docker examples now bind host ports to `127.0.0.1` by default. Keep that local-only posture until you have created an Admin Access Token in Web Access and intentionally chosen a remote boundary.

## Troubleshooting

### "cannot be used with root/sudo privileges"

Claude CLI refuses to run with `--dangerously-skip-permissions` as root. The Dockerfile already creates a non-root `niuma-agent` user to handle this. If you see this error, make sure you're using the latest Dockerfile.

### Volume Permission Issues

If you previously ran the container as root and then switched to the non-root user, existing volume data may have root ownership:

```bash
# Fix permissions on the data volume
docker run --rm -v niuma-data:/data debian:bookworm-slim \
  chown -R 1000:1000 /data
```

### Agent CLI Not Found

The image ships with Claude Code and Codex CLI pre-installed. If a runtime isn't detected:

```bash
# Check available runtimes
docker exec niuma-agent niuma-agent doctor

# Verify CLI availability
docker exec niuma-agent claude --version
docker exec niuma-agent codex --version
```

### Container Logs

```bash
# Real-time logs
docker logs -f niuma-agent

# Last 100 lines
docker logs --tail 100 niuma-agent
```

## Pre-installed Tools

The Docker image includes:

| Tool | Purpose |
|------|---------|
| Native 牛马Agent | Daemon, Web, CLI, MCP, and runtime management |
| Node.js 24 | Agent CLI runtime (npm-based tools) |
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | Anthropic's AI coding agent |
| [Codex CLI](https://github.com/openai/codex) | OpenAI's AI coding agent |
| [Factory CLI](https://www.factory.ai/) | Factory's AI coding agent |
| Git | Version control |

## Next Steps

- [Web UI Quick Start](./web) - Configure agents through the visual interface
- [CLI Quick Start](./cli) - Manage 牛马Agent from the command line
- [Operations Runbook](/guide/operations) - Production operations guide
- [Secure Remote Access](/guide/operations#_5-secure-remote-access) - Set up Cloudflare Access or Tailscale
