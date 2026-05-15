import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { COLORS, RADIUS } from '../constants/theme';

interface Props {
  label: string;
}

export default function AISparkChip({ label }: Props) {
  return (
    <View style={styles.chip}>
      <Sparkles size={12} color={COLORS.secondary} fill={COLORS.secondary} />
      <Text style={styles.text}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(175, 141, 17, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  text: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});
