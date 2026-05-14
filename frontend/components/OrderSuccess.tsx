import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import useCartStore from '../store/cartStore';
import { COLORS, SPACING, FONTS } from '../constants/theme';

interface OrderSuccessProps {
  visible: boolean;
  onBack: () => void;
}

export default function OrderSuccess({ visible, onBack }: OrderSuccessProps) {
  const { items, total } = useCartStore();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.content}>
          <Animated.View style={[styles.checkmark, { transform: [{ scale: scaleAnim }] }]}>
            <CheckCircle2 size={80} color={COLORS.success} />
          </Animated.View>
          <Text style={styles.title}>Order Placed!</Text>
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            {items.map((item) => (
              <View key={item.itemId} style={styles.summaryItem}>
                <Text style={styles.summaryItemText}>
                  {item.name} x{item.qty}
                </Text>
                <Text style={styles.summaryItemPrice}>
                  ${(item.price * item.qty).toFixed(2)}
                </Text>
              </View>
            ))}
            <View style={styles.summaryDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.summaryTotalLabel}>Total:</Text>
              <Text style={styles.summaryTotalAmount}>${total.toFixed(2)}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center' },
  content: { backgroundColor: COLORS.card, borderRadius: 16, padding: SPACING.lg, width: '85%', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  checkmark: { marginBottom: SPACING.lg },
  title: { color: COLORS.text, fontSize: FONTS.xxxl, fontWeight: 'bold', marginBottom: SPACING.md },
  summary: { width: '100%', backgroundColor: COLORS.background, borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.lg },
  summaryTitle: { color: COLORS.text, fontSize: FONTS.lg, fontWeight: '600', marginBottom: SPACING.md },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  summaryItemText: { color: COLORS.textMuted, fontSize: FONTS.md },
  summaryItemPrice: { color: COLORS.accent, fontSize: FONTS.md, fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryTotalLabel: { color: COLORS.text, fontSize: FONTS.md, fontWeight: 'bold' },
  summaryTotalAmount: { color: COLORS.accent, fontSize: FONTS.md, fontWeight: 'bold' },
  backBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, width: '100%', alignItems: 'center' },
  backBtnText: { color: COLORS.textDark, fontSize: FONTS.lg, fontWeight: 'bold' },
});
