# Getting Started

Get 牛马Agent running in 10 minutes.

## Choose Your Approach

牛马Agent offers two ways to get started:

<div class="vp-card-container">

### [Web UI Quick Start](./web)

**Recommended for most users**

- Visual interface for managing agents
- Point-and-click configuration
- Real-time terminal view
- Mobile-friendly

### [CLI Quick Start](./cli)

[English](./cli) · [简体中文](./cli-zh) · [日本語](./cli-ja)

**For terminal enthusiasts**

- Full control via command line
- Scriptable and automatable
- Great for CI/CD integration
- Power user features

### [Docker Deployment](./docker)

**For servers and teams**

- One-command deployment
- Pre-installed AI agent CLIs
- Persistent data with volumes
- Docker Compose and K8s ready

</div>

## Prerequisites

从源码构建需要 Rust 1.88+、Node.js 24 和 npm。运行成员需要安装并登录至少一种智能体 CLI。

- At least one AI agent CLI:
  - [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (recommended)
  - [Codex CLI](https://github.com/openai/codex)
  - [GitHub Copilot CLI](https://docs.github.com/en/copilot/reference/copilot-cli-reference)
  - [Cursor CLI](https://cursor.com/docs/cli/overview)
  - [Devin CLI](https://docs.devin.ai/ja/cli)
  - [Kiro CLI](https://kiro.dev/docs/cli/)
  - [Kilo Code CLI](https://kilo.ai/docs/code-with-ai/platforms/cli)
  - [Antigravity CLI](https://antigravity.google/docs/cli-overview)
  - [Kimi Code](https://github.com/MoonshotAI/kimi-code)
- Or a ChatGPT account with remote MCP connector support for the ChatGPT Web Model runtime
- Or a custom runtime command if you wire MCP manually

The MCP JavaScript code mode (`niuma_code_exec` / `niuma_code_wait`) additionally
requires Node.js on the 牛马Agent host. The standalone Rust build does not invoke a
Python backend.

The ChatGPT Web Model also needs a system Google Chrome or Microsoft Edge browser. On native Linux,
install `Xvfb` so 牛马Agent can keep projected browser windows off the host desktop; `x11vnc` is optional
and enables the VNC viewer instead of the built-in CDP screencast fallback:

```bash
# Debian / Ubuntu
sudo apt install xvfb x11vnc

# Fedora
sudo dnf install xorg-x11-server-Xvfb x11vnc

# Arch Linux
sudo pacman -S xorg-server-xvfb x11vnc
```

Run `niuma-agent doctor` to verify these dependencies. 牛马Agent does not install OS packages automatically.

## 从源码安装

本仓库通过源码构建分发。需要 Rust 1.88+、Node.js 24 和 npm。

```bash
git clone https://github.com/konoooo/niuma-agent.git
cd niuma-agent
npm ci --prefix web
cargo build --release --locked -p niuma-agent --bin niuma-agent
./target/release/niuma-agent --headless
```

Windows 使用 `target\release\niuma-agent.exe`。默认 Web 地址为 `http://127.0.0.1:8848/ui/`。
迁移已有数据见 [项目说明](../../../README.md#迁移旧数据)。

## Verify Installation

```bash
niuma-agent status
niuma-agent doctor
```

`status` shows the native product, daemon, groups, agents, and detected agent
runtimes. `doctor` checks the installation, agent runtimes, system
configuration, invoked 牛马Agent executable, PATH resolution, and duplicate `niuma-agent`
commands.

## Next Steps

- [Web UI Quick Start](./web) - Get started with the visual interface
- [CLI Quick Start](./cli) - Get started with the command line
- [Docker Deployment](./docker) - Deploy 牛马Agent in a Docker container
- [SDK Overview](/sdk/) - Integrate 牛马Agent into external apps/services
- [Use Cases](/guide/use-cases) - Learn high-ROI real-world patterns
- [Operations Runbook](/guide/operations) - Run 牛马Agent with operator-grade reliability
- [Positioning](/reference/positioning) - Decide where 牛马Agent should sit in your stack
