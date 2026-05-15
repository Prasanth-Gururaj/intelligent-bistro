import { View, Text, StyleSheet, Image } from 'react-native';
import { CheckCircle2, ShoppingBasket } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import useMenuStore from '../store/menuStore';
import type { ChatAction } from '../services/api';

interface Props {
  actions: ChatAction[];
}

const labelForAction = (a: ChatAction): string => {
  if (a.type === 'ADD') return `Added ${a.quantity}x`;
  if (a.type === 'UPDATE') return `Updated to ${a.quantity}x`;
  if (a.type === 'REMOVE') return 'Removed';
  if (a.type === 'CLEAR') return 'Cart cleared';
  return '';
};

const titleForActions = (actions: ChatAction[]): string => {
  if (actions.every((a) => a.type === 'ADD')) return 'Items Added';
  if (actions.every((a) => a.type === 'REMOVE')) return 'Items Removed';
  if (actions.every((a) => a.type === 'UPDATE')) return 'Cart Updated';
  if (actions.some((a) => a.type === 'CLEAR')) return 'Cart Cleared';
  return 'Cart Updated';
};

export default function ActionSummaryCard({ actions }: Props) {
  const getItemById = useMenuStore((s) => s.getItemById);
  if (!actions.length) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.glow} />
      <View style={styles.card}>
        <View style={styles.bgIcon}>
          <ShoppingBasket size={56} color={COLORS.secondary} />
        </View>

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>CART ACTION SUMMARY</Text>
            <Text style={styles.title}>{titleForActions(actions)}</Text>
          </View>
          <View style={styles.checkWrap}>
            <CheckCircle2 size={22} color={COLORS.secondary} fill={COLORS.secondary} strokeWidth={1.5} />
          </View>
        </View>

        <View style={styles.itemsList}>
          {actions.map((action, idx) => {
            const item = action.itemId ? getItemById(action.itemId) : null;
            const name = item?.name ?? action.itemName ?? (action.type === 'CLEAR' ? 'Entire cart' : 'Item');
            return (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <View style={styles.itemImageWrap}>
                    {item?.image ? (
                      <Image source={{ uri: item.image }} style={styles.itemImage} />
                    ) : (
                      <View style={[styles.itemImage, styles.itemImagePlaceholder]} />
                    )}
                  </View>
                  <View style={styles.itemTextWrap}>
                    <Text style={styles.itemName} numberOfLines={1}>{name}</Text>
                    <Text style={styles.itemSub}>{labelForAction(action)}</Text>
                  </View>
                </View>
                {action.quantity ? (
                  <Text style={styles.qtyLabel}>{action.quantity}x</Text>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', marginTop: 8, position: 'relative' },
  glow: {
    position: 'absolute',
    inset: 0,
    backgroundColor: COLORS.secondary,
    opacity: 0.04,
    borderRadius: RADIUS.lg,
  },
  card: {
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: RADIUS.DEFAULT,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 18,
    overflow: 'hidden',
  },
  bgIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    opacity: 0.08,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  eyebrow: {
    color: COLORS.secondaryFixed,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '600' },
  checkWrap: {
    backgroundColor: 'rgba(233, 195, 73, 0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsList: { gap: 8 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  itemImageWrap: { width: 40, height: 40, borderRadius: 10, overflow: 'hidden', backgroundColor: COLORS.surface },
  itemImage: { width: '100%', height: '100%' },
  itemImagePlaceholder: { backgroundColor: COLORS.surfaceHigh },
  itemTextWrap: { flex: 1 },
  itemName: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  itemSub: { color: COLORS.textVariant, fontSize: 10, opacity: 0.7, marginTop: 2 },
  qtyLabel: { color: COLORS.secondary, fontSize: 13, fontWeight: '700' },
});
