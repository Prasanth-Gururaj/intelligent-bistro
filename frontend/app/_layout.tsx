import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import useMenuStore from '../store/menuStore';
import { fetchMenu, fetchCategories } from '../services/api';
import { COLORS } from '../constants/theme';

export default function RootLayout() {
  const { setData, setLoading, setError } = useMenuStore();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [items, categories] = await Promise.all([fetchMenu(), fetchCategories()]);
        if (mounted) setData(items, categories);
      } catch (err) {
        if (mounted) setError('Failed to load menu. Please check your connection.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="order-success" options={{ presentation: 'modal', animation: 'fade' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
