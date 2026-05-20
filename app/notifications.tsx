import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { BellOff, CheckCheck } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { NotificationItemWidget } from '@/components/NotificationWidgets';
import { useApp } from '@/lib/AppContext';

const NOTIFICATIONS = [
  { id: '1', type: 'order', title: 'New Booking', message: 'Rahul Sharma booked a Fade Haircut for 10:30 AM tomorrow.', time: '2 mins ago', isUnread: true },
  { id: '2', type: 'msg', title: 'New Message', message: 'Sonia Mehta: "Is the tailoring material delivered?"', time: '1 hour ago', isUnread: true },
  { id: '3', type: 'review', title: 'New Review', message: 'Vikram left a 5-star review for your Barber services.', time: '3 hours ago', isUnread: false },
  { id: '4', type: 'order', title: 'Payment Received', message: '₹450 received from Amit Patel via UPI.', time: 'Yesterday', isUnread: false },
];

export default function NotificationsScreen() {
  const { colors, t, theme, notifications, markAllNotificationsRead } = useApp();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen
        options={{
          title: t('notifications'),
          headerRight: () => (
            <TouchableOpacity style={styles.markReadBtn} onPress={markAllNotificationsRead}>
              <CheckCheck size={20} color={colors.primary} />
            </TouchableOpacity>
          )
        }}
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <NotificationItemWidget item={item} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <BellOff size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('no_notifications')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  listContent: {
    padding: Spacing.md,
  },
  markReadBtn: {
    marginRight: 8,
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
