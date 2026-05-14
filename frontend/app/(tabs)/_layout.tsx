import { useState } from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { UtensilsCrossed, MessageCircle } from 'lucide-react-native';
import CartIcon from '../../components/CartIcon';
import CartSheet from '../../components/CartSheet';
import OrderSuccess from '../../components/OrderSuccess';
import useCartStore from '../../store/cartStore';
import useChatStore from '../../store/chatStore';
import { COLORS } from '../../constants/theme';

export default function TabLayout() {
  const [cartVisible, setCartVisible] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const { clearCart } = useCartStore();
  const { clearHistory } = useChatStore();

  const handlePlaceOrder = () => {
    setCartVisible(false);
    setOrderSuccess(true);
  };
  const handleBack = () => {
    clearCart();
    clearHistory();
    setOrderSuccess(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs screenOptions={{
        tabBarStyle: { backgroundColor: COLORS.card, borderTopColor: COLORS.border },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
        headerRight: () => <CartIcon onPress={() => setCartVisible(true)} />,
      }}>
        <Tabs.Screen name="index" options={{ headerTitle: 'The Intelligent Bistro', title: 'Menu', tabBarIcon: ({ color }) => <UtensilsCrossed size={22} color={color} /> }} />
        <Tabs.Screen name="chat" options={{ headerTitle: 'AI Assistant', title: 'AI Assistant', tabBarIcon: ({ color }) => <MessageCircle size={22} color={color} /> }} />
      </Tabs>
      <CartSheet visible={cartVisible} onClose={() => setCartVisible(false)} onPlaceOrder={handlePlaceOrder} />
      <OrderSuccess visible={orderSuccess} onBack={handleBack} />
    </View>
  );
}
