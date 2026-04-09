---
name: packaging-and-deployment
description: 打包 Expo 项目为 Android APK 并输出到 apk 目录下
---

## Packaging and Deployment Skill

在项目根目录下执行以下命令，打包 APK 到 `apk` 目录：

```bash
mkdir -p apk && npx expo prebuild --platform android --clean && cd android && ./gradlew assembleRelease && cp app/build/outputs/apk/release/app-release.apk ../apk/PawMate-release.apk
```

### 命令说明

1. `mkdir -p apk` - 创建 apk 目录
2. `npx expo prebuild --platform android --clean` - 生成 Android 原生项目
3. `./gradlew assembleRelease` - 构建 Release 版本 APK
4. `cp .../app-release.apk ../apk/PawMate-release.apk` - 复制 APK 到 apk 目录

### 输出位置

APK 文件将生成在：`apk/PawMate-release.apk`
