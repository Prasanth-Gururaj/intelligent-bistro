import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import useCartStore from '../store/cartStore';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { Minus, Plus, X } from 'lucide-react-native';

interface CartSheetProps {
  visible: boolean;
  onClose: () => void;
  onPlaceOrder: () => void;
}

export default function CartSheet({ visible, onClose, onPlaceOrder }: CartSheetProps) {
  const { items, total, updateQty, removeItem } = useCartStore();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Cart</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Cart Items or Empty State */}
          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Your cart is empty</Text>
            </View>
          ) : (
            <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={false}>
              {items.map((item) => (
                <View key={item.itemId} style={styles.cartItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemTotal}>${(item.price * item.qty).toFixed(2)}</Text>
                  </View>
                  <View style={styles.qtyControls}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQty(item.itemId, Math.max(0, item.qty - 1))}
                    >
                      <Minus size={16} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.qty}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQty(item.itemId, item.qty + 1)}
                    >
                      <Plus size={16} color={COLORS.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removeItem(item.itemId)}
                    >
                      <X size={16} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Footer */}
          {items.length > 0 && (
            <View style={styles.footer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
              </View>
              <TouchableOpacity style={styles.placeOrderBtn} onPress={onPlaceOrder}>
                <Text style={styles.placeOrderText}>Place Order</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: FONTS.lg,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONTS.md,
  },
  itemsContainer: {
    maxHeight: '50%',
    marginBottom: SPACING.md,
  },
  cartItem: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  itemName: {
    color: COLORS.text,
    fontSize: FONTS.md,
    fontWeight: '600',
  },
  itemTotal: {
    color: COLORS.accent,
    fontSize: FONTS.md,
    fontWeight: '600',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qtyText: {
    color: COLORS.text,
    fontWeight: 'bold',
    minWidth: 28,
    textAlign: 'center',
    fontSize: FONTS.md,
  },
  removeBtn: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  totalLabel: {
    color: COLORS.text,
    fontSize: FONTS.lg,
    fontWeight: 'bold',
  },
  totalAmount: {
    color: COLORS.accent,
    fontSize: FONTS.lg,
    fontWeight: 'bold',
  },
  placeOrderBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  placeOrderText: {
    color: COLORS.textDark,
    fontSize: FONTS.lg,
    fontWeight: 'bold',
  },
});
