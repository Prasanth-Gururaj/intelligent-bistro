import { create } from 'zustand';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  tags: string[];
  spiceLevel: number;
  dietary: string[];
  pairsWith: string[];
  calories: number | null;
  prepTime: string;
  available: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  icon: string | null;
}

interface MenuStore {
  items: MenuItem[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  setData: (items: MenuItem[], categories: Category[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getItemById: (id: string) => MenuItem | undefined;
}

const useMenuStore = create<MenuStore>((set, get) => ({
  items: [],
  categories: [],
  loading: false,
  error: null,
  setData: (items, categories) => set({ items, categories, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  getItemById: (id) => get().items.find((i) => i.id === id),
}));

export default useMenuStore;
