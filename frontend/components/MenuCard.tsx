import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import useCartStore from '../store/cartStore';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import type { MenuItem } from '../data/menu';
export default function MenuCard({ item }: { item: MenuItem }) {
  const { items, addItem, removeItem, updateQty } = useCartStore();
  const cartItem = items.find((e) => e.itemId === item.id);
  const qty = cartItem?.qty ?? 0;
  const onAdd = () => qty === 0 ? addItem({ itemId: item.id, name: item.name, price: item.price }) : updateQty(item.id, qty + 1);
  const onRemove = () => qty === 1 ? removeItem(item.id) : updateQty(item.id, qty - 1);
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
      </View>
      <Text style={styles.desc}>{item.description}</Text>
      <View style={styles.bottom}>
        {qty === 0 ? (
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Text style={styles.addBtnText}>Add to Cart</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.qtyRow}>
            <TouchableOpacity style={[styles.qtyBtn, styles.minusBtn]} onPress={onRemove}>
              <Minus size={18} color={COLORS.accent} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{qty}</Text>
            <TouchableOpacity style={[styles.qtyBtn, styles.plusBtn]} onPress={onAdd}>
              <Plus size={18} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: COLORS.text, fontSize: FONTS.lg, fontWeight: 'bold', flex: 1, marginRight: 8 },
  price: { color: COLORS.accent, fontSize: FONTS.lg, fontWeight: 'bold' },
  desc: { color: COLORS.textMuted, fontSize: FONTS.sm, marginTop: 4 },
  bottom: { marginTop: SPACING.md },
  addBtn: { backgroundColor: COLORS.accent, borderRadius: 8, padding: 10, alignItems: 'center' },
  addBtnText: { color: COLORS.textDark, fontWeight: 'bold', fontSize: FONTS.md },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  qtyBtn: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  minusBtn: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  plusBtn: { backgroundColor: COLORS.accent },
  qtyText: { color: COLORS.text, fontWeight: 'bold', minWidth: 32, textAlign: 'center', fontSize: FONTS.lg },
});
