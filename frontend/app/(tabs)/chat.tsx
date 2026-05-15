import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Send, X, Sparkles, Flame, Salad, Wand2, Coffee, Cake } from 'lucide-react-native';
import ChatBubble from '../../components/ChatBubble';
import SuggestionCard from '../../components/SuggestionCard';
import ActionSummaryCard from '../../components/ActionSummaryCard';
import useChatStore, { Message } from '../../store/chatStore';
import useCartStore from '../../store/cartStore';
import useMenuStore from '../../store/menuStore';
import { sendChatMessage } from '../../services/api';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants/theme';

const PROMPT_CHIPS = [
  { icon: Flame, label: 'Something spicy', text: 'I want something spicy' },
  { icon: Salad, label: 'Something light', text: 'Show me something light and healthy' },
  { icon: Wand2, label: 'Surprise me', text: 'Surprise me — pick something for me' },
  { icon: Coffee, label: 'A drink', text: 'What drinks do you have?' },
  { icon: Cake, label: 'Dessert', text: "What's good for dessert?" },
];

const TypingIndicator = () => {
  const dots = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.typingWrap}>
      <View style={styles.typingAvatar}>
        <Sparkles size={14} color={COLORS.secondary} fill={COLORS.secondary} />
      </View>
      <View style={styles.typingBubble}>
        {dots.map((dot, i) => (
          <Animated.View key={i} style={[styles.typingDot, { opacity: dot }]} />
        ))}
      </View>
    </View>
  );
};

export default function ChatScreen() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);
  const { messages, addMessage, clearHistory } = useChatStore();
  const { items, addItem, removeItem, updateQty, clearCart } = useCartStore();
  const getItemById = useMenuStore((s) => s.getItemById);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    addMessage({ role: 'user', content: trimmed });
    setInput('');
    setLoading(true);

    try {
      const lastMessages = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
      const result = await sendChatMessage(trimmed, items, lastMessages);

      if (result.actions && result.actions.length) {
        for (const action of result.actions) {
          if (action.type === 'ADD' && action.itemId) {
            const menuItem = getItemById(action.itemId);
            const price = menuItem?.price ?? 0;
            const name = menuItem?.name ?? action.itemName ?? action.itemId;
            const qty = action.quantity ?? 1;
            for (let i = 0; i < qty; i++) addItem({ itemId: action.itemId, name, price });
          } else if (action.type === 'REMOVE' && action.itemId) {
            removeItem(action.itemId);
          } else if (action.type === 'UPDATE' && action.itemId && action.quantity != null) {
            updateQty(action.itemId, action.quantity);
          } else if (action.type === 'CLEAR') {
            clearCart();
          }
        }
      }

      addMessage({
        role: 'assistant',
        content: result.reply,
        actions: result.actions,
        suggestions: result.suggestions,
      });
    } catch {
      addMessage({ role: 'assistant', content: 'ERROR: Sorry, I could not connect right now. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [loading, messages, items, addMessage, addItem, removeItem, updateQty, clearCart, getItemById]);

  const renderMessage = ({ item: msg }: { item: Message }) => {
    const suggestionItems = (msg.suggestions ?? [])
      .map((id) => getItemById(id))
      .filter((i): i is NonNullable<typeof i> => Boolean(i));
    const hasActions = msg.actions && msg.actions.length > 0;
    const hasSuggestions = suggestionItems.length > 0;

    return (
      <View style={styles.messageContainer}>
        <ChatBubble message={msg} />
        {hasActions && (
          <View style={styles.aiExtraWrap}>
            <ActionSummaryCard actions={msg.actions!} />
          </View>
        )}
        {hasSuggestions && (
          <View style={styles.aiExtraWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsScroll}
            >
              {suggestionItems.map((it) => (
                <SuggestionCard key={it.id} item={it} />
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <X size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Assistant</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.statusChip}>
            <Sparkles size={12} color={COLORS.secondary} fill={COLORS.secondary} />
            <Text style={styles.statusText}>Expert Online</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={
            messages.length === 0 ? (
              <View style={styles.welcomeWrap}>
                <View style={styles.welcomeAvatar}>
                  <Sparkles size={28} color={COLORS.secondary} fill={COLORS.secondary} />
                </View>
                <Text style={styles.welcomeTitle}>Hi, I'm your AI Bistro Expert</Text>
                <Text style={styles.welcomeSub}>Tell me what you're craving, or tap a suggestion below to get started.</Text>
              </View>
            ) : null
          }
          ListFooterComponent={loading ? <TypingIndicator /> : null}
        />

        <View style={styles.bottomPanel}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {PROMPT_CHIPS.map((c, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.chip}
                onPress={() => send(c.text)}
                disabled={loading}
                activeOpacity={0.7}
              >
                <c.icon size={14} color={COLORS.secondary} />
                <Text style={styles.chipText}>{c.label}</Text>
              </TouchableOpacity>
            ))}
            {messages.length > 0 && (
              <TouchableOpacity
                style={[styles.chip, styles.clearChip]}
                onPress={() => {
                  clearHistory();
                  clearCart();
                }}
                activeOpacity={0.7}
              >
                <X size={14} color={COLORS.error} />
                <Text style={[styles.chipText, { color: COLORS.error }]}>Clear chat</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <View style={styles.inputWrap}>
            <Sparkles size={20} color="rgba(221, 193, 174, 0.5)" />
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask anything about the menu..."
              placeholderTextColor="rgba(221, 193, 174, 0.4)"
              style={styles.input}
              editable={!loading}
              multiline
              onSubmitEditing={() => send(input)}
              blurOnSubmit
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendBtn, (loading || !input.trim()) && styles.sendBtnDisabled]}
              onPress={() => send(input)}
              disabled={loading || !input.trim()}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.onPrimary} size="small" />
              ) : (
                <Send size={20} color={COLORS.onPrimary} fill={COLORS.onPrimary} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>AI may recommend pairings based on your preferences</Text>
        </View>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: COLORS.primary, fontSize: 20, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(175, 141, 17, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusText: { color: COLORS.secondary, fontSize: 12, fontWeight: '500' },

  list: { paddingHorizontal: SPACING.marginMobile, paddingTop: 20, paddingBottom: 20 },
  messageContainer: { gap: 12 },
  aiExtraWrap: { paddingLeft: 40 },
  cardsScroll: { gap: 12, paddingRight: 20 },

  welcomeWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 30 },
  welcomeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(175, 141, 17, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(233, 195, 73, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  welcomeTitle: { color: COLORS.text, fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  welcomeSub: { color: COLORS.textVariant, fontSize: 14, textAlign: 'center', opacity: 0.8, lineHeight: 20 },

  typingWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, opacity: 0.8 },
  typingAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(175, 141, 17, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(233, 195, 73, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingBubble: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: RADIUS.DEFAULT,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.secondary },

  bottomPanel: {
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: 'rgba(19, 19, 19, 0.9)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  chipsScroll: { paddingHorizontal: SPACING.marginMobile, gap: 10, paddingBottom: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(175, 141, 17, 0.1)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(233, 195, 73, 0.3)',
  },
  chipText: { color: COLORS.secondaryFixed, fontSize: 12, fontWeight: '500' },
  clearChip: { backgroundColor: 'rgba(255, 180, 171, 0.1)', borderColor: 'rgba(255, 180, 171, 0.3)' },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: SPACING.marginMobile,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(53, 53, 52, 0.6)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.DEFAULT,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONTS.md,
    paddingVertical: 8,
    maxHeight: 100,
    minHeight: 36,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  disclaimer: {
    color: 'rgba(221, 193, 174, 0.3)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },
});
