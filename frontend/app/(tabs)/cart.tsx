import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Minus, ShoppingBasket, ArrowRight, Sparkles, Bot } from 'lucide-react-native';
import useCartStore from '../../store/cartStore';
import useMenuStore from '../../store/menuStore';
import AISparkChip from '../../components/AISparkChip';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants/theme';

const TAX_RATE = 0.08;

export default function CartScreen() {
  const router = useRouter();
  const { items, total, updateQty, removeItem } = useCartStore();
  const getItemById = useMenuStore((s) => s.getItemById);

  const tax = Math.round(total * TAX_RATE * 100) / 100;
  const grand = Math.round((total + tax) * 100) / 100;

  const pairingSuggestion = (() => {
    for (const ci of items) {
      const item = getItemById(ci.itemId);
      if (item?.pairsWith && item.pairsWith.length) {
        const candidate = item.pairsWith
          .map((id) => getItemById(id))
          .find((p) => p && !items.some((c) => c.itemId === p.id));
        if (candidate) return { source: item, candidate };
      }
    }
    return null;
  })();

  const handlePlaceOrder = () => {
    router.push('/order-success');
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Cart</Text>
        </View>
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <ShoppingBasket size={48} color={COLORS.textMuted} strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>Your plate is empty</Text>
          <Text style={styles.emptySub}>Our AI Expert is waiting to help you curate the perfect dining experience.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/chat')} activeOpacity={0.85}>
            <Bot size={18} color={COLORS.onSecondary} />
            <Text style={styles.emptyBtnText}>Ask the AI Expert</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuLink} onPress={() => router.push('/(tabs)/menu')}>
            <Text style={styles.menuLinkText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>Your Selection</Text>
            <AISparkChip label="Smart Cart" />
          </View>
          <Text style={styles.headerSub}>Review your curated culinary choices</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.itemsList}>
          {items.map((ci) => {
            const item = getItemById(ci.itemId);
            return (
              <View key={ci.itemId} style={styles.itemCard}>
                <View style={styles.itemImageWrap}>
                  {item?.image ? (
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                  ) : (
                    <View style={[styles.itemImage, styles.itemImagePlaceholder]} />
                  )}
                </View>
                <View style={styles.itemBody}>
                  <View style={styles.itemTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName} numberOfLines={1}>{ci.name}</Text>
                      {item?.prepTime ? (
                        <Text style={styles.itemSub}>{item.prepTime}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.itemPrice}>${(ci.price * ci.qty).toFixed(2)}</Text>
                  </View>
                  <View style={styles.itemBottomRow}>
                    <View style={styles.qtyRow}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => (ci.qty <= 1 ? removeItem(ci.itemId) : updateQty(ci.itemId, ci.qty - 1))}
                        activeOpacity={0.7}
                      >
                        <Minus size={14} color={COLORS.textVariant} />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{ci.qty}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQty(ci.itemId, ci.qty + 1)}
                        activeOpacity={0.7}
                      >
                        <Plus size={14} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => removeItem(ci.itemId)} style={styles.removeLink}>
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxes (8%)</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={[styles.summaryValue, { color: COLORS.tertiary }]}>FREE</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${grand.toFixed(2)}</Text>
          </View>
        </View>

        {pairingSuggestion && (
          <View style={styles.pairingCard}>
            <View style={styles.pairingHeader}>
              <Sparkles size={18} color={COLORS.secondary} fill={COLORS.secondary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pairingTitle}>AI Expert Suggestion</Text>
                <Text style={styles.pairingDesc}>
                  Based on your {pairingSuggestion.source.name}, our chef suggests pairing with{' '}
                  <Text style={{ color: COLORS.secondary, fontWeight: '600' }}>
                    {pairingSuggestion.candidate!.name}
                  </Text>.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.pairingBtn}
              onPress={() =>
                useCartStore.getState().addItem({
                  itemId: pairingSuggestion.candidate!.id,
                  name: pairingSuggestion.candidate!.name,
                  price: pairingSuggestion.candidate!.price,
                })
              }
            >
              <Text style={styles.pairingBtnText}>
                Add Pairing +${pairingSuggestion.candidate!.price.toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.checkoutWrap}>
        <TouchableOpacity style={styles.checkoutBtn} onPress={handlePlaceOrder} activeOpacity={0.85}>
          <Text style={styles.checkoutText}>Checkout · ${grand.toFixed(2)}</Text>
          <ArrowRight size={20} color={COLORS.onPrimaryContainer} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: 10,
    paddingBottom: 16,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { color: COLORS.text, fontSize: 26, fontWeight: '600', letterSpacing: -0.4 },
  headerSub: { color: COLORS.textVariant, fontSize: FONTS.md, marginTop: 4, opacity: 0.7 },

  scroll: { paddingHorizontal: SPACING.marginMobile, paddingBottom: 140 },
  itemsList: { gap: 12 },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(18, 18, 18, 0.7)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.DEFAULT,
    padding: 14,
    gap: 14,
  },
  itemImageWrap: { width: 72, height: 72, borderRadius: 14, overflow: 'hidden', backgroundColor: COLORS.surfaceHigh },
  itemImage: { width: '100%', height: '100%' },
  itemImagePlaceholder: { backgroundColor: COLORS.surfaceHigh },
  itemBody: { flex: 1, justifyContent: 'space-between' },
  itemTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  itemSub: { color: COLORS.textVariant, fontSize: 11, marginTop: 2, opacity: 0.7 },
  itemPrice: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  itemBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceHighest,
    borderRadius: RADIUS.full,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyText: { color: COLORS.text, fontWeight: '600', fontSize: FONTS.md, minWidth: 24, textAlign: 'center' },
  removeLink: { paddingHorizontal: 4 },
  removeText: { color: COLORS.error, fontSize: 12, opacity: 0.7, fontWeight: '500' },

  summary: {
    marginTop: 28,
    paddingTop: 18,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: COLORS.textVariant, fontSize: FONTS.md, opacity: 0.8 },
  summaryValue: { color: COLORS.textVariant, fontSize: FONTS.md, opacity: 0.9 },
  totalRow: { marginTop: 6 },
  totalLabel: { color: COLORS.text, fontSize: FONTS.xxl, fontWeight: '600' },
  totalValue: { color: COLORS.primary, fontSize: FONTS.xxl, fontWeight: '700' },

  pairingCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: RADIUS.DEFAULT,
    backgroundColor: 'rgba(233, 195, 73, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(233, 195, 73, 0.25)',
  },
  pairingHeader: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  pairingTitle: { color: COLORS.secondary, fontSize: FONTS.md, fontWeight: '600' },
  pairingDesc: { color: COLORS.textVariant, fontSize: 12, marginTop: 4, lineHeight: 18, opacity: 0.85 },
  pairingBtn: { marginTop: 10, alignSelf: 'flex-start' },
  pairingBtnText: { color: COLORS.secondary, fontSize: FONTS.md, fontWeight: '600', textDecorationLine: 'underline' },

  checkoutWrap: {
    position: 'absolute',
    bottom: 12,
    left: SPACING.marginMobile,
    right: SPACING.marginMobile,
  },
  checkoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryContainer,
    paddingVertical: 18,
    borderRadius: RADIUS.DEFAULT,
    shadowColor: COLORS.primaryContainer,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  checkoutText: { color: COLORS.onPrimaryContainer, fontSize: FONTS.xl, fontWeight: '700' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 12 },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surfaceLow,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { color: COLORS.text, fontSize: FONTS.xxl, fontWeight: '600' },
  emptySub: { color: COLORS.textVariant, fontSize: FONTS.md, textAlign: 'center', opacity: 0.8, lineHeight: 20 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 22,
    paddingVertical: 14,
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.full,
  },
  emptyBtnText: { color: COLORS.onSecondary, fontSize: FONTS.md, fontWeight: '700' },
  menuLink: { marginTop: 8 },
  menuLinkText: { color: COLORS.primary, fontSize: FONTS.md, fontWeight: '600' },
});
