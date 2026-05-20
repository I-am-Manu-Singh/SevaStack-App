import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { 
  User, 
  Settings, 
  CreditCard, 
  ShieldCheck, 
  LogOut,
  ChevronRight,
  HelpCircle,
  Users,
  Briefcase,
  Store,
  RefreshCw,
  Zap,
  Activity
} from 'lucide-react-native';
import { Spacing, Typography } from '@/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { MOCK_SESSION } from '@/constants/Auth';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { IdentityWidget, SubscriptionWidget } from '@/components/ProfileWidgets';
import { GlassCard } from '@/components/GlassCard';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { colors, t, theme, userRole: role, setUserRole, session, profile, businessType } = useApp();

  const switchRole = () => {
    Alert.alert(
      t('switch_role_title' as any) || "Switch Account Profile",
      "Select a profile mode for local development and testing:",
      [
        {
          text: "🎓 Student / Resident",
          onPress: () => {
            setUserRole('customer');
            Alert.alert("Success", "Switched to Student/Resident view.");
          }
        },
        {
          text: "🏪 Merchant Partner",
          onPress: () => {
            setUserRole('merchant');
            Alert.alert("Success", "Switched to Merchant Partner view.");
          }
        },
        {
          text: "🛡️ System Administrator",
          onPress: () => {
            setUserRole('admin');
            Alert.alert("Success", "Switched to System Administrator view.");
          }
        },
        {
          text: t('cancel'),
          style: "cancel"
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      t('logout'),
      t('confirm_logout_desc'),
      [
        { text: t('cancel'), style: "cancel" },
        { 
          text: t('logout'), 
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) Alert.alert("Error", error.message);
          }
        }
      ]
    );
  };

  const handleItemPress = (item: any) => {
    if (item.route) {
      router.push(item.route as any);
    } else {
      if (item.id === '2') {
        if (role === 'customer') {
          router.push('/profile/ledger' as any);
        } else {
          router.push('/settings/platform-ledger' as any);
        }
      } else if (item.id === 'rewards') {
        Alert.alert(
          t('my_rewards' as any) || "My Rewards",
          "🎉 You have 250 SevaCoins!\n\nUse your coins to redeem laundry coupons or cafe discounts in Kota student zone.",
          [{ text: t('cool') }]
        );
      } else if (item.id === 'addresses') {
        Alert.alert(
          t('saved_addresses' as any) || "Saved Addresses",
          "📍 Hostel 3, Room 102 (Default)\n📍 Library Hall A, Seat 4\n\nYou can configure dynamic delivery pins during checkout.",
          [{ text: t('cool') }]
        );
      } else if (item.id === '4') {
        Alert.alert(
          t('help_center') || "Help Center",
          "💬 Need help?\n\nReach out to us at support@sevastack.org or connect with your PG hostel manager.",
          [{ text: t('cool') }]
        );
      } else if (item.id === '5') {
        Alert.alert(
          t('privacy_policy') || "Privacy Policy",
          "🔒 Privacy & Safety\n\nYour data is locally protected on SevaStack and shared only with verified campus merchants.",
          [{ text: t('cool') }]
        );
      }
    }
  };

  const PROFILE_SECTIONS = [
    {
      title: t('personal'),
      items: [
        { id: '1', label: t('my_profile'), icon: User, route: '/settings/edit-profile' },
        { id: '2', label: t('payment_history'), icon: CreditCard },
      ]
    },
    ...(role === 'merchant' ? [{
      title: t('business_mgmt'),
      items: [
        { id: 'settings', label: t('settings'), icon: Settings, route: '/settings' },
        { id: 'staff', label: t('staff_members'), icon: Users, route: '/(tabs)/staff' },
        { id: 'catalog', label: t('catalog'), icon: Settings, route: '/catalog' },
        { id: 'stats', label: t('revenue_analytics'), icon: Briefcase, route: '/profile/performance' },
      ]
    }] : role === 'admin' ? [{
      title: t('Platform Control' as any),
      items: [
        { id: 'settings', label: t('settings'), icon: Settings, route: '/settings' },
        { id: 'merchants', label: t('Platform Ledger' as any), icon: Store, route: '/settings/platform-ledger' },
        { id: 'billing', label: t('Platform Billing Plans' as any), icon: CreditCard, route: '/settings/billing-plans' },
      ]
    }] : [{
      title: t('customer_perks' as any),
      items: [
        { id: 'settings', label: t('settings'), icon: Settings, route: '/settings' },
        { id: 'rewards', label: t('my_rewards' as any), icon: Store },
        { id: 'addresses', label: t('saved_addresses' as any), icon: ShieldCheck },
      ]
    }]),
    {
      title: t('support_legal'),
      items: [
        { id: '4', label: t('help_center'), icon: HelpCircle },
        { id: '5', label: t('privacy_policy'), icon: ShieldCheck },
      ]
    }
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ 
        title: 'Profile & Settings', 
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text, fontWeight: '800' },
        headerTintColor: colors.primary
      }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Profile Info */}
        <IdentityWidget 
          user={{ 
            name: profile?.business_name || session?.user?.user_metadata?.full_name || MOCK_SESSION.name, 
            email: session?.user?.email || MOCK_SESSION.email, 
            avatar: session?.user?.user_metadata?.avatar_url || (role === 'merchant' 
              ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' 
              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80')
          }} 
          role={role} 
          onEdit={() => router.push('/settings/edit-profile')} 
        />

        {/* Business Hub Badge Area */}
        {role === 'merchant' && (
          <View style={styles.businessBadgeRow}>
             <GlassCard style={[styles.businessBadge, { backgroundColor: colors.surface, borderColor: colors.primary + '15' }]}>
                <View style={[styles.activeDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.businessBadgeText, { color: colors.text }]}>{t(businessType as any)} {t('hub_active' as any)}</Text>
             </GlassCard>
             <TouchableOpacity 
               style={[styles.quickSettingsBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
               onPress={() => router.push('/settings')}
               activeOpacity={0.7}
              >
                <Settings size={20} color={colors.text} />
             </TouchableOpacity>
          </View>
        )}

        {/* Subscription Info Card */}
        {role === 'merchant' && <SubscriptionWidget />}

        {/* Role Switcher Dynamic Ribbon */}
        <TouchableOpacity style={styles.switcherCard} onPress={switchRole} activeOpacity={0.9}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            style={styles.switcherGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.switcherContent}>
              <RefreshCw size={18} color="#FFF" />
              <View>
                <Text style={styles.switcherTitle}>
                  {t('switch_role_title' as any)}
                </Text>
                <Text style={styles.switcherSub}>{t('active_role_prefix' as any)}: {t(role as any).toUpperCase()}</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Section List Items */}
        {PROFILE_SECTIONS.map((section, idx) => (
          <View key={idx} style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{section.title}</Text>
            <GlassCard style={{ padding: 0, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
              {section.items.map((item, itemIdx) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[
                    styles.menuItem,
                    itemIdx < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border + '15' }
                  ]}
                  onPress={() => handleItemPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconContainer, { backgroundColor: colors.primary + '08' }]}>
                      <item.icon size={18} color={colors.textMuted} />
                    </View>
                    <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                  </View>
                  <ChevronRight size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </GlassCard>
          </View>
        ))}

        {/* Logout Control */}
        <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.error + '25' }]} onPress={handleLogout} activeOpacity={0.7}>
          <LogOut size={18} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>{t('sign_out_account')}</Text>
        </TouchableOpacity>

        <Text style={[styles.versionTxt, { color: colors.textMuted }]}>SevaStackKota • Version 2.4.0</Text>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  businessBadgeRow: {
    marginBottom: Spacing.xl,
    flexDirection: 'row',
  },
  businessBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 10,
    borderWidth: 1,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  businessBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickSettingsBtn: {
    width: 50,
    height: 50,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
  },
  switcherCard: {
    marginBottom: Spacing.xl,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  switcherGradient: {
    padding: 16,
  },
  switcherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switcherTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  switcherSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  logoutText: {
    fontWeight: '800',
    fontSize: 15,
  },
  versionTxt: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    marginTop: Spacing.xl,
  }
});
