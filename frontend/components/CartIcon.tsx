import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import useCartStore from '../store/cartStore';
import { COLORS } from '../constants/theme';
interface CartIconProps { onPress: () => void; }
export default function CartIcon({ onPress }: CartIconProps) {
  const { itemCount } = useCartStore();
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconWrap}>
        <ShoppingCart size={24} color={COLORS.text} />
        {itemCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: { paddingRight: 16 },
  iconWrap: { position: 'relative' },
  badge: { position: 'absolute', top: -6, right: -6, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3 },
  badgeText: { color: COLORS.textDark, fontSize: 10, fontWeight: 'bold' },
});
