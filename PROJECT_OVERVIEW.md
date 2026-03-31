# 🐾 PawMate React Native App - 项目总览

## 📋 项目信息

- **项目名称**: PawMate (Pet Dating App)
- **版本**: 1.0.0
- **平台**: iOS, Android
- **框架**: React Native + Expo
- **语言**: TypeScript
- **主题**: 橙白色暖色调

## 🎯 核心功能

### 1. 首页（HomeScreen）
**功能描述**: 
- 显示欢迎横幅和宠物统计
- 展示所有宠物卡片列表
- 提供快捷操作入口

**技术要点**:
- 使用LinearGradient创建渐变背景
- 宠物卡片可点击跳转详情
- AsyncStorage加载本地数据
- 空状态处理

**文件位置**: `src/screens/HomeScreen.tsx`

---

### 2. 宠物相亲（DatingScreen）
**功能描述**:
- Tinder风格的滑动匹配界面
- 显示宠物详细信息和照片
- 喜欢/跳过交互

**技术要点**:
- 使用Animated API实现卡片滑动动画
- 图片覆盖渐变层显示信息
- 状态管理当前索引
- Alert提示匹配结果

**文件位置**: `src/screens/DatingScreen.tsx`

---

### 3. 记账功能（ExpensesScreen）
**功能描述**:
- 记录宠物各类开支
- 统计总开支和月度开支
- 分类汇总展示
- 按日期排序的记录列表

**技术要点**:
- Modal底部弹窗表单
- Picker选择器组件
- 数据聚合和计算
- 实时统计更新

**文件位置**: `src/screens/ExpensesScreen.tsx`

---

### 4. 纪念日管理（MemoriesScreen）
**功能描述**:
- 记录生日、领养日等重要日期
- 倒计时显示
- 即将到来的纪念日高亮
- 按类型分组展示

**技术要点**:
- 日期计算和倒计时逻辑
- 渐变卡片高亮显示
- 分类筛选和排序
- 备注功能

**文件位置**: `src/screens/MemoriesScreen.tsx`

---

### 5. 添加宠物（AddPetScreen）
**功能描述**:
- 完整的宠物信息表单
- 头像URL输入
- 类型和性别选择
- 性格标签管理

**技术要点**:
- 复杂表单状态管理
- 动态标签添加/删除
- 表单验证
- 默认头像设置

**文件位置**: `src/screens/AddPetScreen.tsx`

---

### 6. 宠物详情（PetDetailScreen）
**功能描述**:
- 查看宠物完整信息

**状态**: 简化实现，可扩展

**文件位置**: `src/screens/PetDetailScreen.tsx`

---

## 🗂️ 文件结构详解

```
react-native-pet-app/
├── App.tsx                          # 应用入口，导航配置
├── package.json                     # 项目依赖
├── app.json                         # Expo配置
├── tsconfig.json                    # TypeScript配置
├── babel.config.js                  # Babel配置
├── .gitignore                       # Git忽略文件
│
├── src/
│   ├── screens/                     # 页面组件
│   │   ├── HomeScreen.tsx          # 首页
│   │   ├── DatingScreen.tsx        # 相亲页面
│   │   ├── ExpensesScreen.tsx      # 记账页面
│   │   ├── MemoriesScreen.tsx      # 纪念日页面
│   │   ├── AddPetScreen.tsx        # 添加宠物
│   │   └── PetDetailScreen.tsx     # 宠物详情
│   │
│   ├── data/
│   │   └── mockData.ts             # 示例数据
│   │
│   ├── utils/
│   │   └── storage.ts              # AsyncStorage封装
│   │
│   ├── types.ts                    # TypeScript类型定义
│   └── theme.ts                    # 主题配置（颜色、间距等）
│
└── docs/
    ├── README.md                    # 完整文档
    ├── QUICKSTART.md               # 快速开始指南
    └── WEB_VS_RN_COMPARISON.md     # Web版对比文档
```

---

## 🎨 主题系统（theme.ts）

### 颜色定义
```typescript
COLORS = {
  primary: '#FF8C42',       // 主橙色
  primaryLight: '#FFB07C',  // 浅橙色
  primaryDark: '#FF6B1A',   // 深橙色
  secondary: '#FFC857',     // 金黄色
  background: '#FFF9F5',    // 暖白色背景
  // ...更多
}
```

### 间距系统
```typescript
SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}
```

### 字体大小
```typescript
FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}
```

### 阴影效果
```typescript
SHADOWS = {
  sm: { shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation },
  md: { ... },
  lg: { ... },
}
```

---

## 💾 数据存储（storage.ts）

### 存储键
- `@pets` - 宠物列表
- `@expenses` - 开支记录
- `@anniversaries` - 纪念日列表

### 主要方法
```typescript
// 宠物管理
getPets(): Promise<Pet[]>
savePets(pets: Pet[]): Promise<void>
addPet(pet: Pet): Promise<void>
updatePet(id: string, updates: Partial<Pet>): Promise<void>
deletePet(id: string): Promise<void>

// 开支管理
getExpenses(): Promise<Expense[]>
saveExpenses(expenses: Expense[]): Promise<void>
addExpense(expense: Expense): Promise<void>

// 纪念日管理
getAnniversaries(): Promise<Anniversary[]>
saveAnniversaries(anniversaries: Anniversary[]): Promise<void>
addAnniversary(anniversary: Anniversary): Promise<void>
```

---

## 📊 数据模型（types.ts）

### Pet (宠物)
```typescript
interface Pet {
  id: string;              // 唯一标识
  name: string;            // 名字
  type: "dog"|"cat"|"other"; // 类型
  breed: string;           // 品种
  gender: "male"|"female"; // 性别
  age: number;             // 年龄
  birthday: string;        // 生日
  avatar: string;          // 头像URL
  personality: string[];   // 性格标签
  owner: string;           // 主人姓名
  bio: string;             // 自我介绍
  lookingFor: string;      // 期望对象
}
```

### Expense (开支)
```typescript
interface Expense {
  id: string;
  petId: string;
  category: "food"|"medical"|"toys"|"grooming"|"other";
  amount: number;
  description: string;
  date: string;
}
```

### Anniversary (纪念日)
```typescript
interface Anniversary {
  id: string;
  petId: string;
  title: string;
  date: string;
  type: "birthday"|"adoption"|"custom";
  notes?: string;
}
```

---

## 🧭 导航结构

```
App
└── NavigationContainer
    └── Stack Navigator
        ├── MainTabs (Bottom Tabs)
        │   ├── Home
        │   ├── Dating
        │   ├── Expenses
        │   └── Memories
        ├── AddPet (Modal)
        └── PetDetail (Push)
```

### 导航方法
```typescript
navigation.navigate('Home')
navigation.navigate('AddPet')
navigation.navigate('PetDetail', { petId: '1' })
navigation.goBack()
```

---

## 🎯 常用组件模式

### 渐变按钮
```tsx
<TouchableOpacity style={styles.button}>
  <LinearGradient
    colors={[COLORS.gradientStart, COLORS.gradientEnd]}
    style={styles.gradient}
  >
    <Text style={styles.text}>按钮</Text>
  </LinearGradient>
</TouchableOpacity>
```

### 卡片组件
```tsx
<View style={[styles.card, SHADOWS.sm]}>
  <Text style={styles.title}>标题</Text>
  <Text style={styles.content}>内容</Text>
</View>
```

### Modal弹窗
```tsx
<Modal
  visible={visible}
  animationType="slide"
  transparent={true}
  onRequestClose={onClose}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      {/* 内容 */}
    </View>
  </View>
</Modal>
```

---

## 🔧 开发技巧

### 1. 样式复用
```typescript
// 创建可复用的样式
const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
});
```

### 2. 状态管理
```typescript
// 使用useState管理本地状态
const [data, setData] = useState<Pet[]>([]);

// 使用useEffect加载数据
useEffect(() => {
  loadData();
}, []);
```

### 3. 异步操作
```typescript
const loadData = async () => {
  try {
    const pets = await getPets();
    setPets(pets);
  } catch (error) {
    console.error(error);
    Alert.alert('错误', '加载失败');
  }
};
```

---

## 🐛 调试技巧

### 1. 查看日志
```typescript
console.log('Debug:', data);
console.error('Error:', error);
```

### 2. React DevTools
```bash
# 安装
npm install -g react-devtools

# 运行
react-devtools
```

### 3. 网络调试
- 在Expo中点击 `d` 打开开发者菜单
- 选择"Debug Remote JS"

---

## 📦 常用依赖说明

| 依赖包 | 用途 | 文档 |
|--------|------|------|
| expo | 开发框架 | [expo.dev](https://expo.dev) |
| @react-navigation | 导航 | [reactnavigation.org](https://reactnavigation.org) |
| @react-native-async-storage | 存储 | [GitHub](https://github.com/react-native-async-storage/async-storage) |
| expo-linear-gradient | 渐变 | [Expo文档](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) |
| @expo/vector-icons | 图标 | [icons.expo.fyi](https://icons.expo.fyi) |
| @react-native-picker/picker | 选择器 | [GitHub](https://github.com/react-native-picker/picker) |

---

## ✅ 最佳实践

### 1. 性能优化
- 使用`React.memo`避免不必要的重渲染
- 图片使用合适的尺寸
- 长列表使用`FlatList`而非`map`

### 2. 用户体验
- 提供加载状态
- 错误处理和友好提示
- 防抖动按钮点击

### 3. 代码组织
- 组件职责单一
- 提取可复用逻辑
- 类型安全（TypeScript）

---

## 🚀 发布流程

### 1. 构建应用
```bash
# iOS
expo build:ios

# Android
expo build:android
```

### 2. 测试
- 真机测试
- 不同屏幕尺寸测试
- 功能完整性测试

### 3. 提交App Store
- 准备应用截图
- 编写应用描述
- 设置价格和可用性

---

## 📚 学习资源

- **React Native官方文档**: [reactnative.dev](https://reactnative.dev)
- **Expo文档**: [docs.expo.dev](https://docs.expo.dev)
- **React Navigation**: [reactnavigation.org](https://reactnavigation.org)
- **TypeScript**: [typescriptlang.org](https://www.typescriptlang.org)

---

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

---

**Made with ❤️ for Pet Lovers**
