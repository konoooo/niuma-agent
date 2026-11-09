# 图片素材说明

本版本已在项目维护者确认可公开分发后，纳入办公室背景与角色素材，共 41 个文件。目录为：

- `web/public/pixoffice/assets/`
- `web/public/pixoffice/characters/`

素材来自 PixOffice 配套资源。原软件许可证、第三方软件声明与来源说明保留；软件的 Apache-2.0 / MIT 许可证不自动替代图片权利人的授权，图片未被重新标注为这些代码许可证。具体素材使用和再分发范围以原权利人的授权为准。

资源校验清单：`resources/pixoffice-assets.json`。克隆仓库后可直接构建完整动画，也可单独检查：

```bash
python3 scripts/import_pixoffice_assets.py --check
```

如需重新导入已获授权、与清单匹配的兼容素材包：

```bash
python3 scripts/import_pixoffice_assets.py --from /path/to/authorized/pixoffice-assets
python3 scripts/import_pixoffice_assets.py --check
npm -C web run build
cargo build --release --locked -p niuma-agent --bin niuma-agent
```

输入目录应直接包含 `assets/` 与 `characters/`，相对路径与校验清单相同。脚本先验证完整清单与 SHA-256，再复制资源；失败时不复制文件。脚本不从网络下载图片，也不会额外授予素材许可。
