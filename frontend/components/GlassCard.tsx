import { View, StyleSheet, ViewStyle } from 'react-native';
import { ReactNode } from 'react';
import { COLORS, RADIUS } from '../constants/theme';

interface Props {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  borderColor?: string;
}

export default function GlassCard({ children, style, borderColor }: Props) {
  return (
    <View style={[styles.card, borderColor ? { borderColor } : null, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(18, 18, 18, 0.7)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.DEFAULT,
    overflow: 'hidden',
  },
});
