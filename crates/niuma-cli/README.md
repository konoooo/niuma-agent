# 牛马Agent 命令行

`niuma-agent` 提供工作组管理、运行状态、Web 界面和 MCP 工具。

请按[源码安装说明](../../README.md#从源码启动)构建。在仓库根目录可运行以下命令检查版本和命令行测试。

```bash
cargo run --locked --features standalone -p niuma-agent --bin niuma-agent -- --version
cargo test --locked --features standalone -p niuma-agent
```

数据目录默认是 `~/.niuma-agent`，可通过 `NIUMA_HOME` 指定。

许可证见 [Apache-2.0](../../LICENSE)。
