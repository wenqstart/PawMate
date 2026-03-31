# 宠物相亲页面优化设计方案

## 概述

优化宠物相亲页面，添加照片轮播、双向匹配和聊天功能。

---

## 1. 照片轮播

### 功能描述
- 每只宠物支持 1-5 张照片
- 卡片顶部左右滑动切换图片
- 底部圆点指示当前位置

### 数据结构扩展
```typescript
interface Pet {
  // ... 现有字段
  photos: string[];  // 图片 URL 数组，最多 5 张
}
```

---

## 2. 配对流程

### 流程设计
1. 用户 A 看到用户 B 的宠物，点击喜欢
2. 选择：
   - 自家哪只宠物参与相亲
   - 预设打招呼消息
3. 发送配对请求
4. 用户 B 收到配对请求通知
5. 用户 B 点击喜欢用户 A 的宠物 → 双向匹配成功
6. 双方进入聊天页面

### 数据结构
```typescript
interface MatchRequest {
  id: string;
  targetPet: Pet;           // 被喜欢的宠物（包含主人信息）
  sourcePet: Pet;            // 发起方宠物
  sourceMessage: string;     // 打招呼消息
  status: 'pending' | 'matched' | 'rejected';
  createdAt: string;
}

interface Match {
  id: string;
  petA: Pet;                 // 用户 A 的宠物
  petB: Pet;                 // 用户 B 的宠物
  matchedAt: string;
}
```

### 存储设计
- `MatchRequest`: 存储收到的配对请求
- `Match`: 存储已匹配成功的配对
- 使用 AsyncStorage 本地存储

---

## 3. 打招呼消息（预设）

### 预设消息列表
1. "你好呀！想认识一下"
2. "我家XX想和你们家XX交个朋友"
3. "看起来很有缘分哦～"
4. 自定义消息（可选）

---

## 4. 聊天功能

### 聊天页面
- 匹配成功后进入
- 显示双方宠物信息（头像、名字、品种）
- 消息列表展示对话
- 输入框发送文字消息

### 数据结构
```typescript
interface Message {
  id: string;
  matchId: string;
  senderId: string;           // 宠物 ID
  senderName: string;
  content: string;
  createdAt: string;
}
```

---

## 5. 页面设计

### 页面结构
1. **DatingScreen** - 宠物卡片展示（现有优化）
2. **MatchRequestsScreen** - 配对请求列表（喜欢我的）
3. **MatchesScreen** - 已匹配列表
4. **ChatScreen** - 聊天页面

### 导航入口
- 底部 Tab 保留
- 点击爱心后弹出选择面板：
  - 选择自家宠物
  - 选择打招呼消息
  - 确认发送

---

## 6. 实现优先级

1. **P0**: Pet 类型添加 photos 字段
2. **P0**: 照片轮播组件
3. **P0**: 配对请求数据结构和存储
4. **P0**: 打招呼消息选择面板
5. **P1**: 配对请求列表页面
6. **P1**: 双向匹配逻辑
7. **P2**: 聊天页面和消息发送
