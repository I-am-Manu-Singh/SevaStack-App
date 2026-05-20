import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BookOpen, ChevronRight, UserPlus } from 'lucide-react-native';
import { Spacing } from '../constants/Theme';
import { GlassCard } from './GlassCard';
import { useApp } from '../lib/AppContext';

/**
 * Ledger / Khata Widget
 * Critical for small merchants to manage credit
 */
export const LedgerWidget = () => {
  const { colors, t, ledger } = useApp();
  const styles = getStyles(colors);
  
  const willGet = ledger.filter(e => e.type === 'due').reduce((sum, e) => sum + e.amount, 0);
  const willGive = ledger.filter(e => e.type === 'paid').reduce((sum, e) => sum + e.amount, 0);

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
           <BookOpen size={20} color={colors.primary} />
           <Text style={[styles.title, { color: colors.text }]}>{t('khata_book' as any) || 'Digital Khata'}</Text>
        </View>
        <TouchableOpacity style={styles.viewAll}>
           <Text style={[styles.viewAllTxt, { color: colors.primary }]}>{t('view_all' as any) || 'View All'}</Text>
           <ChevronRight size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
         <View style={styles.summaryBox}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>YOU WILL GIVE</Text>
            <Text style={[styles.summaryVal, { color: colors.accent }]}>₹{willGive.toLocaleString()}</Text>
         </View>
         <View style={[styles.divider, { backgroundColor: colors.border }]} />
         <View style={styles.summaryBox}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>YOU WILL GET</Text>
            <Text style={[styles.summaryVal, { color: colors.success || '#10B981' }]}>₹{willGet.toLocaleString()}</Text>
         </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentScroll}>
         <TouchableOpacity style={[styles.addBtn, { borderColor: colors.primary }]}>
            <UserPlus size={20} color={colors.primary} />
            <Text style={[styles.addTxt, { color: colors.primary }]}>Add Client</Text>
         </TouchableOpacity>
         
         {ledger.slice(0, 5).map((entry) => (
           <TouchableOpacity key={entry.id} style={[styles.entryCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.entryName, { color: colors.text }]} numberOfLines={1}>{entry.customerName}</Text>
              <Text style={[styles.entryAmt, { color: entry.type === 'due' ? (colors.error || '#EF4444') : (colors.success || '#10B981') }]}>
                {entry.type === 'due' ? '-' : '+'} ₹{entry.amount}
              </Text>
           </TouchableOpacity>
         ))}
      </ScrollView>
    </GlassCard>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 20,
    borderRadius: 20,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4,
  },
  summaryVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  divider: {
    width: 1,
    height: '60%',
    opacity: 0.1,
  },
  recentScroll: {
    flexDirection: 'row',
  },
  addBtn: {
    paddingHorizontal: 16,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    gap: 4,
  },
  addTxt: {
    fontSize: 10,
    fontWeight: '800',
  },
  entryCard: {
    width: 110,
    height: 64,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    marginRight: 10,
  },
  entryName: {
    fontSize: 12,
    fontWeight: '700',
  },
  entryAmt: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  }
});
