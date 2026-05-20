import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { IndianRupee, ArrowUpRight, ArrowDownLeft, ChevronRight, UserPlus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';


import { useApp } from '@/lib/AppContext';

export function KhataBook() {
  const router = useRouter();
  const { t, colors, ledger } = useApp();
  const totalDue = ledger
    .filter(e => e.type === 'due')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('khata_book')}</Text>
        <TouchableOpacity style={styles.addCustomer} onPress={() => router.push('/business/kirana-manager' as any)}>
          <UserPlus size={16} color={colors.primary} />
          <Text style={[styles.addTxt, { color: colors.primary }]}>{t('add_customer')}</Text>
        </TouchableOpacity>
      </View>

      <GlassCard style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <View style={[styles.iconBox, { backgroundColor: colors.error + '20' }]}>
            <ArrowUpRight size={20} color={colors.error} />
          </View>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{t('give')}</Text>
            <Text style={[styles.summaryValue, { color: colors.error }]}>₹0</Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <View style={[styles.iconBox, { backgroundColor: colors.success + '20' }]}>
            <ArrowDownLeft size={20} color={colors.success} />
          </View>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{t('get')}</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>₹{totalDue}</Text>
          </View>
        </View>
      </GlassCard>

      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('recent_entries')}</Text>
      {ledger.map((entry) => (
        <TouchableOpacity key={entry.id}>
          <GlassCard style={styles.entryCard}>
            <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
              <Text style={[styles.avatarTxt, { color: colors.text }]}>{entry.customerName[0]}</Text>
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.text }]}>{entry.customerName}</Text>
              <Text style={[styles.date, { color: colors.textMuted }]}>{entry.date}</Text>
            </View>
            <View style={styles.amountCol}>
              <Text style={[
                styles.amount,
                { color: entry.type === 'due' ? colors.error : colors.success }
              ]}>
                ₹{entry.amount}
              </Text>
              <Text style={[styles.typeTxt, { color: entry.type === 'due' ? colors.error : colors.success }]}>
                {entry.type === 'due' ? t('due') : t('paid')}
              </Text>
            </View>
            <ChevronRight size={16} color={colors.textMuted} />
          </GlassCard>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.viewAllBtn} onPress={() => router.push('/business/kirana-manager' as any)}>
        <Text style={[styles.viewAllTxt, { color: colors.text }]}>{t('view_ledger')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
  },
  addCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addTxt: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: Spacing.lg,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    padding: 8,
    borderRadius: 8,
  },
  summaryLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '700',
    marginBottom: 12,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTxt: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
  },
  date: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  amountCol: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  amount: {
    fontWeight: '800',
    fontSize: 15,
  },
  typeTxt: {
    fontSize: 9,
    fontWeight: 'bold',
    opacity: 0.6,
  },
  viewAllBtn: {
    marginTop: 8,
    alignItems: 'center',
    padding: 12,
  },
  viewAllTxt: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 13,
  }
});
