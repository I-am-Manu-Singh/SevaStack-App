import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import {
   TrendingUp,
   Users,
   IndianRupee,
   Calendar,
   Award,
   ChevronUp,
   ChevronDown,
   Sparkles
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';

export default function PerformanceScreen() {
   const { colors } = useApp();

   const GROWTH_STATS = [
      { label: 'Total Revenue', value: '₹42,850', trend: '+12%', up: true },
      { label: 'New Students', value: '14', trend: '+4', up: true },
      { label: 'Retention Rate', value: '94%', trend: '-2%', up: false },
   ];

   return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
         <Stack.Screen options={{ title: 'Business Performance' }} />
         <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            {/* Achievement Card */}
            <GlassCard style={styles.awardCard}>
               <LinearGradient
                  colors={[colors.secondary + '20', colors.primary + '20']}
                  style={styles.awardBg}
               >
                  <Award size={40} color={colors.accent} />
                  <View style={styles.awardContent}>
                     <Text style={[styles.awardTitle, { color: colors.text }]}>Top Merchant - Kota</Text>
                     <Text style={[styles.awardSub, { color: colors.textMuted }]}>You are in the top 5% of Mess providers this month!</Text>
                  </View>
               </LinearGradient>
            </GlassCard>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Growth Summary</Text>
            <View style={styles.statsGrid}>
               {GROWTH_STATS.map((stat, idx) => (
                  <GlassCard key={idx} style={styles.statItem}>
                     <Text style={[styles.statLab, { color: colors.textMuted }]}>{stat.label}</Text>
                     <Text style={[styles.statVal, { color: colors.text }]}>{stat.value}</Text>
                     <View style={styles.trendRow}>
                        {stat.up ? <ChevronUp size={14} color="#10B981" /> : <ChevronDown size={14} color="#F43F5E" />}
                        <Text style={[styles.trendTxt, { color: stat.up ? '#10B981' : '#F43F5E' }]}>{stat.trend}</Text>
                     </View>
                  </GlassCard>
               ))}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Weekly Trends</Text>
            <GlassCard style={styles.chartCard}>
               <View style={styles.chartPlaceholder}>
                  <View style={[styles.bar, { height: '40%', backgroundColor: colors.primary + '40' }]} />
                  <View style={[styles.bar, { height: '60%', backgroundColor: colors.primary + '60' }]} />
                  <View style={[styles.bar, { height: '45%', backgroundColor: colors.primary + '40' }]} />
                  <View style={[styles.bar, { height: '85%', backgroundColor: colors.primary }]} />
                  <View style={[styles.bar, { height: '55%', backgroundColor: colors.primary + '40' }]} />
                  <View style={[styles.bar, { height: '70%', backgroundColor: colors.primary + '60' }]} />
                  <View style={[styles.bar, { height: '90%', backgroundColor: colors.accent }]} />
               </View>
               <View style={styles.chartLabels}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <Text key={`day-${i}`} style={styles.chartLab}>{d}</Text>)}
               </View>
            </GlassCard>

            <TouchableOpacity
               style={[styles.reportBtn, { backgroundColor: colors.primary }]}
               onPress={() => console.log("Export Report")}
            >
               <Text style={styles.reportBtnText}>Download Monthly Report (PDF)</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
         </ScrollView>
      </View>
   );
}

import { LinearGradient } from 'expo-linear-gradient';

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   scrollContent: {
      padding: Spacing.md,
   },
   awardCard: {
      padding: 0,
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 24,
   },
   awardBg: {
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
   },
   awardContent: {
      flex: 1,
   },
   awardTitle: {
      fontSize: 16,
      fontWeight: '800',
   },
   awardSub: {
      fontSize: 11,
      marginTop: 4,
   },
   sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 16,
   },
   statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
   },
   statItem: {
      width: '31%',
      padding: 12,
      alignItems: 'center',
      gap: 4,
   },
   statLab: {
      fontSize: 9,
      fontWeight: '700',
      textAlign: 'center',
   },
   statVal: {
      fontSize: 15,
      fontWeight: '800',
   },
   trendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
   },
   trendTxt: {
      fontSize: 9,
      fontWeight: '900',
   },
   chartCard: {
      padding: 24,
      height: 200,
      justifyContent: 'flex-end',
   },
   chartPlaceholder: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: 120,
   },
   bar: {
      width: 24,
      borderRadius: 6,
   },
   chartLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
      marginTop: 12,
   },
   chartLab: {
      fontSize: 10,
      color: '#94A3B8',
      width: 24,
      textAlign: 'center',
      fontWeight: '700',
   },
   reportBtn: {
      marginTop: 24,
      height: 54,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
   },
   reportBtnText: {
      color: '#FFF',
      fontWeight: '800',
      fontSize: 14,
   }
});
