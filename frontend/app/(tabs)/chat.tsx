import { useState, useRef, useEffect } from 'react';
import { SafeAreaView, FlatList, View, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Send } from 'lucide-react-native';
import ChatBubble from '../../components/ChatBubble';
import useChatStore from '../../store/chatStore';
import useCartStore from '../../store/cartStore';
import { sendChatMessage } from '../../services/api';
import { COLORS, SPACING, FONTS } from '../../constants/theme';

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { messages, addMessage } = useChatStore();
  const { items, addItem, removeItem, updateQty } = useCartStore();
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
          Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
        ])
      ).start();
    }
  }, [loading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    addMessage({ role: 'user', content: trimmed });
    setInput('');
    setLoading(true);

    try {
      const lastMessages = messages.slice(-8);
      const result = await sendChatMessage(trimmed, items, lastMessages);

      if (result.actions) {
        for (const action of result.actions) {
          if (action.type === 'ADD') {
            addItem({ itemId: action.itemId, name: action.itemName, price: 0 });
          } else if (action.type === 'REMOVE') {
            removeItem(action.itemId);
          } else if (action.type === 'UPDATE') {
            updateQty(action.itemId, action.quantity);
          }
        }
      }

      addMessage({ role: 'assistant', content: result.reply });
    } catch (error) {
      addMessage({ role: 'assistant', content: 'ERROR: Sorry, I could not connect right now. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <ChatBubble message={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      {loading && (
        <View style={styles.typingContainer}>
          <Animated.View style={[styles.dot, { opacity: dotAnim }]} />
          <Animated.View style={[styles.dot, { opacity: Animated.subtract(1, dotAnim) }]} />
          <Animated.View style={[styles.dot, { opacity: Animated.subtract(1, dotAnim) }]} />
        </View>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask Bistro anything..."
          placeholderTextColor={COLORS.textMuted}
          value={input}
          onChangeText={setInput}
          editable={!loading}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={loading}
        >
          <Send size={20} color={loading ? COLORS.textMuted : COLORS.textDark} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  messageList: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  typingContainer: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
  inputContainer: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, gap: SPACING.sm },
  input: { flex: 1, backgroundColor: COLORS.card, color: COLORS.text, borderRadius: 12, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: FONTS.md, borderWidth: 1, borderColor: COLORS.border, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, backgroundColor: COLORS.accent, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
});
