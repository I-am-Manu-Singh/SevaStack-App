import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Spacing } from '../constants/Theme';
import { GlassCard } from './GlassCard';
import { useApp } from '../lib/AppContext';
import { TrendingUp, IndianRupee } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

/**
 * Simple Bar Chart Widget
 * (Mocked visual representation using Views)
 */
export const RevenueChart = () => {
  const { colors, t } = useApp();
  const styles = getStyles(colors);
  
  const DATA = [
    { day: 'M', val: 45, current: false },
    { day: 'T', val: 65, current: false },
    { day: 'W', val: 35, current: false },
    { day: 'T', val: 85, current: false },
    { day: 'F', val: 55, current: false },
    { day: 'S', val: 95, current: false },
    { day: 'S', val: 75, current: true },
  ];

  return (
    <GlassCard style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <View>
          <Text style={[styles.chartValue, { color: colors.text }]}>₹12,450</Text>
          <Text style={[styles.chartLabel, { color: colors.textMuted }]}>{t('weekly_analytics' as any)}</Text>
        </View>
        <View style={[styles.trendIndicator, { backgroundColor: (colors.success || '#10B981') + '15' }]}>
          <TrendingUp size={16} color={colors.success || '#10B981'} />
          <Text style={[styles.trendText, { color: colors.success || '#10B981' }]}>+18%</Text>
        </View>
      </View>

      <View style={styles.barContainer}>
        {DATA.map((item, idx) => (
          <View key={idx} style={styles.barWrapper}>
            <View 
              style={[
                styles.bar, 
                { 
                  height: item.val, 
                  backgroundColor: item.current ? colors.primary : colors.textMuted + '30',
                  borderTopLeftRadius: 6,
                  borderTopRightRadius: 6,
                  borderBottomLeftRadius: 2,
                  borderBottomRightRadius: 2,
                }
              ]} 
            />
            <Text style={[styles.dayText, { color: colors.textMuted }]}>{item.day}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
};

/**
 * Business Efficiency Indicator
 */
export const EfficiencyWidget = ({ label, percentage }: { label: string, percentage: number }) => {
  const { colors } = useApp();
  const styles = getStyles(colors);
  
  return (
    <GlassCard style={styles.efficiencyCard}>
      <View style={styles.effHeader}>
         <Text style={[styles.effLabel, { color: colors.text }]}>{label}</Text>
         <Text style={[styles.effValue, { color: colors.primary }]}>{percentage}%</Text>
      </View>
      <View style={[styles.progressBg, { backgroundColor: colors.textMuted + '20' }]}>
         <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: colors.primary }]}>
             <LinearGradient
                colors={[colors.primary, colors.secondary || colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
             />
         </View>
      </View>
    </GlassCard>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  chartCard: {
    padding: 20,
    marginBottom: Spacing.lg,
    borderRadius: 20,
    borderColor: colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  chartValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  chartLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '800',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingBottom: 4,
  },
  barWrapper: {
    alignItems: 'center',
    gap: 10,
  },
  bar: {
    width: 22,
  },
  dayText: {
    fontSize: 10,
    fontWeight: '800',
  },
  efficiencyCard: {
    flex: 1,
    padding: 18,
    marginBottom: 16,
    borderRadius: 20,
    borderColor: colors.border,
  },
  effHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  effLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  effValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  }
});
