// Internationalization / i18n support with React Context
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'zh';

export interface Translations {
  // Common
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  confirm: string;
  success: string;
  error: string;
  info: string;
  loading: string;

  // Navigation
  home: string;
  dating: string;
  community: string;
  expenses: string;
  memories: string;

  // Home Screen
  welcome: string;
  welcomeSubtitle: string;
  myPets: string;
  noPets: string;
  addFirstPet: string;
  viewAll: string;
  pets: string;
  pending: string;

  // Quick Actions
  datingAction: string;
  datingSubtitle: string;
  expensesAction: string;
  expensesSubtitle: string;
  memoriesAction: string;
  memoriesSubtitle: string;
  addPetAction: string;
  addPetSubtitle: string;

  // Dating Screen
  findCompanion: string;
  noMorePets: string;
  checkLater: string;
  personality: string;
  about: string;
  lookingFor: string;
  tapHeartToLike: string;
  like: string;
  pass: string;

  // Community Screen
  cats: string;
  dogs: string;
  products: string;
  adoption: string;
  tips: string;
  likes: string;
  comments: string;

  // Expenses Screen
  trackSpending: string;
  total: string;
  thisMonth: string;
  records: string;
  byCategory: string;
  recent: string;
  noExpenses: string;
  addExpense: string;
  amount: string;
  description: string;
  date: string;
  category: string;
  pet: string;
  selectPet: string;

  // Memories Screen
  importantDates: string;
  comingUp: string;
  noAnniversaries: string;
  addAnniversary: string;
  title: string;
  notes: string;
  type: string;
  birthday: string;
  adoptionDay: string;
  custom: string;

  // Add/Edit Pet
  addPet: string;
  editPet: string;
  petName: string;
  ownerName: string;
  petType: string;
  breed: string;
  gender: string;
  male: string;
  female: string;
  dog: string;
  cat: string;
  other: string;
  birthdayLabel: string;
  personalityTags: string;
  aboutPet: string;
  lookingForCompanion: string;
  lookingToggle: string;
  lookingToggleHint: string;
  lookingOn: string;
  lookingOff: string;
  avatarUrl: string;
  leaveForDefault: string;
  required: string;
  selectDate: string;

  // Expense categories
  food: string;
  medical: string;
  toys: string;
  grooming: string;

  // Pet Detail
  age: string;
  owner: string;
  petInfo: string;

  // Match
  sent: string;
  alreadyMatched: string;
  pleaseAddPetFirst: string;
  likeSent: string;

  // Auth
  login: string;
  register: string;
  phoneNumber: string;
  verifyCode: string;
  sendCode: string;
  resendCode: string;
  enterPhone: string;
  enterCode: string;
  nickname: string;
  completeProfile: string;
  loginSuccess: string;
  loginFailed: string;
  continueText: string;
  logout: string;
  profile: string;
  editProfile: string;
  email: string;
  enterEmail: string;
  password: string;
  enterPassword: string;
  forgotPassword: string;
  noAccount: string;
  signUp: string;
  haveAccount: string;
  signIn: string;

  // Matches & Chat
  matches: string;
  chat: string;
  noMatches: string;
  receivedLikes: string;
  noLikesYet: string;
  startChat: string;
  typeMessage: string;
  send: string;
}

const en: Translations = {
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  confirm: 'Confirm',
  success: 'Success',
  error: 'Error',
  info: 'Info',
  loading: 'Loading...',

  home: 'Home',
  dating: 'Dating',
  community: 'Community',
  expenses: 'Expenses',
  memories: 'Memories',

  welcome: 'Welcome',
  welcomeSubtitle: 'Manage your pets and capture beautiful moments',
  myPets: 'My Pets',
  noPets: 'No pets yet',
  addFirstPet: 'Add your first pet',
  viewAll: 'View all',
  pets: 'pets',
  pending: 'pending',

  datingAction: 'Dating',
  datingSubtitle: 'Find a companion',
  expensesAction: 'Expenses',
  expensesSubtitle: 'Track spending',
  memoriesAction: 'Memories',
  memoriesSubtitle: 'Important dates',
  addPetAction: 'Add Pet',
  addPetSubtitle: 'Register new',

  findCompanion: 'Find a companion for your pet',
  noMorePets: 'No more pets',
  checkLater: 'Check back later',
  personality: 'Personality',
  about: 'About',
  lookingFor: 'Looking for',
  tapHeartToLike: 'Tap heart to like, X to pass',
  like: 'Like',
  pass: 'Pass',

  cats: '# Cats',
  dogs: '# Dogs',
  products: '# Products',
  adoption: '# Adoption',
  tips: '# Tips',
  likes: 'Likes',
  comments: 'Comments',

  trackSpending: 'Track your pet spending',
  total: 'Total',
  thisMonth: 'This Month',
  records: 'Records',
  byCategory: 'By Category',
  recent: 'Recent',
  noExpenses: 'No expenses yet',
  addExpense: 'Add Expense',
  amount: 'Amount',
  description: 'Description',
  date: 'Date',
  category: 'Category',
  pet: 'Pet',
  selectPet: 'Select a pet',

  importantDates: 'Important dates',
  comingUp: 'Coming Up',
  noAnniversaries: 'No anniversaries yet',
  addAnniversary: 'Add Anniversary',
  title: 'Title',
  notes: 'Notes',
  type: 'Type',
  birthday: 'Birthday',
  adoptionDay: 'Adoption Day',
  custom: 'Custom',

  addPet: 'Add Pet',
  editPet: 'Edit Pet',
  petName: 'Name',
  ownerName: 'Owner',
  petType: 'Type',
  breed: 'Breed',
  gender: 'Gender',
  male: 'Male',
  female: 'Female',
  dog: 'Dog',
  cat: 'Cat',
  other: 'Other',
  birthdayLabel: 'Birthday',
  personalityTags: 'Personality Tags',
  aboutPet: 'About',
  lookingForCompanion: 'Looking For',
  lookingToggle: '寻找伴侣',
  lookingToggleHint: '开启后其他用户可以在相亲页面看到您的宠物',
  lookingOn: '征婚中',
  lookingOff: '已关闭',
  avatarUrl: 'Avatar URL',
  leaveForDefault: 'Leave empty for default',
  required: '*',
  selectDate: 'Tap to select',

  // Expense categories
  food: 'Food',
  medical: 'Medical',
  toys: 'Toys',
  grooming: 'Grooming',

  age: 'Age',
  owner: 'Owner',
  petInfo: 'Pet Info',

  sent: 'Sent',
  alreadyMatched: 'Already matched!',
  pleaseAddPetFirst: 'Please add a pet first',
  likeSent: 'Like sent',

  // Auth
  login: 'Login',
  register: 'Register',
  phoneNumber: 'Phone Number',
  verifyCode: 'Verification Code',
  sendCode: 'Send Code',
  resendCode: 'Resend',
  enterPhone: 'Enter phone number',
  enterCode: 'Enter verification code',
  nickname: 'Nickname',
  completeProfile: 'Complete Profile',
  loginSuccess: 'Login successful',
  loginFailed: 'Login failed',
  continueText: 'Continue',
  logout: 'Logout',
  profile: 'Profile',
  editProfile: 'Edit Profile',
  email: 'Email',
  enterEmail: 'Enter email address',
  password: 'Password',
  enterPassword: 'Enter password',
  forgotPassword: 'Forgot password?',
  noAccount: "Don't have an account?",
  signUp: 'Sign Up',
  haveAccount: 'Already have an account?',
  signIn: 'Sign In',

  // Matches & Chat
  matches: 'Matches',
  chat: 'Chat',
  noMatches: 'No matches yet',
  receivedLikes: 'Received Likes',
  noLikesYet: 'No likes yet',
  startChat: 'Start chatting',
  typeMessage: 'Type a message...',
  send: 'Send',
};

const zh: Translations = {
  save: '保存',
  cancel: '取消',
  delete: '删除',
  edit: '编辑',
  add: '添加',
  confirm: '确认',
  success: '成功',
  error: '错误',
  info: '提示',
  loading: '加载中...',

  home: '首页',
  dating: '相亲',
  community: '社区',
  expenses: '记账',
  memories: '纪念日',

  welcome: '欢迎',
  welcomeSubtitle: '管理您的宠物，记录美好时光',
  myPets: '我的宠物',
  noPets: '还没有添加宠物',
  addFirstPet: '添加第一只宠物',
  viewAll: '查看更多',
  pets: '只宠物',
  pending: '待匹配',

  datingAction: '宠物相亲',
  datingSubtitle: '寻找伴侣',
  expensesAction: '记账',
  expensesSubtitle: '记录开支',
  memoriesAction: '纪念日',
  memoriesSubtitle: '重要日子',
  addPetAction: '添加宠物',
  addPetSubtitle: '注册新宠物',

  findCompanion: '为你的宠物找到合适的伴侣',
  noMorePets: '暂时没有更多宠物了',
  checkLater: '稍后再来看看吧',
  personality: '性格标签',
  about: '自我介绍',
  lookingFor: '期望对象',
  tapHeartToLike: '点击爱心表示喜欢，点击X查看下一个',
  like: '喜欢',
  pass: '跳过',

  cats: '# 猫咪日常',
  dogs: '# 狗狗趣事',
  products: '# 宠物用品',
  adoption: '# 领养救助',
  tips: '# 养宠经验',
  likes: '点赞',
  comments: '评论',

  trackSpending: '记录每一笔宠物开支',
  total: '总开支',
  thisMonth: '本月开支',
  records: '记录数',
  byCategory: '分类统计',
  recent: '开支记录',
  noExpenses: '还没有记账记录',
  addExpense: '添加开支',
  amount: '金额',
  description: '描述',
  date: '日期',
  category: '分类',
  pet: '宠物',
  selectPet: '选择宠物',

  importantDates: '记录重要的日子',
  comingUp: '即将到来的纪念日',
  noAnniversaries: '还没有添加纪念日',
  addAnniversary: '添加纪念日',
  title: '标题',
  notes: '备注',
  type: '类型',
  birthday: '生日',
  adoptionDay: '领养日',
  custom: '自定义',

  addPet: '添加宠物',
  editPet: '编辑宠物',
  petName: '宠物名字',
  ownerName: '主人姓名',
  petType: '宠物类型',
  breed: '品种',
  gender: '性别',
  male: '男生',
  female: '女生',
  dog: '狗狗',
  cat: '猫咪',
  other: '其他',
  birthdayLabel: '生日',
  personalityTags: '性格标签',
  aboutPet: '自我介绍',
  lookingForCompanion: '期望对象',
  lookingToggle: '寻找伴侣',
  lookingToggleHint: '开启后其他用户可以在相亲页面看到您的宠物',
  lookingOn: '征婚中',
  lookingOff: '已关闭',
  avatarUrl: '头像链接',
  leaveForDefault: '留空将使用默认头像',
  required: '*',
  selectDate: '点击选择日期',

  // Expense categories
  food: '食物',
  medical: '医疗',
  toys: '玩具',
  grooming: '美容',

  age: '年龄',
  owner: '主人',
  petInfo: '宠物详情',

  sent: '已发送',
  alreadyMatched: '已经匹配过了',
  pleaseAddPetFirst: '请先添加宠物',
  likeSent: '喜欢已发送',

  // Auth
  login: '登录',
  register: '注册',
  phoneNumber: '手机号',
  verifyCode: '验证码',
  sendCode: '发送验证码',
  resendCode: '重新发送',
  enterPhone: '请输入手机号',
  enterCode: '请输入验证码',
  nickname: '昵称',
  completeProfile: '完善资料',
  loginSuccess: '登录成功',
  loginFailed: '登录失败',
  continueText: '继续',
  logout: '退出登录',
  profile: '个人资料',
  editProfile: '编辑资料',
  email: '邮箱',
  enterEmail: '请输入邮箱地址',
  password: '密码',
  enterPassword: '请输入密码',
  forgotPassword: '忘记密码？',
  noAccount: '还没有账号？',
  signUp: '注册',
  haveAccount: '已有账号？',
  signIn: '登录',

  // Matches & Chat
  matches: '匹配',
  chat: '聊天',
  noMatches: '还没有匹配',
  receivedLikes: '收到的喜欢',
  noLikesYet: '还没有人喜欢你的宠物',
  startChat: '开始聊天',
  typeMessage: '输入消息...',
  send: '发送',
};

const translations: Record<Language, Translations> = { en, zh };

// Context - 使用 React Context 实现自动重新渲染
interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: keyof Translations): string => {
    return translations[language][key];
  };

  const value = { language, setLanguage, t };

  return React.createElement(I18nContext.Provider, { value }, children);
}

// Hook: 获取国际化函数
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

// 便捷 Hook: 只获取翻译函数
export function useTranslation() {
  const { t } = useI18n();
  return t;
}

// 便捷 Hook: 只获取当前语言
export function useLanguage() {
  const { language } = useI18n();
  return language;
}

// 兼容旧 API - 已废弃
export const getLanguage = () => 'zh';
export const setLanguage = (_lang: Language) => {};
export const addLanguageListener = (_listener: () => void) => () => {};
export const t = (key: keyof Translations): string => translations['zh'][key];