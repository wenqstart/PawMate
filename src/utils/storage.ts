import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pet, Expense, Anniversary, MatchRequest, Match, Message } from '../types';

const KEYS = {
  PETS: '@pets',
  EXPENSES: '@expenses',
  ANNIVERSARIES: '@anniversaries',
  MATCH_REQUESTS: '@match_requests',
  MATCHES: '@matches',
  MESSAGES: '@messages',
};

// Pet Storage
export const getPets = async (): Promise<Pet[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.PETS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading pets:', error);
    return [];
  }
};

export const savePets = async (pets: Pet[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.PETS, JSON.stringify(pets));
  } catch (error) {
    console.error('Error saving pets:', error);
  }
};

export const addPet = async (pet: Pet): Promise<void> => {
  const pets = await getPets();
  await savePets([...pets, pet]);
};

export const updatePet = async (pet: Pet): Promise<void> => {
  const pets = await getPets();
  const updated = pets.map(p => p.id === pet.id ? pet : p);
  await savePets(updated);
};

export const deletePet = async (id: string): Promise<void> => {
  const pets = await getPets();
  await savePets(pets.filter(pet => pet.id !== id));
};

// Expense Storage
export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading expenses:', error);
    return [];
  }
};

export const saveExpenses = async (expenses: Expense[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (error) {
    console.error('Error saving expenses:', error);
  }
};

export const addExpense = async (expense: Expense): Promise<void> => {
  const expenses = await getExpenses();
  await saveExpenses([...expenses, expense]);
};

export const updateExpense = async (updatedExpense: Expense): Promise<void> => {
  const expenses = await getExpenses();
  const index = expenses.findIndex(e => e.id === updatedExpense.id);
  if (index !== -1) {
    expenses[index] = updatedExpense;
    await saveExpenses(expenses);
  }
};

// Anniversary Storage
export const getAnniversaries = async (): Promise<Anniversary[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.ANNIVERSARIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading anniversaries:', error);
    return [];
  }
};

export const saveAnniversaries = async (anniversaries: Anniversary[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.ANNIVERSARIES, JSON.stringify(anniversaries));
  } catch (error) {
    console.error('Error saving anniversaries:', error);
  }
};

export const addAnniversary = async (anniversary: Anniversary): Promise<void> => {
  const anniversaries = await getAnniversaries();
  await saveAnniversaries([...anniversaries, anniversary]);
};

// ============ 配对请求 Storage ============

export const getMatchRequests = async (): Promise<MatchRequest[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.MATCH_REQUESTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading match requests:', error);
    return [];
  }
};

export const saveMatchRequests = async (requests: MatchRequest[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.MATCH_REQUESTS, JSON.stringify(requests));
  } catch (error) {
    console.error('Error saving match requests:', error);
  }
};

export const addMatchRequest = async (request: MatchRequest): Promise<void> => {
  const requests = await getMatchRequests();
  await saveMatchRequests([...requests, request]);
};

export const updateMatchRequest = async (request: MatchRequest): Promise<void> => {
  const requests = await getMatchRequests();
  const updated = requests.map(r => r.id === request.id ? request : r);
  await saveMatchRequests(updated);
};

export const getMatchRequestsForPet = async (petId: string): Promise<MatchRequest[]> => {
  const requests = await getMatchRequests();
  // 获取发给指定宠物的配对请求
  return requests.filter(r => r.targetPet.id === petId && r.status === 'pending');
};

// ============ 匹配 Storage ============

export const getMatches = async (): Promise<Match[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.MATCHES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading matches:', error);
    return [];
  }
};

export const saveMatches = async (matches: Match[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.MATCHES, JSON.stringify(matches));
  } catch (error) {
    console.error('Error saving matches:', error);
  }
};

export const addMatch = async (match: Match): Promise<void> => {
  const matches = await getMatches();
  await saveMatches([...matches, match]);
};

// 检查两只宠物是否已经匹配
export const isPetsMatched = async (petIdA: string, petIdB: string): Promise<boolean> => {
  const matches = await getMatches();
  return matches.some(m =>
    (m.petA.id === petIdA && m.petB.id === petB) ||
    (m.petA.id === petIdB && m.petB.id === petIdA)
  );
};

// ============ 消息 Storage ============

export const getMessages = async (): Promise<Message[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.MESSAGES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading messages:', error);
    return [];
  }
};

export const saveMessages = async (messages: Message[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving messages:', error);
  }
};

export const addMessage = async (message: Message): Promise<void> => {
  const messages = await getMessages();
  await saveMessages([...messages, message]);
};

export const getMessagesForMatch = async (matchId: string): Promise<Message[]> => {
  const messages = await getMessages();
  return messages.filter(m => m.matchId === matchId);
};
