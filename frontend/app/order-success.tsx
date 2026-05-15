import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CheckCircle2, Zap, Truck, Map } from 'lucide-react-native';
import useCartStore from '../store/cartStore';
import useChatStore from '../store/chatStore';
import useMenuStore from '../store/menuStore';
import { COLORS, SPACING, FONTS, RADIUS } from '../constants/theme';

const generateOrderId = () => `IB-${Math.floor(1000 + Math.random() * 9000)}`;

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { clearHistory } = useChatStore();
  const getItemById = useMenuStore((s) => s.getItemById);

  const [snapshot] = useState({ items: [...items], total, orderId: generateOrderId() });
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkGlow = useRef(new Animated.Value(0.3)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(checkGlow, { toValue: 0.6, duration: 1400, useNativeDriver: true }),
        Animated.timing(checkGlow, { toValue: 0.3, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
    Animated.timing(progressAnim, { toValue: 1, duration: 1400, useNativeDriver: false }).start();
  }, []);

  const handleBack = () => {
    clearCart();
    clearHistory();
    router.replace('/(tabs)/menu');
  };

  const tax = Math.round(snapshot.total * 0.08 * 100) / 100;
  const grand = Math.round((snapshot.total + tax) * 100) / 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Animated.View style={[styles.checkGlow, { opacity: checkGlow }]} />
          <Animated.View style={[styles.checkCircle, { transform: [{ scale: checkScale }] }]}>
            <CheckCircle2 size={64} color={COLORS.tertiary} fill="rgba(120, 220, 119, 0.2)" strokeWidth={2} />
          </Animated.View>
          <Text style={styles.title}>Order Confirmed!</Text>
          <Text style={styles.subtitle}>
            Your meal will arrive in <Text style={styles.subtitleAccent}>25-30 minutes</Text>
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.orderId}>Order #{snapshot.orderId}</Text>
            <View style={styles.optimizedChip}>
              <Zap size={12} color={COLORS.secondary} />
              <Text style={styles.optimizedText}>AI OPTIMIZED</Text>
            </View>
          </View>

          <View style={styles.itemsList}>
            {snapshot.items.map((ci) => {
              const item = getItemById(ci.itemId);
              return (
                <View key={ci.itemId} style={styles.itemRow}>
                  <View style={styles.itemImageWrap}>
                    {item?.image ? (
                      <Image source={{ uri: item.image }} style={styles.itemImage} />
                    ) : (
                      <View style={[styles.itemImage, styles.itemImagePlaceholder]} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName} numberOfLines={1}>{ci.name}</Text>
                    <Text style={styles.itemSub}>{ci.qty}x</Text>
                  </View>
                  <Text style={styles.itemPrice}>${(ci.price * ci.qty).toFixed(2)}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.totalDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${grand.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.deliveryCard}>
          <View style={styles.deliveryHeader}>
            <Truck size={20} color={COLORS.secondary} />
            <Text style={styles.deliveryLabel}>Delivery Progress</Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '25%'] }),
                },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressText, { color: COLORS.primary }]}>Preparing</Text>
            <Text style={[styles.progressText, { opacity: 0.4 }]}>Arriving</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.trackBtn} activeOpacity={0.85}>
            <Map size={20} color={COLORS.onPrimary} />
            <Text style={styles.trackText}>Track Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.85}>
            <Text style={styles.backText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.marginMobile, paddingTop: 40, paddingBottom: 60, gap: 18 },

  hero: { alignItems: 'center', gap: 12, marginBottom: 16 },
  checkGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: 4,
    backgroundColor: COLORS.tertiary,
    opacity: 0.15,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(91, 190, 93, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(120, 220, 119, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: COLORS.text, fontSize: 28, fontWeight: '600', marginTop: 12, letterSpacing: -0.4 },
  subtitle: { color: COLORS.textVariant, fontSize: FONTS.md, textAlign: 'center', opacity: 0.9 },
  subtitleAccent: { color: COLORS.secondary, fontWeight: '700' },

  summaryCard: {
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.DEFAULT,
    padding: SPACING.gutter,
  },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  orderId: { color: COLORS.textVariant, fontSize: FONTS.md },
  optimizedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(175, 141, 17, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(233, 195, 73, 0.2)',
  },
  optimizedText: { color: COLORS.secondaryFixed, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  itemsList: { gap: 12 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemImageWrap: { width: 48, height: 48, borderRadius: 12, overflow: 'hidden', backgroundColor: COLORS.surfaceHigh },
  itemImage: { width: '100%', height: '100%' },
  itemImagePlaceholder: { backgroundColor: COLORS.surfaceHigh },
  itemName: { color: COLORS.text, fontSize: FONTS.md, fontWeight: '600' },
  itemSub: { color: COLORS.textVariant, fontSize: 12, opacity: 0.7, marginTop: 2 },
  itemPrice: { color: COLORS.text, fontSize: FONTS.md, fontWeight: '600' },
  totalDivider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginVertical: 16 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: COLORS.text, fontSize: FONTS.lg, fontWeight: '700' },
  totalValue: { color: COLORS.primary, fontSize: FONTS.xxl, fontWeight: '700' },

  deliveryCard: {
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.DEFAULT,
    padding: SPACING.gutter,
  },
  deliveryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  deliveryLabel: { color: COLORS.text, fontSize: FONTS.md, fontWeight: '500' },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressText: { color: COLORS.textVariant, fontSize: 12, fontWeight: '500' },

  actions: { gap: 10, marginTop: 12 },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.DEFAULT,
  },
  trackText: { color: COLORS.onPrimary, fontSize: FONTS.lg, fontWeight: '700' },
  backBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(233, 195, 73, 0.3)',
    borderRadius: RADIUS.DEFAULT,
  },
  backText: { color: COLORS.secondary, fontSize: FONTS.lg, fontWeight: '600' },
});
