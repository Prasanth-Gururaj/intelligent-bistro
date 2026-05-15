import axios from 'axios';
import type { MenuItem, Category } from '../store/menuStore';

const API_BASE_URL = 'http://192.168.2.142:3001';

const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });

export interface ChatAction {
  type: 'ADD' | 'REMOVE' | 'UPDATE' | 'CLEAR';
  itemId?: string;
  itemName?: string;
  quantity?: number;
}

export interface ChatResponse {
  actions: ChatAction[];
  suggestions: string[];
  reply: string;
}

export const sendChatMessage = async (
  message: string,
  cart: unknown,
  history: unknown
): Promise<ChatResponse> => {
  try {
    const response = await api.post<ChatResponse>('/api/chat', { message, cart, history });
    return response.data;
  } catch {
    throw new Error('NETWORK_ERROR');
  }
};

export const fetchMenu = async (): Promise<MenuItem[]> => {
  const response = await api.get<{ items: MenuItem[] }>('/api/menu');
  return response.data.items;
};

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await api.get<{ categories: Category[] }>('/api/categories');
  return response.data.categories;
};
