# 📚 PawMate React Native App - 文档索引

欢迎来到PawMateReact Native应用的完整文档！

## 🚀 快速导航

### 新手入门
1. **[快速开始](./QUICKSTART.md)** ⭐
   - 5分钟快速启动应用
   - 安装步骤和常用命令
   - 在真机上运行

2. **[完整README](./README.md)**
   - 完整的项目介绍
   - 详细的功能说明
   - 技术栈和架构

### 开发文档
3. **[项目总览](./PROJECT_OVERVIEW.md)**
   - 文件结构详解
   - 核心功能说明
   - 数据模型和API
   - 开发技巧和最佳实践

4. **[Web vs RN 对比](./WEB_VS_RN_COMPARISON.md)**
   - 功能对比表
   - 技术栈差异
   - 组件映射
   - 迁移指南

## 📂 项目文件

### 核心文件
- `App.tsx` - 应用入口
- `package.json` - 依赖配置
- `app.json` - Expo配置
- `tsconfig.json` - TypeScript配置

### 源代码
```
src/
├── screens/      # 6个主要页面
├── data/         # 示例数据
├── utils/        # 工具函数（存储）
├── types.ts      # 类型定义
└── theme.ts      # 主题配置
```

## 🎯 功能清单

- ✅ 首页展示
- ✅ 宠物相亲（滑动匹配）
- ✅ 记账功能（分类统计）
- ✅ 纪念日管理（倒计时）
- ✅ 添加宠物
- ✅ 多宠物管理
- ✅ 本地数据持久化
- ⚠️ 宠物详情（简化版）

## 🎨 设计主题

**橙白色暖色调** 🧡

- 主色：#FF8C42
- 辅助色：#FFC857
- 背景：#FFF9F5

## 🛠️ 技术栈

- React Native 0.74.5
- Expo ~51.0.0
- TypeScript 5.1.3
- React Navigation 6.x
- AsyncStorage 1.23.0
- Expo Linear Gradient 13.0.2

## 📱 支持平台

- ✅ iOS
- ✅ Android
- ⚠️ Web（预览）

## 🚀 快速命令

```bash
# 开发
npm start              # 启动Expo
npm run ios            # iOS模拟器
npm run android        # Android模拟器

# 构建
expo build:ios         # 构建iOS
expo build:android     # 构建Android
```

## 📖 推荐阅读顺序

### 初次使用
1. [快速开始](./QUICKSTART.md) - 先让应用跑起来
2. [README](./README.md) - 了解项目全貌
3. [项目总览](./PROJECT_OVERVIEW.md) - 深入理解架构

### 从Web版迁移
1. [Web vs RN 对比](./WEB_VS_RN_COMPARISON.md) - 了解差异
2. [项目总览](./PROJECT_OVERVIEW.md) - 熟悉新架构
3. 查看具体代码实现

### 开发新功能
1. [项目总览](./PROJECT_OVERVIEW.md) - 了解现有结构
2. 参考现有页面实现
3. 使用主题系统保持一致性

## 🔗 重要链接

- **Expo文档**: https://docs.expo.dev
- **React Native文档**: https://reactnative.dev
- **React Navigation**: https://reactnavigation.org
- **TypeScript**: https://www.typescriptlang.org

## 💡 提示

- 所有页面使用统一的主题配置（`theme.ts`）
- 数据存储封装在 `utils/storage.ts`
- 类型定义在 `types.ts` 中
- 示例数据在 `data/mockData.ts`

## ❓ 常见问题

### Q: 如何更改主题颜色？
A: 修改 `src/theme.ts` 中的 `COLORS` 配置

### Q: 如何添加新页面？
A: 
1. 在 `src/screens/` 创建新组件
2. 在 `App.tsx` 添加路由
3. 更新导航配置

### Q: 数据存储在哪里？
A: AsyncStorage（本地存储），键名定义在 `utils/storage.ts`

### Q: 如何调试？
A: 
- 使用 `console.log` 查看日志
- Expo中按 `d` 打开开发者菜单
- 使用 React DevTools

## 📞 获取帮助

- 查看文档
- 搜索Issue
- 提交新Issue
- 查看源代码注释

---

**Happy Coding! 🐶🐱💕**
