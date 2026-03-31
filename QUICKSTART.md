# 🐾 PawMate React Native - 快速开始指南

## 🎯 5分钟启动应用

### 步骤 1: 安装依赖

```bash
cd react-native-pet-app
npm install
```

### 步骤 2: 启动开发服务器

```bash
npm start
```

### 步骤 3: 运行应用

打开 Expo Go App（手机）或按以下键：

- 按 `i` - 在iOS模拟器中打开
- 按 `a` - 在Android模拟器中打开
- 按 `w` - 在Web浏览器中打开
- 扫描二维码 - 在手机Expo Go中打开

## 📱 在真机上运行

### iOS (需要Mac)
1. 在App Store下载 **Expo Go**
2. 运行 `npm start`
3. 用iPhone相机扫描终端中的二维码

### Android
1. 在Play Store下载 **Expo Go**
2. 运行 `npm start`
3. 在Expo Go中扫描二维码

## 🔧 常用命令

```bash
# 开发
npm start              # 启动开发服务器
npm start -- --clear   # 清除缓存启动

# 运行
npm run ios           # iOS模拟器
npm run android       # Android模拟器
npm run web           # Web浏览器

# 构建
expo build:ios        # 构建iOS应用
expo build:android    # 构建Android应用
```

## 📦 必需工具

- **Node.js 14+**: https://nodejs.org/
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go App**: 手机应用商店搜索

## 🎨 主要特性预览

1. **首页** - 查看所有宠物和快捷操作
2. **相亲** - 滑动浏览匹配宠物
3. **记账** - 记录和统计宠物开支
4. **纪念日** - 管理重要日期和倒计时

## 💡 提示

- 首次启动会自动加载示例数据
- 所有数据保存在本地（AsyncStorage）
- 支持添加多只宠物
- 橙白色暖色调主题

## ❓ 遇到问题？

### Metro Bundler无法启动
```bash
npm start -- --clear
```

### 依赖安装失败
```bash
rm -rf node_modules
npm install
```

### 模拟器连接问题
- 确保已安装Xcode（iOS）或Android Studio
- 检查模拟器是否正在运行

## 📚 更多信息

查看完整文档: [README.md](./README.md)

---

**开始享受你的宠物管理之旅！** 🐶🐱💕
