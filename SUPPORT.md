# Support

## Before You Ask

Most questions are answered by these resources:

| Resource | What it covers |
|----------|---------------|
| `niuma-agent doctor` | Environment check — verifies the installation, runtimes, and daemon status |
| `niuma-agent --help` | Complete CLI command reference |
| [Online docs](https://github.com/konoooo/niuma-agent/tree/main/docs/) | Getting started, use cases, operations runbook, architecture |
| [FAQ](https://github.com/konoooo/niuma-agent/tree/main/docs/guide/faq) | Common questions and troubleshooting |

## Bug Reports

Open a [GitHub Issue](https://github.com/konoooo/niuma-agent/issues) and include:

- **Version**: output of `niuma-agent version`
- **OS and 牛马Agent version**: e.g., macOS 14.2 and the output of `niuma-agent version`
- **Runtime**: which agent runtime(s) you're using (claude, codex, etc.)
- **Exact command**: the full command you ran
- **Actual output**: copy-paste the error or unexpected behavior
- **Expected behavior**: what you expected to happen
- **Reproduction steps**: minimal steps to trigger the issue

If the issue involves the daemon, include relevant lines from `~/.niuma-agent/daemon/niumad.log`.

For a source build, include **Settings → This instance → Developer → Copy build
information**. It identifies the running Web/daemon source and served/loaded Web
entries even when product version numbers match; it does not include credentials
or local paths. `niuma-agent doctor` also reports the CLI and daemon build identities and
installation paths. Check those paths before sharing its full output publicly.
The source fingerprint is diagnostic metadata, not a binary checksum or a protocol
compatibility check. Different source builds never trigger an automatic restart.
Web asset diagnostics follow the resources actually served: embedded assets in
release builds, current disk assets in debug/source-run builds. A frontend-only
rebuild can therefore change the Web bundle identity without changing the Rust
source identity; temporarily unavailable assets show no identity.

For a Codex Voice startup failure, include the `[niuma-agent] Codex Voice start failed`
line from the terminal that launched 牛马Agent, or the failed
`POST /api/v1/codex_voice/calls` response's `error.code` and `error.details`.
These contain the failure stage, total startup duration and, when available, the
upstream HTTP status or OS error number. Do not share the request body, authentication
files or tokens. Analyst startup and Realtime Voice login/network failures are
reported separately; a successful Analyst is retained if Realtime startup fails.

For a Voice connection lost after startup, include the
`[niuma-agent] Managed Codex disconnected` and `[niuma-agent] Codex Voice control ended`
records from the launch terminal, plus the browser console's Voice connection records. These identify
which connection ended first, its lifetime and close code, and the managed
process state observed before cleanup. An exited process may include an exit
code; a running process at observation time is not proof that it stayed healthy.
Browser records include page visibility and WebRTC state. Do not include raw
provider responses, transcripts, credentials or browser close-reason text.
A generic control-connection error does not establish that the Analyst is still
available; check the Analyst status separately.

## Feature Requests

Open a [GitHub Issue](https://github.com/konoooo/niuma-agent/issues) with:

- **Problem statement**: what workflow is difficult or impossible today
- **Proposed behavior**: how you'd like it to work
- **Operational impact**: how this affects your multi-agent setup

## Security Issues

Please report security vulnerabilities privately. See [SECURITY.md](SECURITY.md) for instructions.

## Operational Notes

- 牛马Agent is **local-first**. All runtime state lives under `NIUMA_HOME` (default `~/.niuma-agent/`), not in your repository.
- The daemon is the single source of truth. If something looks wrong, check `niuma-agent daemon status` first.
- For recovery procedures, see the [Operations Runbook](https://github.com/konoooo/niuma-agent/tree/main/docs/guide/operations).
