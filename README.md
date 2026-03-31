# 🐾 PawMate - React Native App

一个功能完整的宠物社交与管理应用，采用React Native开发，支持iOS和Android平台。

## 📱 功能特性

### 核心功能

1. **宠物管理** 🐶🐱
   - 添加和管理多只宠物
   - 记录宠物详细信息（品种、性别、生日、性格等）
   - 自定义头像和个性标签

2. **宠物相亲** 💕
   - Tinder风格的滑动匹配界面
   - 查看其他宠物的详细资料
   - 喜欢和跳过功能
   - 匹配通知

3. **记账功能** 💰
   - 记录宠物开支（食品、医疗、玩具、美容等）
   - 分类统计和图表展示
   - 总开支和月度开支统计
   - 按日期排序的开支列表

4. **纪念日管理** 📅
   - 记录生日、领养日和自定义纪念日
   - 倒计时提醒
   - 即将到来的纪念日高亮显示
   - 备注功能

### 设计特色

- **橙白色暖色调主题** 🧡
  - 主橙色：#FF8C42
  - 金黄色辅助色：#FFC857
  - 温馨的暖白色背景
  
- **流畅的用户体验**
  - 底部标签导航
  - 平滑的页面切换动画
  - 渐变色按钮和卡片设计
  - 响应式布局

- **数据持久化**
  - 使用AsyncStorage本地存储
  - 包含示例数据可直接体验
  - 支持数据导入导出

## 🚀 快速开始

### 环境要求

- Node.js 14+
- npm 或 yarn
- Expo CLI
- iOS模拟器（macOS）或 Android模拟器

### 安装步骤

1. **克隆项目**
```bash
cd react-native-pet-app
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **启动开发服务器**
```bash
npm start
# 或
expo start
```

4. **运行应用**
```bash
# iOS
npm run ios

# Android
npm run android

# Web (预览)
npm run web
```

## 📂 项目结构

```
react-native-pet-app/
├── App.tsx                 # 主入口文件，导航配置
├── package.json            # 项目依赖
├── src/
│   ├── screens/           # 页面组件
│   │   ├── HomeScreen.tsx        # 首页
│   │   ├── DatingScreen.tsx      # 相亲页面
│   │   ├── ExpensesScreen.tsx    # 记账页面
│   │   ├── MemoriesScreen.tsx    # 纪念日页面
│   │   ├── AddPetScreen.tsx      # 添加宠物页面
│   │   └── PetDetailScreen.tsx   # 宠物详情页面
│   ├── data/
│   │   └── mockData.ts    # 模拟数据
│   ├── utils/
│   │   └── storage.ts     # AsyncStorage工具函数
│   ├── types.ts           # TypeScript类型定义
│   └── theme.ts           # 主题配置（颜色、间距等）
```

## 🎨 主题配置

应用使用橙白色暖色调主题，所有颜色定义在 `src/theme.ts` 中：

```typescript
export const COLORS = {
  primary: '#FF8C42',         // 主橙色
  primaryLight: '#FFB07C',    // 浅橙色
  primaryDark: '#FF6B1A',     // 深橙色
  secondary: '#FFC857',       // 金黄色
  background: '#FFF9F5',      // 暖白色背景
  // ...更多颜色
};
```

## 💾 数据存储

应用使用AsyncStorage进行本地数据持久化：

- **宠物数据**: `@pets`
- **开支记录**: `@expenses`
- **纪念日**: `@anniversaries`

### 存储API示例

```typescript
import { getPets, savePets, addPet } from './src/utils/storage';

// 获取所有宠物
const pets = await getPets();

// 添加新宠物
await addPet(newPet);

// 保存宠物列表
await savePets(updatedPets);
```

## 🔧 技术栈

- **框架**: React Native + Expo
- **导航**: React Navigation (Bottom Tabs + Stack)
- **状态管理**: React Hooks (useState, useEffect)
- **数据持久化**: AsyncStorage
- **UI组件**: 
  - expo-linear-gradient (渐变效果)
  - @expo/vector-icons (图标)
  - @react-native-picker/picker (选择器)
- **语言**: TypeScript

## 📱 页面说明

### 1. 首页 (HomeScreen)
- 显示欢迎横幅和统计信息
- 展示所有宠物列表
- 快捷操作入口（相亲、记账、纪念日）

### 2. 相亲页面 (DatingScreen)
- 卡片式滑动界面
- 显示宠物照片和详细信息
- 喜欢/跳过按钮
- 滑动动画效果

### 3. 记账页面 (ExpensesScreen)
- 统计卡片（总开支、本月开支、记录数）
- 分类统计图表
- 开支记录列表
- 添加开支弹窗

### 4. 纪念日页面 (MemoriesScreen)
- 即将到来的纪念日高亮卡片
- 按类型分组的纪念日列表
- 倒计时显示
- 添加纪念日功能

### 5. 添加宠物页面 (AddPetScreen)
- 完整的宠物信息表单
- 头像上传（URL输入）
- 类型和性别选择器
- 性格标签管理

## 🎯 核心组件

### 底部导航栏
```typescript
<Tab.Navigator>
  <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="Dating" component={DatingScreen} />
  <Tab.Screen name="Expenses" component={ExpensesScreen} />
  <Tab.Screen name="Memories" component={MemoriesScreen} />
</Tab.Navigator>
```

### 渐变按钮
```typescript
<LinearGradient
  colors={[COLORS.gradientStart, COLORS.gradientEnd]}
  style={styles.button}
>
  <Text>点击我</Text>
</LinearGradient>
```

## 🐛 常见问题

### 1. Metro Bundler错误
```bash
# 清除缓存
expo start -c
```

### 2. AsyncStorage问题
确保已安装正确版本：
```bash
expo install @react-native-async-storage/async-storage
```

### 3. 图标不显示
```bash
# 重新安装vector-icons
expo install @expo/vector-icons
```

## 📦 依赖包说明

### 核心依赖
- `react`: ^18.2.0
- `react-native`: 0.74.5
- `expo`: ~51.0.0

### 导航相关
- `@react-navigation/native`: 导航核心
- `@react-navigation/bottom-tabs`: 底部标签导航
- `@react-navigation/native-stack`: 堆栈导航
- `react-native-screens`: 原生屏幕优化
- `react-native-safe-area-context`: 安全区域处理

### UI组件
- `expo-linear-gradient`: 渐变效果
- `@expo/vector-icons`: 矢量图标
- `@react-native-picker/picker`: 选择器组件

### 工具库
- `@react-native-async-storage/async-storage`: 本地存储
- `react-native-gesture-handler`: 手势处理

## 🚀 构建发布

### iOS构建
```bash
expo build:ios
```

### Android构建
```bash
expo build:android
```

### 生成APK
```bash
expo build:android -t apk
```

## 🔄 从Web版本迁移对比

| 功能 | Web版本 | React Native版本 |
|------|---------|-----------------|
| 路由 | react-router | React Navigation |
| 存储 | localStorage | AsyncStorage |
| 样式 | Tailwind CSS | StyleSheet |
| 图标 | lucide-react | @expo/vector-icons |
| 渐变 | CSS gradient | expo-linear-gradient |
| 表单 | HTML input | TextInput组件 |
| 弹窗 | Dialog组件 | Modal组件 |

## 📝 待完善功能

- [ ] 宠物详情页面完整实现
- [ ] 图片上传功能（相机/相册）
- [ ] 推送通知（纪念日提醒）
- [ ] 数据云同步
- [ ] 社交分享功能
- [ ] 用户登录系统
- [ ] 聊天功能

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 📮 联系方式

如有问题或建议，欢迎联系！

---

**Made with ❤️ for Pet Lovers**
