import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Sparkles, ArrowRight, ChefHat } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONTS, RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.8, duration: 1800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.cornerGlow, styles.cornerGlowTopRight]} />
      <View style={[styles.cornerGlow, styles.cornerGlowBottomLeft]} />

      <Animated.View style={[styles.amberGlow, { opacity: glowAnim }]} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoWrap}>
          <View style={styles.logoOuterGlow} />
          <View style={styles.logoCircle}>
            <ChefHat size={48} color={COLORS.secondary} strokeWidth={1.5} />
          </View>
        </View>

        <View style={styles.headlineGroup}>
          <Text style={styles.title}>Intelligent Bistro</Text>
          <Text style={styles.subtitle}>Order naturally with AI</Text>
        </View>

        <View style={styles.ctaWrap}>
          <View style={styles.sparkChip}>
            <Sparkles size={12} color={COLORS.secondary} fill={COLORS.secondary} />
            <Text style={styles.sparkChipText}>AI ENHANCED</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.ctaButton}
            onPress={() => router.replace('/(tabs)/menu')}
          >
            <Text style={styles.ctaText}>Start Ordering</Text>
            <ArrowRight size={22} color={COLORS.onPrimaryContainer} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>A CURATED CULINARY EXPERIENCE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  amberGlow: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: COLORS.secondary,
    opacity: 0.08,
  },
  cornerGlow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  cornerGlowTopRight: {
    top: -200,
    right: -200,
    backgroundColor: COLORS.primary,
    opacity: 0.06,
  },
  cornerGlowBottomLeft: {
    bottom: -200,
    left: -200,
    backgroundColor: COLORS.secondary,
    opacity: 0.06,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    zIndex: 10,
  },
  logoWrap: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoOuterGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.secondary,
    opacity: 0.18,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#0e0e0e',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 12,
  },
  headlineGroup: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.display,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.xl,
    color: COLORS.textVariant,
    opacity: 0.8,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  ctaWrap: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  sparkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(175, 141, 17, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(233, 195, 73, 0.2)',
    marginBottom: 12,
    zIndex: 2,
  },
  sparkChipText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.base,
    paddingHorizontal: 48,
    paddingVertical: 20,
    backgroundColor: COLORS.primaryContainer,
    borderRadius: RADIUS.full,
    shadowColor: COLORS.primaryContainer,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.45,
    shadowRadius: 40,
    elevation: 16,
  },
  ctaText: {
    fontSize: FONTS.xxl,
    fontWeight: '700',
    color: COLORS.onPrimaryContainer,
  },
  footer: {
    position: 'absolute',
    bottom: SPACING.lg,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(221, 193, 174, 0.4)',
    letterSpacing: 3,
  },
});
