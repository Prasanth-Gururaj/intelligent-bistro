export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}
export const MENU_ITEMS: MenuItem[] = [
  { id: 'st_001', name: 'Bruschetta', price: 7.99, description: 'Toasted sourdough, fresh tomato, basil, balsamic glaze', category: 'starters' },
  { id: 'st_002', name: 'Crispy Calamari', price: 11.99, description: 'Lightly battered, served with lemon aioli', category: 'starters' },
  { id: 'st_003', name: 'Soup of the Day', price: 8.99, description: 'Chef daily creation, rich and comforting', category: 'starters' },
  { id: 'st_004', name: 'Cheese Board', price: 13.99, description: 'Selection of artisan cheeses, crackers, seasonal fruit', category: 'starters' },
  { id: 'st_005', name: 'Truffle Fries', price: 8.99, description: 'Hand-cut fries, truffle oil, parmesan, fresh herbs', category: 'starters' },
  { id: 'mc_001', name: 'Grilled Chicken Burger', price: 14.99, description: 'Grilled chicken, lettuce, tomato, bistro sauce', category: 'mains' },
  { id: 'mc_002', name: 'Spicy Chicken Sandwich', price: 13.99, description: 'Crispy chicken, jalapeno slaw, sriracha mayo', category: 'mains' },
  { id: 'mc_003', name: 'Margherita Pizza', price: 15.99, description: 'San Marzano tomato, buffalo mozzarella, fresh basil', category: 'mains' },
  { id: 'mc_004', name: 'Ribeye Steak', price: 28.99, description: '12oz prime ribeye, herb butter, seasonal vegetables', category: 'mains' },
  { id: 'mc_005', name: 'Pasta Carbonara', price: 16.99, description: 'Spaghetti, guanciale, egg yolk, pecorino, black pepper', category: 'mains' },
  { id: 'dd_001', name: 'Mango Sorbet', price: 6.99, description: 'House-made, three scoops, fresh mango', category: 'desserts' },
  { id: 'dd_002', name: 'Chocolate Lava Cake', price: 8.99, description: 'Warm dark chocolate, vanilla ice cream', category: 'desserts' },
  { id: 'dd_003', name: 'Classic Lemonade', price: 4.99, description: 'Fresh-squeezed, lightly sweetened', category: 'desserts' },
  { id: 'dd_004', name: 'Iced Matcha Latte', price: 5.99, description: 'Ceremonial grade matcha, oat milk', category: 'desserts' },
  { id: 'dd_005', name: 'Sparkling Water', price: 2.99, description: '500ml bottle', category: 'desserts' },
];
