import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  Bell, 
  ShoppingBag, 
  MessageSquare, 
  Star,
  Zap,
  ChevronRight
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../constants/Theme';
import { GlassCard } from './GlassCard';
import { useApp } from '../lib/AppContext';

/**
 *  Notification Item Widget
 * Displays various app alerts with icons and time
 */
export const NotificationItemWidget = ({ item }: { item: any }) => {
  const { colors } = useApp();
  
  const getIcon = () => {
    switch (item.type) {
      case 'order': return { icon: ShoppingBag, color: colors.primary };
      case 'msg': return { icon: MessageSquare, color: colors.secondary };
      case 'review': return { icon: Star, color: colors.accent };
      default: return { icon: Zap, color: colors.primary };
    }
  };

  const { icon: Icon, color } = getIcon();

  return (
    <TouchableOpacity activeOpacity={0.7}>
      <GlassCard style={styles.card}>
        <View style={styles.notifContent}>
           <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
              <Icon size={20} color={color} />
           </View>
           <View style={styles.info}>
              <View style={styles.header}>
                 <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                 <Text style={[styles.time, { color: colors.textMuted }]}>{item.time}</Text>
              </View>
              <Text style={[styles.desc, { color: colors.textMuted }]} numberOfLines={2}>
                 {item.message}
              </Text>
           </View>
           {item.isUnread && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginBottom: 8,
  },
  notifContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  time: {
    fontSize: 10,
  },
  desc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  }
});
