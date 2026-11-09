# Contributor Quality Gates

以下命令可在本地验证源码、构建结果和分发包。

## Local Commands

Run the impacted gate while developing:

```bash
scripts/quality_gate.sh fast
```

It selects checks from changed files:

- Rust changes run formatting plus focused Clippy/tests for the affected crates.
- Rust integration-test changes run their owning test binary; modules under
  `tests/suite/` map to the crate's `integration` target.
- Web changes run format, lint, and TypeScript checks.
- Release scripts, repository tests, workflows, and contract documentation run
  the small Python tooling suite. This suite does not import or launch a 牛马Agent
  Python product implementation.

Local Cargo checks default to two build jobs to reduce memory pressure. Override
the bound on machines with more memory:

```bash
NIUMA_CARGO_JOBS=4 scripts/quality_gate.sh fast
```

Inspect selection without running it:

```bash
scripts/pre_commit_checks.sh --dry-run
```

The impacted gate reports elapsed time against a 120-second feedback target.
Override the reporting threshold with `NIUMA_PRECOMMIT_BUDGET_SECONDS`. A warning
does not hide a successful check.

Before handing off a broad change, run:

```bash
scripts/quality_gate.sh full
```

Full mode adds all Web tests, a production Web build, every release-tool and
repository-contract test, and the full Rust pre-commit scope.

Individual commands remain available:

```bash
npm -C web run check
npm -C web test
npm -C web run build
uvx ruff check scripts tests
uv run --no-project --with pytest --with pyyaml python -m pytest -q
```

## Web Toolchain

Install the locked Web dependencies and invoke tools through npm so they resolve
the project-local Vite+ binaries:

```bash
npm ci --prefix web
npm -C web run check
```

The native product embeds `web/dist`. `npm -C web run build` is sufficient before
rebuilding the Rust executable; `scripts/build_web.sh` and
`scripts/build_web.ps1` are convenience wrappers. `./scripts/build_package.sh`
builds both the frontend and the native archive. Restart the running 牛马Agent process
with the resulting executable to load the new embedded UI.

The Web build script tracks inputs and exports its asset directory relative to
the current Rust package. This also applies when checkouts share a Cargo target
directory. `tests/test_web_build_paths.py` runs real Cargo builds across two
checkouts, including frontend-only updates and packaged assets. For release
verification, compare the new executable's HTTP-served `/ui/index.html` and
`/ui/assets/` files with the intended `web/dist`; a successful frontend build
alone does not prove which assets the executable contains.

CI pins Node 24.19.0. `npm run check` runs Vite+ Oxfmt/Oxlint followed by the
independent TypeScript 5.9 `tsc --noEmit` check. Type-aware Vite+ checks remain
disabled until their diagnostics and supported scope match this project.

## Browser Acceptance

The repository no longer carries the Playwright fixture harness or browser-test
CI jobs. For UI changes, verify the affected flow in a real browser (prefer
ego-browser), including desktop, narrow layouts, and keyboard interaction as
appropriate. Record the observed behavior and any integration boundaries in the
handoff. Do not describe unit tests or a successful bundle build as browser
acceptance. Native Rust browser/session tests remain part of their crate tests.

## 手动验证

本仓库通过上面的本地命令验证改动。原有 GitHub 流水线已移除。

## Design Boundary

- Formatting, linting, type checks, tests, and builds validate the current tree.
- Historical migration verifiers do not become permanent product dependencies.
- File length is a review signal, not a proxy for architecture quality. Refactor
  when cohesion, ownership, testing, or change risk provides concrete evidence.
