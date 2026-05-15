import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Plus, Minus, Flame, Clock } from 'lucide-react-native';
import useCartStore from '../store/cartStore';
import { COLORS, SPACING, FONTS, RADIUS } from '../constants/theme';
import type { MenuItem } from '../store/menuStore';

interface Props {
  item: MenuItem;
}

export default function MenuCard({ item }: Props) {
  const { items, addItem, removeItem, updateQty } = useCartStore();
  const cartItem = items.find((e) => e.itemId === item.id);
  const qty = cartItem?.qty ?? 0;

  const onAdd = () => {
    if (qty === 0) addItem({ itemId: item.id, name: item.name, price: item.price });
    else updateQty(item.id, qty + 1);
  };
  const onRemove = () => {
    if (qty === 1) removeItem(item.id);
    else updateQty(item.id, qty - 1);
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          {item.spiceLevel > 0 && (
            <View style={styles.spiceBadge}>
              <Flame size={12} color={COLORS.error} fill={COLORS.error} />
            </View>
          )}
        </View>

        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>

        {!!item.prepTime && (
          <View style={styles.metaRow}>
            <Clock size={12} color={COLORS.textVariant} />
            <Text style={styles.metaText}>{item.prepTime}</Text>
          </View>
        )}

        <View style={styles.bottomRow}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          {qty === 0 ? (
            <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.8}>
              <Plus size={20} color={COLORS.onPrimary} strokeWidth={2.5} />
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={onRemove} activeOpacity={0.7}>
                <Minus size={16} color={COLORS.textVariant} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={onAdd} activeOpacity={0.7}>
                <Plus size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: SPACING.gutter,
    padding: SPACING.gutter,
    borderRadius: RADIUS.DEFAULT,
    backgroundColor: 'rgba(32, 31, 31, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  imageWrap: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.DEFAULT,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceHigh,
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { backgroundColor: COLORS.surfaceHigh },
  body: { flex: 1, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { color: COLORS.text, fontSize: FONTS.md, fontWeight: '600', flex: 1 },
  spiceBadge: { padding: 2 },
  desc: { color: COLORS.textVariant, fontSize: 12, marginTop: 4, opacity: 0.7, lineHeight: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  metaText: { color: COLORS.textVariant, fontSize: 10, opacity: 0.7 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.base },
  price: { color: COLORS.secondary, fontSize: FONTS.lg, fontWeight: '700' },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceHighest,
    borderRadius: RADIUS.full,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyText: { color: COLORS.text, fontWeight: '600', fontSize: FONTS.md, minWidth: 22, textAlign: 'center' },
});
