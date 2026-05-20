import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';

import { Stack, useRouter } from 'expo-router';

import {
  Zap,
  ChevronLeft,
  MessageSquare,
  Phone,
  MapPin,
  Clock,
  Search,
  Filter,
  Sparkles,
} from 'lucide-react-native';

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
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

           <Stack.Screen
        options={{
          headerShown: true,
          title: 'Leads', // Added title text here
          headerTransparent: true,
          headerTitleAlign: 'center', // Ensures the title text stays centered smoothly

          headerTitleStyle: {
            color: colors.text,
            fontWeight: '800',
            fontSize: 18,
          },

          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerBtn}
              activeOpacity={0.8}
            >
              {/* <Zap size={22} color={colors.primary} /> */}
              <ChevronLeft size={22} color={colors.text} />
            </TouchableOpacity>
          ),
          
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerBtn}
              activeOpacity={0.8}
            >
              <Filter size={18} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ======================================== */}
        {/* HERO */}
        {/* ======================================== */}

        <View style={styles.heroSection}>
          <LinearGradient
            colors={[
              `${colors.primary}28`,
              `${colors.primary}08`,
              'transparent',
            ]}
            style={styles.heroGradient}
          />
        </View>
        {/* ======================================== */}
        {/* SEARCH */}
        {/* ======================================== */}

        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Search size={18} color={colors.textMuted} />

          <TextInput
            placeholder="Search students or services..."
            placeholderTextColor={colors.textMuted}
            style={[
              styles.searchInput,
              {
                color: colors.text,
              },
            ]}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.searchFilterMini,
              {
                backgroundColor: `${colors.primary}14`,
              },
            ]}
          >
            <Sparkles size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* ======================================== */}
        {/* LEADS */}
        {/* ======================================== */}

        {KOTA_LEADS.map((lead) => (
          <GlassCard
            key={lead.id}
            style={[
              styles.leadCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* TOP */}

            <View style={styles.leadHeader}>
              <View style={styles.leftWrap}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{
                      uri: `https://i.pravatar.cc/150?u=${lead.id}`,
                    }}
                    style={styles.avatarImg}
                  />

                  <View
                    style={[
                      styles.onlineDot,
                      {
                        borderColor: colors.surface,
                      },
                    ]}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.leadName,
                      {
                        color: colors.text,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {lead.studentName}
                  </Text>

                  <View
                    style={[
                      styles.interestTag,
                      {
                        backgroundColor: `${colors.primary}14`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.leadInterest,
                        {
                          color: colors.primary,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {lead.interest}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.timeBadge,
                  {
                    backgroundColor: colors.surfaceLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.timeTxt,
                    {
                      color: colors.textMuted,
                    },
                  ]}
                >
                  {lead.time}
                </Text>
              </View>
            </View>

            {/* META */}

            <View
              style={[
                styles.metaContainer,
                {
                  borderTopColor: colors.border,
                },
              ]}
            >
              <View style={styles.metaItem}>
                <MapPin size={13} color={colors.textMuted} />

                <Text
                  style={[
                    styles.metaText,
                    {
                      color: colors.textMuted,
                    },
                  ]}
                >
                  {lead.distance} {t('away')}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Clock size={13} color={colors.textMuted} />

                <Text
                  style={[
                    styles.metaText,
                    {
                      color: colors.textMuted,
                    },
                  ]}
                >
                  Active 5 mins ago
                </Text>
              </View>
            </View>

            {/* ACTIONS */}

            <View style={styles.actions}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.callBtn,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                <Phone size={16} color="#FFF" />

                <Text style={styles.btnTxt}>
                  {t('call_student')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.chatBtn,
                  {
                    backgroundColor: colors.surfaceLight,
                    borderColor: colors.border,
                  },
                ]}
              >
                <MessageSquare
                  size={18}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
          </GlassCard>
        ))}

        {/* ======================================== */}
        {/* FOOTER */}
        {/* ======================================== */}

        <View
          style={[
            styles.footerNote,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.infoIcon,
              {
                backgroundColor: `${colors.secondary}18`,
              },
            ]}
          >
            <Zap size={16} color={colors.secondary} />
          </View>

          <Text
            style={[
              styles.footerTxt,
              {
                color: colors.textMuted,
              },
            ]}
          >
            Leads are verified by SevaStack AI for higher
            conversion probability across Kota's student
            ecosystem. Humanity finally automated cold leads.
            Beautiful dystopia.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 96,
      paddingBottom: 40,
    },

    headerBtn: {
      width: 42,
      height: 42,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },

    heroSection: {
      marginBottom: 26,
      position: 'relative',
    },

    heroGradient: {
      position: 'absolute',
      top: -140,
      left: -40,
      right: -40,
      height: 340,
    },

    heroContent: {
      alignItems: 'center',
    },

    liveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 100,
      marginBottom: 18,
      backgroundColor: 'rgba(239,68,68,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.25)',
    },

    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 6,
      backgroundColor: '#EF4444',
    },

    liveTxt: {
      color: '#EF4444',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1.4,
      textTransform: 'uppercase',
    },

    title: {
      fontSize: 34,
      fontWeight: '900',
      color: colors.text,
      letterSpacing: -1.2,
      textAlign: 'center',
    },

    subtitle: {
      marginTop: 12,
      fontSize: 15,
      lineHeight: 24,
      color: colors.textMuted,
      textAlign: 'center',
      maxWidth: '90%',
      fontWeight: '500',
    },

    searchBar: {
      height: 56,
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 16,
      marginBottom: 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    searchInput: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
    },

    searchFilterMini: {
      width: 30,
      height: 30,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },

    leadCard: {
      padding: 18,
      marginBottom: 16,
      borderRadius: 26,
      borderWidth: 1,
    },

    leadHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },

    leftWrap: {
      flex: 1,
      flexDirection: 'row',
      gap: 14,
    },

    avatarContainer: {
      position: 'relative',
    },

    avatarImg: {
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor: colors.border,
    },

    onlineDot: {
      position: 'absolute',
      bottom: -1,
      right: -1,
      width: 14,
      height: 14,
      borderRadius: 8,
      backgroundColor: '#10B981',
      borderWidth: 3,
    },

    leadName: {
      fontSize: 17,
      fontWeight: '800',
      marginBottom: 6,
      letterSpacing: -0.3,
    },

    interestTag: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      maxWidth: '100%',
    },

    leadInterest: {
      fontSize: 11,
      fontWeight: '700',
    },

    timeBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      alignSelf: 'flex-start',
    },

    timeTxt: {
      fontSize: 10,
      fontWeight: '800',
    },

    metaContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 18,
      marginTop: 18,
      paddingTop: 14,
      borderTopWidth: 1,
    },

    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    metaText: {
      fontSize: 12,
      fontWeight: '600',
    },

    actions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },

    callBtn: {
      flex: 1,
      height: 52,
      borderRadius: 18,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
    },

    btnTxt: {
      color: '#FFF',
      fontSize: 14,
      fontWeight: '800',
    },

    chatBtn: {
      width: 52,
      height: 52,
      borderRadius: 18,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    footerNote: {
      marginTop: 12,
      padding: 18,
      borderRadius: 24,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 14,
    },

    infoIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },

    footerTxt: {
      flex: 1,
      fontSize: 12,
      lineHeight: 20,
      fontWeight: '500',
    },
  });