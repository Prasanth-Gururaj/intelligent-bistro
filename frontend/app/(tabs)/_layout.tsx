import { Tabs } from 'expo-router';
import { View, StyleSheet, Text } from 'react-native';
import { UtensilsCrossed, Bot, ShoppingBasket } from 'lucide-react-native';
import useCartStore from '../../store/cartStore';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

const TabLabel = ({ label, focused }: { label: string; focused: boolean }) => (
  <Text style={{ fontSize: 11, fontWeight: '600', color: focused ? COLORS.secondary : 'rgba(221, 193, 174, 0.6)' }}>
    {label}
  </Text>
);

const TabIcon = ({ Icon, focused }: { Icon: typeof UtensilsCrossed; focused: boolean }) => (
  <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
    <Icon size={22} color={focused ? COLORS.secondary : 'rgba(221, 193, 174, 0.6)'} fill={focused ? COLORS.secondary : 'transparent'} strokeWidth={focused ? 0 : 2} />
  </View>
);

const CartTabIcon = ({ focused }: { focused: boolean }) => {
  const { itemCount } = useCartStore();
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <ShoppingBasket size={22} color={focused ? COLORS.secondary : 'rgba(221, 193, 174, 0.6)'} fill={focused ? COLORS.secondary : 'transparent'} strokeWidth={focused ? 0 : 2} />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
        </View>
      )}
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
      }}
    >
      <Tabs.Screen
        name="menu"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={UtensilsCrossed} focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Menu" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={Bot} focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="AI Expert" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="My Cart" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(32, 31, 31, 0.92)',
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    paddingTop: 6,
    paddingBottom: 10,
    height: 70,
  },
  iconWrap: {
    width: 56,
    height: 36,
    borderRadius: RADIUS.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(175, 141, 17, 0.20)',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  badgeText: {
    color: COLORS.onPrimary,
    fontSize: 9,
    fontWeight: '700',
  },
});
