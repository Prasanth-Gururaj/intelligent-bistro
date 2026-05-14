import { create } from 'zustand';
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
interface ChatStore {
  messages: Message[];
  addMessage: (msg: { role: 'user' | 'assistant'; content: string }) => void;
  clearHistory: () => void;
}
const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: ({ role, content }) => {
    const timestamp = Date.now();
    set((state) => ({
      messages: [...state.messages, { id: timestamp.toString(), role, content, timestamp }],
    }));
  },
  clearHistory: () => set({ messages: [] }),
}));
export default useChatStore;
