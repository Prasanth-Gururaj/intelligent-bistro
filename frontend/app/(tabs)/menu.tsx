import { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bot, ShoppingBag } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import useMenuStore from '../../store/menuStore';
import useCartStore from '../../store/cartStore';
import { fetchMenu, fetchCategories } from '../../services/api';
import MenuCard from '../../components/MenuCard';
import CategoryTabs from '../../components/CategoryTabs';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants/theme';

export default function MenuScreen() {
  const router = useRouter();
  const { items, categories, loading, error, setData, setLoading, setError } = useMenuStore();
  const { itemCount } = useCartStore();
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return items;
    return items.filter((i) => i.categoryId === activeCategory);
  }, [items, activeCategory]);

  const refresh = async () => {
    setLoading(true);
    try {
      const [m, c] = await Promise.all([fetchMenu(), fetchCategories()]);
      setData(m, c);
    } catch {
      setError('Could not refresh menu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <ShoppingBag size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>Intelligent Bistro</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/cart')} style={styles.headerIcon}>
          <ShoppingBag size={22} color={COLORS.primary} />
          {itemCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MenuCard item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={COLORS.primary} />}
        ListHeaderComponent={
          <View>
            <View style={styles.greeting}>
              <Text style={styles.greetTitle}>Good evening.</Text>
              <Text style={styles.greetSub}>What are you craving?</Text>
            </View>

            <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/(tabs)/chat')} activeOpacity={0.8}>
              <Bot size={20} color={COLORS.secondary} />
              <Text style={styles.searchPlaceholder}>Ask AI for recommendations...</Text>
            </TouchableOpacity>

            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={COLORS.secondary} />
              <Text style={styles.emptyText}>Loading menu...</Text>
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.center}><Text style={styles.emptyText}>No items found</Text></View>
          )
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/chat')}
        activeOpacity={0.85}
      >
        <Bot size={28} color={COLORS.onSecondary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    paddingBottom: 12,
    paddingTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceHigh,
    borderWidth: 1,
    borderColor: 'rgba(255, 183, 125, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: COLORS.primary, fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  headerBadgeText: { color: COLORS.onPrimaryContainer, fontSize: 9, fontWeight: '700' },
  listContent: { paddingHorizontal: SPACING.marginMobile, paddingBottom: 100 },
  greeting: { marginTop: 12, marginBottom: SPACING.md },
  greetTitle: { color: COLORS.text, fontSize: 28, fontWeight: '600', letterSpacing: -0.4 },
  greetSub: { color: COLORS.textVariant, fontSize: FONTS.lg, marginTop: 4 },
  searchBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    borderRadius: RADIUS.DEFAULT,
    backgroundColor: 'rgba(32, 31, 31, 0.6)',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  searchPlaceholder: { color: 'rgba(221, 193, 174, 0.5)', fontSize: FONTS.md },
  center: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.md },
  errorText: { color: COLORS.error, fontSize: FONTS.md, textAlign: 'center', paddingHorizontal: 20 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: RADIUS.full, backgroundColor: COLORS.primary },
  retryText: { color: COLORS.onPrimary, fontWeight: '700' },
  fab: {
    position: 'absolute',
    bottom: 84,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
});
