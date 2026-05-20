import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { PieChart, Plus, Receipt, TrendingDown, IndianRupee, Tag } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';

export default function ExpenseTrackerScreen() {
  const { colors, theme } = useApp();
  const [expenses, setExpenses] = useState([
    { id: '1', title: 'Shop Electricity', amount: '2,400', date: '12 May 2026', category: 'Utilities' },
    { id: '2', title: 'Inventory Supplies', amount: '8,500', date: '10 May 2026', category: 'Stock' },
    { id: '3', title: 'Maintenance', amount: '1,200', date: '05 May 2026', category: 'Repairs' },
  ]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Expense Tracker', headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.primary }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Summary Card */}
        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
               <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Total Expenses (May)</Text>
               <Text style={[styles.summaryTotal, { color: colors.text }]}>₹12,100</Text>
            </View>
            <View style={[styles.iconBg, { backgroundColor: colors.error + '20' }]}>
               <TrendingDown size={24} color={colors.error} />
            </View>
          </View>
        </GlassCard>

        {/* Add Expense Button */}
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Plus size={20} color="#FFF" />
          <Text style={styles.addBtnText}>Log New Expense</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Recent Transactions</Text>
        
        {/* Expenses List */}
        {expenses.map(expense => (
          <GlassCard key={expense.id} style={styles.expenseCard}>
             <View style={styles.expenseLeft}>
                <View style={[styles.expenseIcon, { backgroundColor: colors.surface }]}>
                   <Receipt size={20} color={colors.textMuted} />
                </View>
                <View>
                   <Text style={[styles.expenseTitle, { color: colors.text }]}>{expense.title}</Text>
                   <View style={styles.categoryRow}>
                      <Tag size={10} color={colors.primary} />
                      <Text style={[styles.expenseCategory, { color: colors.primary }]}>{expense.category}</Text>
                   </View>
                </View>
             </View>
             <View style={styles.expenseRight}>
                <Text style={[styles.expenseAmount, { color: colors.error }]}>-₹{expense.amount}</Text>
                <Text style={[styles.expenseDate, { color: colors.textMuted }]}>{expense.date}</Text>
             </View>
          </GlassCard>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryTotal: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  expenseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
    borderRadius: 16,
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  expenseCategory: {
    fontSize: 11,
    fontWeight: '700',
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '900',
  },
  expenseDate: {
    fontSize: 11,
    marginTop: 4,
  }
});
