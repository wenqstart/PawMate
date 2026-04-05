import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme';
import { t } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage, subscribeToMessages, Message } from '../firebase/auth';

interface ChatScreenProps {
  route: any;
  navigation: any;
}

export default function ChatScreen({ route, navigation }: ChatScreenProps) {
  const { matchId, match } = route.params;
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Get other pet info
  const getOtherPet = () => {
    if (!match?.petDetails || !user) return null;
    return match.petDetails[0].ownerId === user.uid
      ? match.petDetails[1]
      : match.petDetails[0];
  };

  const otherPet = getOtherPet();

  useEffect(() => {
    const unsubscribe = subscribeToMessages(matchId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [matchId]);

  const handleSend = async () => {
    if (!inputText.trim() || !user || !userProfile) return;

    setLoading(true);
    try {
      await sendMessage(matchId, user.uid, userProfile.nickname || 'User', inputText.trim());
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setLoading(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === user?.uid;

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myBubble : styles.otherBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={styles.messageTime}>
            {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header with pet info */}
      {otherPet && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{otherPet.name}</Text>
          <Text style={styles.headerSubtitle}>{otherPet.breed}</Text>
        </View>
      )}

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        inverted={false}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('typeMessage')}
          placeholderTextColor={COLORS.textTertiary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || loading}
        >
          <Ionicons name="send" size={20} color={COLORS.textInverse} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  messagesList: {
    padding: SPACING.md,
  },
  messageContainer: {
    marginBottom: SPACING.md,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  myBubble: {
    backgroundColor: COLORS.primary,
  },
  otherBubble: {
    backgroundColor: COLORS.surface,
  },
  messageText: {
    fontSize: FONT_SIZE.md,
  },
  myMessageText: {
    color: COLORS.textInverse,
  },
  otherMessageText: {
    color: COLORS.text,
  },
  messageTime: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: SPACING.sm,
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});