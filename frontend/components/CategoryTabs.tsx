import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'starters', label: 'Starters' },
  { id: 'mains', label: 'Main Course' },
  { id: 'desserts', label: 'Desserts & Drinks' },
];
interface Props { activeCategory: string; onCategoryChange: (c: string) => void; }
export default function CategoryTabs({ activeCategory, onCategoryChange }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <TouchableOpacity key={cat.id} style={[styles.pill, active ? styles.activePill : styles.inactivePill]} onPress={() => onCategoryChange(cat.id)}>
              <Text style={[styles.pillText, active ? styles.activeText : styles.inactiveText]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { paddingVertical: 12, paddingHorizontal: SPACING.md },
  scroll: { flexDirection: 'row', gap: SPACING.sm },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  activePill: { backgroundColor: COLORS.accent },
  inactivePill: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  pillText: { fontSize: 13, fontWeight: '600' },
  activeText: { color: COLORS.textDark },
  inactiveText: { color: COLORS.textMuted },
});
