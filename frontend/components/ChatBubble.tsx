import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import type { Message } from '../store/chatStore';
export default function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const isError = message.content.startsWith('ERROR:');
  const displayContent = isError ? message.content.replace('ERROR:', '').trim() : message.content;
  return (
    <View style={[styles.wrapper, isUser ? styles.userWrapper : styles.assistantWrapper]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : isError ? styles.errorBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>{displayContent}</Text>
      </View>
      <Text style={styles.timestamp}>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: { marginVertical: 4, maxWidth: '80%' },
  userWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  assistantWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { borderRadius: 16, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  userBubble: { backgroundColor: COLORS.accent, borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: COLORS.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  errorBubble: { backgroundColor: COLORS.error, borderBottomLeftRadius: 4 },
  text: { fontSize: FONTS.md, lineHeight: 20 },
  userText: { color: COLORS.textDark },
  assistantText: { color: COLORS.text },
  timestamp: { color: COLORS.textMuted, fontSize: 10, marginTop: 2, marginHorizontal: 4 },
});
