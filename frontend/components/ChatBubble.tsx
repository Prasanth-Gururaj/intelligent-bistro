import { View, Text, StyleSheet } from 'react-native';
import { Bot } from 'lucide-react-native';
import { COLORS, RADIUS } from '../constants/theme';
import type { Message } from '../store/chatStore';

interface Props {
  message: Message;
}

export default function ChatBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const isError = message.content.startsWith('ERROR:');
  const content = isError ? message.content.replace('ERROR:', '').trim() : message.content;
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isUser) {
    return (
      <View style={styles.userWrap}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{content}</Text>
        </View>
        <Text style={styles.time}>{time}</Text>
      </View>
    );
  }

  return (
    <View style={styles.aiWrap}>
      <View style={styles.aiHeader}>
        <View style={styles.aiAvatar}>
          <Bot size={16} color={COLORS.secondary} fill={COLORS.secondary} />
        </View>
        <Text style={styles.aiLabel}>Intelligent Assistant</Text>
      </View>
      <View style={[styles.aiBubble, isError && styles.aiErrorBubble]}>
        <Text style={[styles.aiText, isError && styles.aiErrorText]}>{content}</Text>
      </View>
      <Text style={styles.timeLeft}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  userWrap: { alignSelf: 'flex-end', alignItems: 'flex-end', gap: 4, maxWidth: '85%' },
  userBubble: {
    backgroundColor: 'rgba(53, 53, 52, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: RADIUS.DEFAULT,
    borderTopRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userText: { color: COLORS.text, fontSize: 15, lineHeight: 21 },
  time: { color: 'rgba(221, 193, 174, 0.4)', fontSize: 10, paddingRight: 8 },

  aiWrap: { alignSelf: 'flex-start', alignItems: 'flex-start', gap: 4, maxWidth: '92%' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(175, 141, 17, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(233, 195, 73, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLabel: { color: COLORS.secondary, fontSize: 13, fontWeight: '600' },
  aiBubble: {
    backgroundColor: 'rgba(175, 141, 17, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(233, 195, 73, 0.2)',
    borderRadius: RADIUS.DEFAULT,
    borderTopLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 40,
  },
  aiText: { color: COLORS.text, fontSize: 15, lineHeight: 21 },
  aiErrorBubble: { backgroundColor: 'rgba(147, 0, 10, 0.4)', borderColor: COLORS.error },
  aiErrorText: { color: COLORS.error },
  timeLeft: { color: 'rgba(221, 193, 174, 0.4)', fontSize: 10, paddingLeft: 48 },
});
