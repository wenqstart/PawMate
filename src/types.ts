export interface Pet {
  id: string;
  name: string;
  type: "dog" | "cat" | "other";
  breed: string;
  gender: "male" | "female";
  age: number;
  birthday: string;
  avatar: string;
  photos?: string[];  // 宠物照片数组，最多5张
  personality: string[];
  owner: string;
  bio: string;
  lookingFor: string;
}

// 配对请求
export interface MatchRequest {
  id: string;
  targetPet: Pet;           // 被喜欢的宠物（包含主人信息）
  sourcePet: Pet;            // 发起方宠物
  sourceMessage: string;     // 打招呼消息
  status: 'pending' | 'matched' | 'rejected';
  createdAt: string;
}

// 已匹配的配对
export interface Match {
  id: string;
  petA: Pet;                 // 配对中的第一只宠物
  petB: Pet;                 // 配对中的第二只宠物
  matchedAt: string;
}

// 聊天消息
export interface Message {
  id: string;
  matchId: string;
  senderId: string;           // 宠物 ID
  senderName: string;
  content: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  petId: string;
  category: "food" | "medical" | "toys" | "grooming" | "other";
  amount: number;
  description: string;
  date: string;
}

export interface Anniversary {
  id: string;
  petId: string;
  title: string;
  date: string;
  type: "birthday" | "adoption" | "custom";
  notes?: string;
}
