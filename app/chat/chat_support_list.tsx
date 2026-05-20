import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { router, Stack } from 'expo-router';
import { Search, ChevronRight, MessageSquareOff } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { ChatItemWidget } from '@/components/ChatWidgets';
import { useApp } from '@/lib/AppContext';
import { StatusBar } from 'expo-status-bar';

const CHATS = [
  {
    id: '1',
    name: 'Rahul Sharma',
    lastMessage: 'Is my order ready for pickup?',
    time: '12:30 PM',
    unread: 2,
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&q=80',
    type: 'Customer'
  },
  {
    id: '2',
    name: 'Royal Cut Barber',
    lastMessage: 'Your appointment is confirmed for 4 PM.',
    time: '10:15 AM',
    unread: 0,
    avatar: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
    type: 'Merchant'
  },
  {
    id: '3',
    name: 'Sonia Mehta',
    lastMessage: 'Let me check the fabric availability.',
    time: 'Yesterday',
    unread: 0,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    type: 'Staff'
  },
];

export default function ChatListScreen() {
  const { colors, t, theme } = useApp();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ 
        title: 'Messages', 
        headerLargeTitle: true,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text
      }} />
      
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={18} color={colors.textMuted} />
          <TextInput 
            placeholder="Search messages..." 
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
      </View>

      <FlatList
        data={CHATS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ChatItemWidget
  chat={item}
  onPress={() =>
    router.push({
      pathname: '/chat/chat_support_screen',
      params: {
        id: item.id,
        name: item.name,
        avatar: item.avatar,
        type: item.type,
      },
    })
  }
/>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MessageSquareOff size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No messages yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    ...Typography.body,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    ...Typography.body,
    marginTop: 16,
  },
});
