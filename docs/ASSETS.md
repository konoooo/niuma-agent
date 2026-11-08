# 图片素材说明

PixOffice 上游 README 明确说明：软件许可与图片授权分别处理，图片素材的使用授权需另行确认。

因此本仓库默认只发布场景代码、依赖许可和 SHA-256 资源清单，不公开 `web/public/pixoffice/assets/` 和 `web/public/pixoffice/characters/`。这些目录已加入 Git 忽略规则；本机可保留已有文件，不会随普通提交上传。

如已取得对应素材包的使用权，可执行：

```bash
python3 scripts/import_pixoffice_assets.py --from /path/to/authorized/pixoffice-assets
python3 scripts/import_pixoffice_assets.py --check
# 将新导入的素材打包到 Web 页面和本机程序，再重新启动
npm -C web run build
cargo build --release --locked -p cccc --bin cccc
```

输入目录应直接包含 `assets/` 与 `characters/`，相对路径与 `resources/pixoffice-assets.json` 相同。脚本不从网络下载图片，不判断或授予素材许可；它会先验证完整清单与校验和，再导入本机目录。

对外发布素材包前，应按素材权利人的要求取得分发许可并保留来源。`LICENSE` 和软件第三方声明不替代这一步。
