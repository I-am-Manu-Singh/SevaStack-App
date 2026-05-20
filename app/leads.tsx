import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { X, Zap, ChevronRight, MessageSquare, Phone, MapPin, Clock, Search, Filter } from 'lucide-react-native';
import { Spacing, Typography } from '@/constants/Theme';
import { useApp } from '@/lib/AppContext';
import { GlassCard } from '@/components/GlassCard';
import { MerchantLead } from '@/constants/Types';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

export default function LeadsScreen() {
  const { colors, t, theme } = useApp();
  const router = useRouter();
  const styles = getStyles(colors);
  
  const KOTA_LEADS: MerchantLead[] = [
    {
      id: 'lead-1',
      studentName: 'Aarav Sharma',
      interest: 'Hostel Room Single AC',
      time: '2 mins ago',
      distance: '0.8 km',
    },
    {
      id: 'lead-2',
      studentName: 'Priya Patel',
      interest: 'Library Seat Morning Batch',
      time: '15 mins ago',
      distance: '1.2 km',
    },
    {
      id: 'lead-3',
      studentName: 'Rohan Gupta',
      interest: 'Daily Tiffin Delivery',
      time: '45 mins ago',
      distance: '2.5 km',
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ 
        headerShown: true, 
        title: '',
        headerTransparent: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronRight size={24} color={colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity style={styles.filterBtn}>
            <Filter size={20} color={colors.text} />
          </TouchableOpacity>
        ),
      }} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
           <LinearGradient
             colors={[colors.primary + '20', 'transparent']}
             style={styles.heroGradient}
           />
           <View style={styles.headerInfo}>
              <View style={styles.liveBadge}>
                 <View style={styles.liveDot} />
                 <Text style={styles.liveTxt}>{t('live_in_kota')}</Text>
              </View>
              <Text style={styles.title}>{t('found_leads')}</Text>
              <Text style={styles.subtitle}>{t('leads_desc')}</Text>
           </View>
        </View>

        <View style={styles.searchBar}>
           <Search size={18} color={colors.textMuted} />
           <Text style={styles.searchPlaceholder}>Search by student name or location...</Text>
        </View>

        {KOTA_LEADS.map((lead) => (
          <GlassCard key={lead.id} style={styles.darkLeadCard}>
            <View style={styles.leadHeader}>
               <View style={styles.avatarContainer}>
                  <Image source={{ uri: `https://i.pravatar.cc/150?u=${lead.id}` }} style={styles.avatarImg} />
                  <View style={styles.onlineDot} />
               </View>
               <View style={{ flex: 1 }}>
                  <Text style={styles.leadName}>{lead.studentName}</Text>
                  <View style={styles.interestTag}>
                    <Text style={styles.leadInterest}>{lead.interest}</Text>
                  </View>
               </View>
               <View style={styles.timeBadge}>
                  <Text style={styles.timeTxt}>{lead.time}</Text>
               </View>
            </View>

            <View style={styles.metaRow}>
               <View style={styles.metaItem}>
                  <MapPin size={12} color={colors.textMuted} />
                  <Text style={styles.metaText}>{lead.distance} {t('away')}</Text>
               </View>
               <View style={styles.metaItem}>
                  <Clock size={12} color={colors.textMuted} />
                  <Text style={styles.metaText}>{t('recent_activity')}: 5 mins ago</Text>
               </View>
            </View>

            <View style={styles.actions}>
               <TouchableOpacity 
                 style={[styles.callBtn, { backgroundColor: colors.primary }]}
                 activeOpacity={0.8}
                >
                  <Phone size={16} color="#FFF" />
                  <Text style={styles.btnTxt}>{t('call_student')}</Text>
               </TouchableOpacity>
               <TouchableOpacity 
                 style={styles.chatBtn}
                 activeOpacity={0.8}
                >
                  <MessageSquare size={18} color={colors.text} />
               </TouchableOpacity>
            </View>
          </GlassCard>
        ))}

        <View style={styles.footerNote}>
           <View style={[styles.infoIcon, { backgroundColor: colors.secondary + '15' }]}>
              <Zap size={16} color={colors.secondary} />
           </View>
           <Text style={styles.footerTxt}>
             Leads are verified by SevaStack AI to ensure high conversion intent in the Kota educational hub.
           </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 100,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  heroSection: {
    marginBottom: 24,
    position: 'relative',
  },
  heroGradient: {
    position: 'absolute',
    top: -100,
    left: -20,
    right: -20,
    height: 300,
  },
  headerInfo: {
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveTxt: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 10,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: '85%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchPlaceholder: {
    color: colors.textMuted,
    fontSize: 14,
  },
  darkLeadCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
    borderRadius: 24,
  },
  leadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.border,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  leadName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  interestTag: {
    backgroundColor: colors.primary + '15',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  leadInterest: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  timeBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  timeTxt: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 18,
    marginBottom: 22,
    paddingLeft: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  callBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  chatBtn: {
    width: 50,
    height: 50,
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnTxt: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerTxt: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  }
});
