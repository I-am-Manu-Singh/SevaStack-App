import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { 
  ShoppingBag, 
  UserPlus, 
  MessageSquare, 
  IndianRupee,
  Calendar,
  Zap,
  Tag,
  X
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useRouter } from 'expo-router';
import { useApp } from '@/lib/AppContext';

export default function QuickActionSheet() {
  const router = useRouter();
  const { colors, t } = useApp();

  const actions = [
    { label: 'New Booking', icon: Calendar, color: colors.primary, route: '/(tabs)/manage' },
    { label: 'Add Item', icon: Tag, color: colors.secondary, route: '/catalog' },
    { label: 'Add Staff', icon: UserPlus, color: Colors.accent, route: '/(tabs)/staff' },
    { label: 'Request Payment', icon: IndianRupee, color: Colors.success, route: '/(tabs)' },
   {
  label: 'New Broadcast',
  icon: Zap,
  color: '#f59e0b',
  route: '/chat/chat_support_list' as const,
},
    { label: 'Support Chat', icon: MessageSquare, color: colors.textMuted, route: '/support/support_screen' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Quick Actions</Text>
        <TouchableOpacity onPress={() => router.back()}>
           <X size={24} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {actions.map((action, i) => (
          <TouchableOpacity 
            key={i} 
            style={styles.actionItem} 
            onPress={() => {
              router.back();
              router.push(action.route as any);
            }}
          >
            <GlassCard style={styles.iconCard}>
               <action.icon size={28} color={action.color} />
            </GlassCard>
            <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
         <Text style={[styles.footerTxt, { color: colors.textMuted }]}>Tap an action to proceed quickly.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },
  actionItem: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCard: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerTxt: {
    fontSize: 12,
    fontWeight: '600',
  }
});
