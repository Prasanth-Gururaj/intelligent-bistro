import { useState } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MENU_ITEMS } from '../../data/menu';
import MenuCard from '../../components/MenuCard';
import CategoryTabs from '../../components/CategoryTabs';
import { COLORS } from '../../constants/theme';

export default function MenuScreen() {
  const [activeCategory, setActiveCategory] = useState('all');
  const filtered = activeCategory === 'all' ? MENU_ITEMS : MENU_ITEMS.filter((i) => i.category === activeCategory);
  return (
    <SafeAreaView style={styles.container}>
      <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      <FlatList
        data={filtered}
        renderItem={({ item }) => <MenuCard item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { color: COLORS.textMuted, fontSize: 16 },
});