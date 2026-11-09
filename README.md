# 牛马Agent · niuma-agent

把 AI 研发团队变成看得见的办公室：任务、沟通、等待与交接，都有真实状态可查。

本项目基于 [CCCC](https://github.com/ChesterRa/cccc) 扩展，集成 [PixOffice](https://github.com/workbzw/pixoffice) 场景运行时。项目命令为 `niuma-agent`，成员工具使用 `niuma_` 前缀。

## 已实现的功能

- **消息与办公室动画并排**：保留群聊，在办公室中观察成员的真实工作状态与互动，配套完整场景素材。
- **团队任务黑板**：显示进行中、等待/受阻和后续计划摘要，点击展开完整任务、筛选、分页与详情。
- **临时离岗与召回**：项目经理安排交接，接手成员确认后转移任务；召回保留身份与历史，先同步进展。
- **成员模型设置**：为 Codex / Claude 成员配置模型与思考强度，支持保存与保留会话的重启应用。
- **上班 / 下班**：下班二次确认；上班优先恢复会话，明确恢复失败时用新会话接续可读取的工作摘要。
- **等待用户处理**：动画和群聊展示真实待答复状态，提供对应的输入入口。
- **消息朗读**：支持基于已有 Codex 语音能力的朗读入口，使用者需具备相应本机登录与服务能力。
- **中文输入习惯**：Enter 提交，⌘/Ctrl + Enter 换行，保留输入法组合状态处理。

## 从源码启动

需要 Rust 1.88+、Node.js 24+；Codex、Claude 等成员运行时需使用者自行安装并登录。

```bash
git clone https://github.com/konoooo/niuma-agent.git
cd niuma-agent
npm ci --prefix web
cargo build --release --locked -p niuma-agent --bin niuma-agent
./target/release/niuma-agent --headless
```

打开终端输出的本机访问链接，默认 Web 地址为 `http://127.0.0.1:8848/ui/`。运行数据由 `NIUMA_HOME` 控制，默认存储在 `~/.niuma-agent`。

## 迁移旧数据

先停止旧服务，再在项目根目录运行以下命令。迁移脚本需要 Python 3 和 PyYAML。

```bash
python3 scripts/migrate_home.py --from ~/.cccc --to ~/.niuma-agent
```

迁移会保留聊天记录、任务和原会话凭据，更新本地注册表、提示词与应用环境变量。目标目录需要尚未创建。

## 办公室图片与角色素材

仓库已包含办公室背景、角色图片、资源校验清单和第三方软件声明，克隆后可直接构建完整场景。项目维护者已确认这些配套图片可以公开分发；素材来源与代码许可证分别保留，详见 [素材说明](docs/ASSETS.md)。

可直接检查仓库内的素材；如需从另一个已授权的兼容素材包重新导入：

```bash
python3 scripts/import_pixoffice_assets.py --from /path/to/authorized/pixoffice-assets
python3 scripts/import_pixoffice_assets.py --check
# 将新导入的素材打包到 Web 页面和本机程序，再重新启动
npm -C web run build
cargo build --release --locked -p niuma-agent --bin niuma-agent
```

导入目录应包含 `assets/` 与 `characters/`，与 `resources/pixoffice-assets.json` 对应。导入脚本先校验文件及 SHA-256，再复制到 Web 资源目录。导入其他素材后需重新构建并重启程序。

## 开发与验证

```bash
npm -C web run check
npm -C web test
cargo test -p niuma-agent-daemon --lib group_recovery
```

当前工作版本已完成前端 639 个文件、4,750 项测试，以及相关后端 70 项回归。该记录对应导入的本地代码快照，不代表完整 Rust 套件或所有运行环境均已通过；详见 [验证范围](docs/VALIDATION.md)。

## 来源、修改与许可

- CCCC 基准提交：`fa868a36`，保留 Apache-2.0 许可证及原有来源说明。
- PixOffice 场景软件保留各包的 MIT 许可证与第三方声明；代码许可不替代图片素材授权。
- 本分支的功能扩展与文件范围见 [MODIFICATIONS.md](MODIFICATIONS.md)。
- 上游许可、来源与原始说明保存在仓库中。

参见 [LICENSE](LICENSE)、[NOTICE](NOTICE)、[CCCC 原始说明](README.CCCC.md) 和 [Web 使用说明](docs/guide/web-ui.md)。
