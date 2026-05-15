import { create } from 'zustand';
import type { ChatAction } from '../services/api';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  actions?: ChatAction[];
  suggestions?: string[];
}

interface ChatStore {
  messages: Message[];
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: (msg) => {
    const timestamp = Date.now();
    set((state) => ({
      messages: [...state.messages, { id: `${timestamp}-${Math.random().toString(36).slice(2, 7)}`, timestamp, ...msg }],
    }));
  },
  clearHistory: () => set({ messages: [] }),
}));

export default useChatStore;
