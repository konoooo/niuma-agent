# Rust 客户端

`niuma-agent-client` 的源码在 [crates/niuma-client](../../crates/niuma-client)。用 Cargo 路径依赖将其加入项目，连接已经启动的服务。

```toml
[dependencies]
niuma-agent-client = { path = "../niuma-agent/crates/niuma-client" }
```

本地数据和 IPC 地址由 `NIUMA_HOME` 决定。消息格式与操作名称见 [IPC 协议](../standards/NIUMA_DAEMON_IPC_V1.md)。
