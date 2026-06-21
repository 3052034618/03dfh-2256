# 应用图标资源

请在此目录下放置以下图标文件：

## Windows
- `icon.ico` - 256x256 像素的 ICO 格式图标（用于安装包和 exe）

## macOS
- `icon.icns` - ICNS 格式图标（包含 512x512@2x）

## Linux
- `icon.png` - 512x512 像素的 PNG 格式图标

## 临时图标生成方案

如果暂时没有设计好的图标，可以使用在线工具快速生成：
- https://www.electron.build/icons
- https://realfavicongenerator.net/

## 推荐规格

- 基础尺寸：512x512 像素 PNG（透明背景）
- 格式：PNG（可转换为 ICO/ICNS）
- 颜色模式：RGB + Alpha

没有图标时，electron-builder 会使用默认 Electron 图标，不影响打包和运行。
