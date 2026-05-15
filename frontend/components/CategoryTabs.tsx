import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import type { Category } from '../store/menuStore';

interface Props {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export default function CategoryTabs({ categories, activeCategory, onCategoryChange }: Props) {
  const all = [{ id: 'all', name: 'All Menu' }, ...categories.map((c) => ({ id: c.id, name: c.name }))];
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {all.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => onCategoryChange(cat.id)}
              style={[styles.pill, active ? styles.activePill : styles.inactivePill]}
              activeOpacity={0.8}
            >
              <Text style={[styles.text, active ? styles.activeText : styles.inactiveText]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.base,
  },
  pill: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: RADIUS.full, borderWidth: 1 },
  activePill: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  inactivePill: { backgroundColor: 'rgba(18, 18, 18, 0.7)', borderColor: COLORS.border },
  text: { fontSize: 13, fontWeight: '600' },
  activeText: { color: COLORS.onPrimary },
  inactiveText: { color: COLORS.text },
});
