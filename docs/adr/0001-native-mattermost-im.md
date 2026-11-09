# Native Mattermost IM Connector

Status: accepted. The [current specification](../specs/mattermost-im.md) defines the implementation scope.

Mattermost uses 牛马Agent's existing IM configuration, lifecycle, chat authorization and message semantics. It builds and ships with 牛马Agent under Apache-2.0. A separate HTTP/SSE service would require another setup flow and would not directly reuse these internal components.

The connector follows the existing source layout and Web design, with only the shared changes needed to support equivalent user capabilities. It does not introduce meeting orchestration, cross-Group routing through a shared Bot, a plugin system or another CLI scheduler.

This scope decision dates to September 7, 2026, when general platform integration was separated from deployment-specific business features. Those earlier feature requests are not prerequisites for the native connector. The implementation was contributed through [PR #103](https://github.com/konoooo/niuma-agent/pull/103).
