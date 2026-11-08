# PixOffice 场景依赖

这里保留 PixOffice 提交 `4681179` 构建出的办公室运行包，供 CCCC 动画视图使用。上游仓库：<https://github.com/workbzw/pixoffice>。

各包的 `lib/` 由上游 TypeScript 构建结果生成，保留各自的 MIT 许可文件；对应的办公室和人物素材位于 `web/public/pixoffice/`。

本地调整：`scene-office/lib/core/pack.js` 只在收到真实的 `reply` 时播放接收方回复；空白板提示改为引导查看成员状态，避免将演示数据当作真实状态。
