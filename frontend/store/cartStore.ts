import { create } from 'zustand';
export interface CartItem {
  itemId: string;
  name: string;
  qty: number;
  price: number;
}
interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (itemId: string) => void;
  updateQty: (itemId: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}
const computeTotals = (items: CartItem[]) => ({
  total: Math.round(items.reduce((s, i) => s + i.price * i.qty, 0) * 100) / 100,
  itemCount: items.reduce((s, i) => s + i.qty, 0),
});
const useCartStore = create<CartStore>((set) => ({
  items: [], total: 0, itemCount: 0,
  addItem: (item) => set((state) => {
    const idx = state.items.findIndex((e) => e.itemId === item.itemId);
    const items = [...state.items];
    if (idx >= 0) items[idx] = { ...items[idx], qty: items[idx].qty + 1 };
    else items.push({ ...item, qty: 1 });
    return { items, ...computeTotals(items) };
  }),
  removeItem: (itemId) => set((state) => {
    const items = state.items.filter((e) => e.itemId !== itemId);
    return { items, ...computeTotals(items) };
  }),
  updateQty: (itemId, qty) => set((state) => {
    if (qty <= 0) {
      const items = state.items.filter((e) => e.itemId !== itemId);
      return { items, ...computeTotals(items) };
    }
    const items = state.items.map((e) => e.itemId === itemId ? { ...e, qty } : e);
    return { items, ...computeTotals(items) };
  }),
  clearCart: () => set({ items: [], total: 0, itemCount: 0 }),
}));
export default useCartStore;
