import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Image
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Send, Image as ImageIcon, Plus, Info } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';

const INITIAL_MESSAGES = [
  { id: '1', text: 'Hello! I wanted to ask about the haircut appointment.', sender: 'them', time: '10:00 AM' },
  { id: '2', text: 'Sure, how can I help you?', sender: 'me', time: '10:02 AM' },
  { id: '3', text: 'Is it possible to shift it to 4 PM instead of 3 PM?', sender: 'them', time: '10:05 AM' },
];

export default function ChatConversationScreen() {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: inputText,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setInputText('');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen 
        options={{ 
          title: 'Rahul Sharma',
          headerRight: () => (
            <TouchableOpacity style={styles.headerBtn}>
              <Info size={20} color={Colors.primary} />
            </TouchableOpacity>
          )
        }} 
      />

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View style={[
            styles.messageContainer,
            item.sender === 'me' ? styles.myMessage : styles.theirMessage
          ]}>
            <LinearGradient
              colors={item.sender === 'me' ? [Colors.primary, '#4F46E5'] : [Colors.surface, Colors.surface]}
              style={styles.bubble}
            >
              <Text style={[
                styles.messageText,
                item.sender === 'me' ? styles.myMessageText : styles.theirMessageText
              ]}>
                {item.text}
              </Text>
            </LinearGradient>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        )}
      />

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TouchableOpacity style={styles.attachBtn}>
          <Plus size={24} color={Colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.attachBtn}>
          <ImageIcon size={24} color={Colors.textMuted} />
        </TouchableOpacity>
        
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
        </View>

        <TouchableOpacity 
          style={[styles.sendBtn, !inputText.trim() && styles.disabledSend]} 
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Send size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBtn: {
    padding: 8,
  },
  messageList: {
    padding: Spacing.md,
    paddingBottom: 20,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 16,
  },
  myMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 1,
  },
  messageText: {
    ...Typography.body,
    fontSize: 15,
  },
  myMessageText: {
    color: '#FFF',
  },
  theirMessageText: {
    color: Colors.text,
  },
  timeText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
    marginHorizontal: 4,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    color: Colors.text,
    ...Typography.body,
    fontSize: 14,
  },
  attachBtn: {
    padding: 4,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSend: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
});
