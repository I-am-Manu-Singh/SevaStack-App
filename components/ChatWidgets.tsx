import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ChevronRight, Check, CheckCheck } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../constants/Theme';
import { GlassCard } from './GlassCard';
import { useApp } from '../lib/AppContext';

/**
 *  Chat Item Widget
 * Premium list item for conversations
 */
export const ChatItemWidget = ({ chat, onPress }: { chat: any, onPress: () => void }) => {
  const { colors } = useApp();
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <GlassCard style={styles.chatCard}>
        <View style={styles.chatContent}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: chat.avatar }} style={styles.avatar} />
            {chat.unread > 0 && <View style={styles.onlineBadge} />}
          </View>
          
          <View style={styles.messageDetails}>
            <View style={styles.chatHeader}>
              <Text style={[styles.name, { color: colors.text }]}>{chat.name}</Text>
              <Text style={[styles.time, { color: colors.textMuted }]}>{chat.time}</Text>
            </View>
            
            <View style={styles.chatFooter}>
              <View style={styles.msgPreviewRow}>
                 {chat.unread === 0 && (
                   <CheckCheck size={14} color={colors.primary} style={{ marginRight: 4 }} />
                 )}
                 <Text 
                   numberOfLines={1} 
                   style={[
                     styles.lastMessage, 
                     { color: chat.unread > 0 ? colors.text : colors.textMuted },
                     chat.unread > 0 && styles.unreadText
                   ]}
                 >
                   {chat.lastMessage}
                 </Text>
              </View>
              
              {chat.unread > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.unreadCount}>{chat.unread}</Text>
                </View>
              )}
            </View>
          </View>
          
          <ChevronRight size={16} color={colors.textMuted} style={styles.chevron} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatCard: {
    marginBottom: 8,
    padding: 12,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 20,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  messageDetails: {
    flex: 1,
    marginLeft: 14,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  time: {
    fontSize: 10,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  msgPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  lastMessage: {
    fontSize: 13,
  },
  unreadText: {
    fontWeight: '700',
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  chevron: {
    marginLeft: 8,
  },
});
