import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Plus, Flame } from 'lucide-react-native';
import useCartStore from '../store/cartStore';
import { COLORS, RADIUS } from '../constants/theme';
import type { MenuItem } from '../store/menuStore';

interface Props {
  item: MenuItem;
}

export default function SuggestionCard({ item }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]} />
        )}
        {item.spiceLevel > 0 && (
          <View style={styles.spiceBadge}>
            <Flame size={11} color={COLORS.error} fill={COLORS.error} />
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.bottom}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => addItem({ itemId: item.id, name: item.name, price: item.price })}
            activeOpacity={0.85}
          >
            <Plus size={14} color={COLORS.onSecondary} strokeWidth={2.5} />
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
    borderRadius: RADIUS.DEFAULT,
    borderWidth: 1,
    borderColor: 'rgba(233, 195, 73, 0.25)',
    overflow: 'hidden',
  },
  imageWrap: { height: 110, backgroundColor: COLORS.surfaceHigh, position: 'relative' },
  image: { width: '100%', height: '100%' },
  placeholder: { backgroundColor: COLORS.surfaceHigh },
  spiceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(10, 10, 10, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 12, gap: 4 },
  name: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  desc: { color: COLORS.textVariant, fontSize: 11, opacity: 0.6, lineHeight: 14, height: 28 },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: { color: COLORS.secondary, fontSize: 14, fontWeight: '700' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  addText: { color: COLORS.onSecondary, fontSize: 11, fontWeight: '700' },
});
