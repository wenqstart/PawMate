# 宠物相亲模块 - Firebase 云端方案设计

**版本**：1.0  
**日期**：2026-04-05  
**状态**：已批准

---

## 1. 技术栈

- **前端**：React Native (Expo)
- **后端服务**：Firebase
  - Firebase Authentication（手机号验证码登录）
  - Firestore（用户、宠物、配对数据存储）
  - Realtime Database（实时聊天）
  - Cloud Storage（宠物照片存储）

---

## 2. 核心功能

### 2.1 用户认证
- 手机号验证码登录/注册
- 首次注册引导完善用户资料（头像、昵称）
- 登录状态持久化

### 2.2 宠物资料管理
- 添加宠物（照片、品种、性别、生日、性格、简介、期望对象）
- 编辑宠物资料
- 删除宠物
- 支持多宠物（一个用户可添加多只宠物）

### 2.3 浏览与匹配
- 滑动卡片浏览其他用户的宠物
- 左滑跳过，右滑喜欢
- 双方互相喜欢时触发配对成功
- 配对列表展示已匹配的用户/宠物

### 2.4 即时通讯
- 配对成功后进入聊天界面
- 实时消息收发
- 消息历史保存

---

## 3. 数据模型

### 3.1 Users 集合
```
users/{uid}
{
  phoneNumber: string,
  nickname: string,
  avatar: string,          // Firebase Storage URL
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3.2 Pets 集合
```
users/{uid}/pets/{petId}
{
  name: string,
  type: "dog" | "cat" | "other",
  breed: string,
  gender: "male" | "female",
  birthday: string,        // ISO date
  photos: string[],        // Storage URLs, max 5
  personality: string[],
  bio: string,
  lookingFor: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3.3 Matches 集合
```
matches/{matchId}
{
  users: [uidA, uidB],     // 双方用户 ID
  pets: [petIdA, petIdB],  // 配对的宠物 ID
  status: "matched" | "unmatched",
  createdAt: timestamp
}
```

### 3.4 Messages 集合（Realtime Database）
```
matches/{matchId}/messages/{messageId}
{
  senderId: uid,
  content: string,
  timestamp: number
}
```

---

## 4. UI/UX 设计方向

### 4.1 登录流程
- 首次打开 → 手机号输入 → 验证码输入 → 完善资料 → 进入首页

### 4.2 主界面 Tab
- **首页**：展示推荐宠物卡片（排除自己的宠物）
- **配对**：已配对列表，点击进入聊天
- **我的**：用户资料 + 宠物管理

### 4.3 卡片交互
- 滑动卡片展示宠物照片、信息
- 右滑喜欢，左滑跳过
- 配对成功时弹出提示

### 4.4 聊天界面
- 顶部显示配对的宠物信息
- 消息气泡左右对齐
- 输入框 + 发送按钮

---

## 5. 实现优先级

1. **Phase 1**：Firebase 项目配置 + Authentication
2. **Phase 2**：用户资料 CRUD + 宠物管理
3. **Phase 3**：宠物浏览卡片 + 匹配逻辑
4. **Phase 4**：配对列表 + 聊天功能
5. **Phase 5**：优化与测试

---

## 6. 后续升级（C 方案）

添加 Node.js 中间层：
- 业务逻辑后端化
- 复杂验证逻辑
- 推送通知服务
- WebSocket 聊天服务器