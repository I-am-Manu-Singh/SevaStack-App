import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Platform
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BookingModal } from '@/components/BookingModal';
import { Stack, useRouter } from 'expo-router';
import {
  BarChart3,
  Calendar,
  Clock,
  Users,
  IndianRupee,
  ChevronRight,
  Plus,
  Sparkles,
  Bell,
  Scissors,
  Shirt,
  Waves,
  Coffee,
  Search,
  MapPin,
  Star,
  Stethoscope,
  Truck,
  Utensils,
  Gem,
  RefreshCw,
  Building,
  BookOpen,
  Pencil,
  Map,
  Plane,
  Car,
  Hammer,
  GraduationCap,
  Settings,
  Mic,
  QrCode as QrIcon,
  X,
  Zap,
  TrendingUp,
  ShoppingBag,
  Store,
  Award
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { getGlobalStyles } from '@/constants/GlobalStyles';
import { useApp } from '@/lib/AppContext';
import { GlassCard } from '@/components/GlassCard';
import { BusinessType } from '@/constants/Types';
import { BUSINESS_CONFIGS, DEFAULT_CONFIG } from '@/constants/AppConfigs';
import { MOCK_SESSION } from '@/constants/Auth';
import { StatWidget, LeadWidget, QuickPayWidget, InsightWidget } from '@/components/DashboardWidgets';
import { RevenueChart, EfficiencyWidget } from '@/components/AnalyticsWidgets';

import { LedgerWidget } from '@/components/LedgerWidget';
import { DeliveryTrackerWidget } from '@/components/TrackerWidgets';
import { StitchingTrackerWidget, LibrarySeatMapWidget, RefillReminderWidget, HostelRoomManagementWidget, TiffinMenuWidget, SalonQueueWidget, StationeryPrintWidget } from '@/components/BusinessSpecificWidgets';
import { TrendingServiceWidget, ShopSpotlightWidget } from '@/components/CustomerWidgets';
import { useMerchantData } from '@/hooks/useMerchantData';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

const BUSINESS_TYPES: { type: BusinessType, icon: any, label: string }[] = [
  { type: 'Tiffin', icon: Utensils, label: 'Mess' },
  { type: 'Hostel', icon: Building, label: 'Hostels' },
  { type: 'Library', icon: BookOpen, label: 'Libraries' },
  { type: 'Stationery', icon: Pencil, label: 'Books' },
  { type: 'Travel', icon: Plane, label: 'Travel' },
  { type: 'Transport', icon: Car, label: 'Rides' },
  { type: 'Handyman', icon: Hammer, label: 'Repairs' },
  { type: 'Tuition', icon: GraduationCap, label: 'Classes' },
  { type: 'Kirana', icon: ShoppingBag, label: 'Groceries' },
  { type: 'Pharmacy', icon: Stethoscope, label: 'Medical' },
  { type: 'Laundry', icon: Waves, label: 'Laundry' },
  { type: 'Cafe', icon: Coffee, label: 'Cafes' },
  { type: 'Barber', icon: Scissors, label: 'Salons' },
  { type: 'Tailor', icon: Shirt, label: 'Tailors' },
  { type: 'Milk', icon: Truck, label: 'Milk' },
  { type: 'Jewelry', icon: Gem, label: 'Jewelry' },
];

const RECOMMENDED_SHOPS = [
  { id: '1', name: 'The Royal Cut', type: 'Barber', rating: 4.9, distance: '1.2 km', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&q=80' },
  { id: '2', name: 'Elite Tailors', type: 'Tailor', rating: 4.8, distance: '2.5 km', image: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=400&q=80' },
  { id: '3', name: 'Quick Wash', type: 'Laundry', rating: 4.7, distance: '0.8 km', image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&q=80' },
];

export default function AppMainScreen() {
  const { userRole, colors, theme } = useApp();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      {userRole === 'customer' ? (
        <CustomerDiscovery />
      ) : userRole === 'admin' ? (
        <AdminDashboard />
      ) : (
        <MerchantDashboard />
      )}
    </SafeAreaView>
  );
}

function AdminDashboard() {
  const { colors, t } = useApp();
  const router = useRouter();
  const [metrics, setMetrics] = useState({
    activeMerchants: 0,
    platformRev: 0,
    newStudents: 0
  });
  const [recentMerchants, setRecentMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [merchantCountRes, appointmentsRes, profilesCountRes, recentMerchantsRes] = await Promise.all([
          supabase.from('merchants').select('*', { count: 'exact', head: true }),
          supabase.from('appointments').select('price').eq('status', 'completed'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('merchants').select('*').order('created_at', { ascending: false }).limit(5)
        ]);

        const activeMerchants = merchantCountRes.count || 0;
        const platformRev = appointmentsRes.data
          ? appointmentsRes.data.reduce((sum, app) => sum + Number(app.price || 0), 0)
          : 0;
        const newStudents = profilesCountRes.count || 0;

        setMetrics({
          activeMerchants,
          platformRev,
          newStudents
        });

        if (recentMerchantsRes.data) {
          setRecentMerchants(recentMerchantsRes.data);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const formatRevenue = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    }
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value}`;
  };

  const PLATFORM_METRICS = [
    { label: 'Active Merchants', value: loading ? '...' : String(metrics.activeMerchants), icon: Building, color: '#10B981' },
    { label: 'Platform Rev', value: loading ? '...' : formatRevenue(metrics.platformRev), icon: IndianRupee, color: '#6366F1' },
    { label: 'New Students', value: loading ? '...' : String(metrics.newStudents), icon: Users, color: '#F59E0B' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: 16, letterSpacing: -0.5 }}>
          Platform Overview
        </Text>
        
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          {PLATFORM_METRICS.map((metric, i) => (
            <GlassCard key={i} style={{ flex: 1, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
               <metric.icon size={22} color={metric.color} style={{ marginBottom: 8 }} />
               <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>{metric.value}</Text>
               <Text style={{ fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 2, fontWeight: '600' }}>{metric.label}</Text>
            </GlassCard>
          ))}
        </View>

        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 12, letterSpacing: -0.2 }}>Recent Registrations</Text>
        
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : recentMerchants.length === 0 ? (
          <Text style={{ color: colors.textMuted, fontSize: 13, fontStyle: 'italic', padding: 8 }}>
            No recent registrations.
          </Text>
        ) : (
          recentMerchants.map((m) => (
            <GlassCard key={m.id} style={{ padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
               <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                 <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }} numberOfLines={1}>{m.business_name || 'Unnamed Business'}</Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                      {m.business_type || 'General'} Hub • {m.is_verified ? 'Approved' : 'Pending Auth'}
                    </Text>
                 </View>
                 <TouchableOpacity 
                   style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.primary + '18', borderRadius: 10, justifyContent: 'center', marginLeft: 8 }}
                   onPress={() => router.push('/settings/platform-ledger' as any)}
                   activeOpacity={0.7}
                 >
                    <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primary }}>Manage</Text>
                 </TouchableOpacity>
               </View>
            </GlassCard>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function CustomerDiscovery() {
  const router = useRouter();
  const { colors, t, theme, profile, session } = useApp();
  const gStyles = getGlobalStyles(colors);
  const styles = getStyles(colors, gStyles);
  const insets = useSafeAreaInsets();

  const [outstandingDues, setOutstandingDues] = useState<number>(0);
  const [loadingDues, setLoadingDues] = useState(true);

  const studentName = session?.user?.user_metadata?.full_name || MOCK_SESSION.name;

  useEffect(() => {
    async function loadDues() {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('price')
          .eq('customer_name', studentName)
          .in('status', ['confirmed', 'pending']);

        if (!error && data) {
          const total = data.reduce((sum, item) => sum + Number(item.price), 0);
          setOutstandingDues(total);
        }
      } catch (e) {
        console.warn("Could not load dues greeting stat:", e);
      } finally {
        setLoadingDues(false);
      }
    }
    loadDues();
  }, [studentName]);

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return t('good_morning');
    if (hrs < 17) return t('good_afternoon');
    return t('good_evening');
  };

  const activeTrackers = [
    {
      id: 'tiffin',
      title: t('Tiffin Service'),
      status: t('On the way 🚚'),
      detail: t('Lunch (Paneer Masala & Roti) • Delivery at 1:15 PM'),
      icon: Utensils,
      color: '#10B981',
      route: '/business/tiffin-manager',
    },
    {
      id: 'laundry',
      title: t('Laundry Order'),
      status: t('Washing 🧼'),
      detail: t('3 garments in progress • Est. ready by 5:30 PM'),
      icon: Waves,
      color: '#3B82F6',
      route: '/business/laundry-manager',
    },
    {
      id: 'library',
      title: t('Library Session'),
      status: t('Checked In 📚'),
      detail: t('Seat #B-12 at Kota Library Hub • 2h 40m remaining'),
      icon: BookOpen,
      color: '#8B5CF6',
      route: '/business/library-manager',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { paddingTop: 16 }]}
      >
        
        {/* Personalized Welcome Card */}
        <GlassCard style={{ padding: 18, marginBottom: 20, borderRadius: 24, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: '700' }}>{getGreeting()}</Text>
              <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text, marginTop: 2 }}>
                {session?.user?.user_metadata?.full_name || MOCK_SESSION.name} 👋
              </Text>
            </View>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + '18', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.primary + '30' }}>
              <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 16 }}>
                {(session?.user?.user_metadata?.full_name || MOCK_SESSION.name)[0].toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 14, marginTop: 14, borderTopWidth: 1, borderTopColor: colors.border + '30', paddingTop: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, color: colors.textMuted }}>{t('current_hostel').toUpperCase()}</Text>
              <Text style={{ fontSize: 11, color: colors.text, fontWeight: '800', marginTop: 1 }}>PG Block-A, Kota</Text>
            </View>
            <View style={{ width: 1, backgroundColor: colors.border + '30' }} />
            <TouchableOpacity 
              style={{ flex: 1 }} 
              onPress={() => router.push('/profile/ledger' as any)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 9, color: colors.textMuted }}>{t('unpaid_dues').toUpperCase()}</Text>
              <Text style={{ fontSize: 11, color: outstandingDues > 0 ? colors.error : colors.success, fontWeight: '800', marginTop: 1 }}>
                ₹{outstandingDues.toLocaleString('en-IN')} (View Ledger)
              </Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Global Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 20 }]}>
          <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder={t('search_placeholder')}
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        {/* Live Trackers Section */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>{t('live_orders')}</Text>
        {activeTrackers.map((track) => (
          <TouchableOpacity 
            key={track.id} 
            activeOpacity={0.8}
            onPress={() => router.push(track.route as any)}
          >
            <GlassCard style={{ padding: 14, marginBottom: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: track.color + '15', justifyContent: 'center', alignItems: 'center' }}>
                  <track.icon size={20} color={track.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>{track.title}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: track.color }}>{track.status}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2, fontWeight: '600' }}>{track.detail}</Text>
                </View>
                <ChevronRight size={14} color={colors.textMuted} />
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}

        {/* Dynamic Banners Slider */}
        <TouchableOpacity style={styles.promoCard} onPress={() => router.push('/catalog/ai-finder')} activeOpacity={0.9}>
           <LinearGradient
            colors={['#6366F1', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promoGradient}
           >
              <View style={styles.aiPromoContent}>
                 <Sparkles size={28} color="#FFF" />
                 <Text style={styles.aiPromoTitle}>{t('AI Style Finder')}</Text>
                 <Text style={styles.aiPromoSub}>{t('ai_promo_sub')}</Text>
              </View>
              <View style={styles.promoAction}>
                 <Text style={styles.promoActionText}>{t('try_now')}</Text>
              </View>
           </LinearGradient>
        </TouchableOpacity>

        {/* Shortcuts / Essentials Grid */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>{t('student_essentials')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 }}>
          {BUSINESS_TYPES.slice(0, 8).map(({ type, icon: Icon, label }) => {
            const routeMap: Record<string, string> = {
              'Tiffin': '/business/tiffin-manager',
              'Hostel': '/business/hostel-manager',
              'Library': '/business/library-manager',
              'Stationery': '/business/stationery-manager',
              'Travel': '/business/cab-manager',
              'Transport': '/business/movers-manager',
              'Handyman': '/business/repair-manager',
              'Tuition': '/business/tuition-manager',
            };

            const destRoute = routeMap[type] || `/business/${type.toLowerCase()}-manager`;

            return (
              <TouchableOpacity
                key={type}
                style={{ width: '23%', alignItems: 'center', marginBottom: 12 }}
                onPress={() => router.push(destRoute as any)}
                activeOpacity={0.7}
              >
                <View style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                  <Icon size={20} color={colors.primary} />
                </View>
                <Text style={{ fontSize: 10, fontWeight: '700', color: colors.text, textAlign: 'center' }}>{t(label as any)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Spotlights and Recommended */}
        <TrendingServiceWidget />
        <ShopSpotlightWidget />

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function MerchantDashboard() {
  const { businessType, setBusinessType, colors, t, theme } = useApp();
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const { data: dbData, loading, refresh } = useMerchantData();
  const gStyles = getGlobalStyles(colors);
  const styles = getStyles(colors, gStyles);
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'feed' | 'analytics'>('feed');

  const config = BUSINESS_CONFIGS[businessType] || DEFAULT_CONFIG;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const merchantProfile = dbData?.profile || { business_name: t('merchant_center') };
  const displayLeads = dbData?.leads?.length > 0 ? dbData.leads : [];
  const displayAppointments = dbData?.appointments?.length > 0 ? dbData.appointments : [];

  const stats = [
    { label: t("Today's Revenue"), value: dbData?.revenue || "₹4,250", icon: IndianRupee, color: colors.accent },
    { label: config.statLabel ? t(config.statLabel as any) : t("Active Tasks"), value: displayAppointments.length.toString(), icon: Calendar, color: colors.primary },
    { label: t("Student Leads"), value: displayLeads.length.toString(), icon: Zap, color: colors.secondary },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { paddingTop: 16 }]}
      >
        <BookingModal 
           visible={bookingModalVisible} 
           onClose={() => setBookingModalVisible(false)} 
        />

        {/* Business Type Pill Switcher */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSwitcher}>
          {BUSINESS_TYPES.map(({ type, icon: Icon, label }) => (
            <TouchableOpacity
              key={type}
              onPress={() => setBusinessType(type)}
              style={[
                styles.typeBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
                businessType === type && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              activeOpacity={0.8}
            >
              <Icon size={16} color={businessType === type ? '#FFF' : colors.textMuted} />
              <Text style={[
                styles.typeBtnText,
                { color: colors.textMuted },
                businessType === type && { color: '#FFF' }
              ]}>{t(label as any)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Dynamic Tab Switcher */}
        <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 16 }]}>
          <TouchableOpacity 
            onPress={() => setActiveTab('feed')}
            style={[styles.tab, activeTab === 'feed' && { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, { color: activeTab === 'feed' ? '#FFF' : colors.textMuted }]}>
              📋 {t('feed' as any) || 'Feed'} & Operations
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('analytics')}
            style={[styles.tab, activeTab === 'analytics' && { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, { color: activeTab === 'analytics' ? '#FFF' : colors.textMuted }]}>
              📊 {t('analytics' as any) || 'Analytics'} & Growth
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'feed' ? (
          <>
            {/* KPI Performance Highlights */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
              {stats.map((stat, idx) => (
                <StatWidget
                  key={idx}
                  label={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                />
              ))}
            </ScrollView>

            {/* Unified Operations & Manager Tools (Combined Grid) */}
            <View style={styles.quickActionsContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>{t('operational_tools')}</Text>
              <View style={styles.quickActionsGrid}>
                {[
                  { label: t('catalog'), icon: BookOpen, color: colors.primary, route: '/catalog' },
                  { label: t('inventory'), icon: ShoppingBag, color: colors.accent, route: '/tools/inventory' },
                  { label: t('staff'), icon: Users, color: colors.secondary, route: '/(tabs)/staff' },
                  { label: t('leads'), icon: Zap, color: colors.primary, route: '/leads' },
                  { label: t('chat'), icon: Users, color: colors.secondary, route: '/chat' },
                  { label: t('settings'), icon: Settings, color: colors.textMuted, route: '/settings' },
                ].map((action, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.quickActionCard}
                    onPress={() => router.push(action.route as any)}
                    activeOpacity={0.7}
                  >
                    <GlassCard style={styles.actionIconCard} padding={0}>
                      <action.icon size={20} color={action.color} />
                    </GlassCard>
                    <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Leads Preview Banner */}
            <View style={styles.leadsPreview}>
              <TouchableOpacity
                onPress={() => router.push('/leads')}
                style={[styles.leadsPreviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.8}
              >
                <View style={styles.liveBadgeSmall}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveTxtSmall}>{t('live_leads')}</Text>
                </View>
                <Text style={[styles.leadsPreviewTitle, { color: colors.text }]}>
                  {displayLeads.length} {t('students_searching')} {t(businessType as any)} {t('near_you')}
                </Text>
                <ChevronRight size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Active Business-Specific Widgets */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('active')} {t(businessType as any)} {t('feed')}</Text>
            </View>
            
            {businessType === 'Kirana' && <LedgerWidget />}
            {
              (businessType === 'Milk' || businessType === 'Tiffin' || businessType === 'Laundry') && (
                <DeliveryTrackerWidget
                  title={
                    businessType === 'Milk' ? t("Milk & Morning Dairy Deliveries") :
                    businessType === 'Laundry' ? t("Laundry Active Wash Cycles") :
                    t("Tiffin Morning Deliveries")
                  }
                  desc={
                    businessType === 'Milk' ? t("Volume updates, pauses & bottle audits") :
                    businessType === 'Laundry' ? t("Wash timelines, delicate safety & slots") :
                    t("14 active subscriptions for 7:00 AM slot")
                  }
                  onTrack={() => {
                    if (businessType === 'Milk') router.push('/business/milk-manager' as any);
                    else if (businessType === 'Laundry') router.push('/business/laundry-manager' as any);
                    else router.push('/business/tiffin-manager' as any);
                  }}
                />
              )
            }
            {businessType === 'Tailor' && <StitchingTrackerWidget order={{ name: "Wedding Suit (Rahul S.)" }} />}
            {businessType === 'Library' && <LibrarySeatMapWidget />}
            {businessType === 'Pharmacy' && <RefillReminderWidget />}
            {businessType === 'Hostel' && <HostelRoomManagementWidget />}
            {businessType === 'Tiffin' && <TiffinMenuWidget />}
            {businessType === 'Barber' && <SalonQueueWidget />}
            {businessType === 'Stationery' && <StationeryPrintWidget />}

            {/* Active Bookings Feed */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('recent_tasks')}</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/manage')} activeOpacity={0.7}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>{t('all')}</Text>
              </TouchableOpacity>
            </View>

            {
              displayAppointments.length > 0 ? displayAppointments.map((appointment: any) => (
                <GlassCard key={appointment.id} style={styles.appointmentCard}>
                  <Image source={{ uri: appointment.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80' }} style={styles.customerAvatar} />
                  <View style={styles.appointmentInfo}>
                    <Text style={[styles.customerName, { color: colors.text }]}>{appointment.customer_name || appointment.customerName}</Text>
                    <Text style={[styles.serviceName, { color: colors.textMuted }]}>{t(appointment.service_name as any || appointment.service as any)}</Text>
                    <View style={styles.timeRow}>
                      {appointment.is_subscription ? <RefreshCw size={11} color={colors.primary} /> : <Clock size={11} color={colors.textMuted} />}
                      <Text style={[styles.timeText, { color: colors.textMuted }]}>{appointment.time || new Date(appointment.scheduled_at).toLocaleTimeString()}</Text>
                    </View>
                  </View>
                  <Text style={[styles.priceText, { color: colors.accent }]}>₹{appointment.price}</Text>
                </GlassCard>
              )) : (
                <GlassCard style={styles.emptyCard}>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('no_active_prefix')} {t(businessType as any)} {t('no_active_suffix')}</Text>
                </GlassCard>
              )
            }
          </>
        ) : (
          <>
            {/* Business Analytics – Chart Insights */}
            <View style={styles.sectionHeader}>
               <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('performance_insights')}</Text>
            </View>
            <RevenueChart />
            
            <View style={styles.insightsRow}>
               <EfficiencyWidget label={t("booking_conversion")} percentage={78} />
               <EfficiencyWidget label={t("staff_efficiency")} percentage={92} />
            </View>

            <InsightWidget />

            <QuickPayWidget
              upiId={merchantProfile.upi_id || 'merchant@upi'}
              onPress={() => setQrModalVisible(true)}
            />

            <GlassCard style={styles.insightsPromo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.success + '15', justifyContent: 'center', alignItems: 'center' }}>
                  <TrendingUp size={18} color={colors.success} />
                </View>
                <Text style={[styles.promoTitle, { color: colors.text }]}>{t('marketing_boost')}</Text>
              </View>
              <Text style={[styles.promoSub, { color: colors.textMuted }]}>
                {t('students_favorited_desc')}
              </Text>
              <TouchableOpacity style={[styles.promoBtn, { backgroundColor: colors.primary }]} activeOpacity={0.8}>
                <Text style={styles.promoBtnText}>{t('create_offer')}</Text>
              </TouchableOpacity>
            </GlassCard>

            {businessType === 'Barber' && (
              <TouchableOpacity onPress={() => router.push('/catalog/ai-finder')} activeOpacity={0.9}>
                <GlassCard style={[styles.aiBanner, { borderColor: colors.primary }]}>
                  <View style={styles.aiContent}>
                    <Sparkles size={22} color={colors.secondary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.aiTitle, { color: colors.text }]}>{t(config.specialFeature as any)}</Text>
                      <Text style={[styles.aiSubtitle, { color: colors.textMuted }]}>{t('boost_sales_prefix')} {t(businessType as any)} {t('boost_sales_suffix')}</Text>
                    </View>
                    <ChevronRight size={18} color={colors.textMuted} />
                  </View>
                </GlassCard>
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={qrModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
          <GlassCard style={styles.qrCard}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('merchant_qr')}</Text>
              <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.qrContent}>
              <View style={[styles.qrPlaceholder, { backgroundColor: '#FFF' }]}>
                <QrIcon size={160} color="#000" />
              </View>
              <Text style={[styles.businessNameLarge, { color: colors.text }]}>{merchantProfile.business_name}</Text>
              <Text style={[styles.upiId, { color: colors.textMuted }]}>{merchantProfile.upi_id || 'merchant@okaxis'}</Text>
            </View>
            <TouchableOpacity style={[styles.shareBtn, { backgroundColor: colors.primary }]} activeOpacity={0.8}>
              <Text style={styles.shareBtnText}>{t('share_profile')}</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (colors: any, gStyles: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '800',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: 40,
  },
  typeSwitcher: {
    marginBottom: Spacing.md,
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
  },
  typeBtnText: {
    fontWeight: '800',
    fontSize: 12,
  },
  shareBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
  insightsPromo: {
    padding: 16,
    marginBottom: Spacing.lg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promoContent: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  promoSub: {
    fontSize: 11,
    marginTop: 2,
  },
  promoBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  promoBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  quickActionsContainer: {
    marginBottom: Spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    gap: 10,
  },
  quickActionCard: {
    alignItems: 'center',
    width: '30%',
    marginBottom: Spacing.md,
    gap: 6,
  },
  actionIconCard: {
    width: 62,
    height: 62,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  aiBanner: {
    borderWidth: 1,
    padding: Spacing.md,
    borderRadius: 20,
    marginBottom: Spacing.lg,
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  aiSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  promoCard: {
    height: 120,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 20,
  },
  promoGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  aiPromoContent: {
    flex: 1,
    gap: 3,
  },
  aiPromoTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  aiPromoSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
  promoAction: {
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  promoActionText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6366F1',
  },
  typeIconBg: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  seeAll: {
    fontWeight: '800',
    fontSize: 12,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: 10,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '800',
  },
  serviceName: {
    fontSize: 12,
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timeText: {
    fontSize: 10,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  categoryScroll: {
    marginBottom: 16,
  },
  customerTypeBtn: {
    alignItems: 'center',
    marginRight: 14,
  },
  qrCard: {
    padding: 20,
    borderRadius: 26,
    width: '90%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrContent: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  qrPlaceholder: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  businessNameLarge: {
    fontSize: 18,
    fontWeight: '800',
  },
  upiId: {
    fontSize: 13,
    marginTop: 2,
  },
  shareBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    marginTop: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  insightsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: 10,
  },
  statsScroll: {
    gap: 10,
    marginBottom: Spacing.md,
    paddingRight: 20,
  },
  leadsPreview: {
    marginBottom: Spacing.md,
  },
  leadsPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  liveBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveTxtSmall: {
    fontSize: 8,
    fontWeight: '900',
    color: '#EF4444',
  },
  leadsPreviewTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shopImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  shopDetails: {
    flex: 1,
    marginLeft: 12,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '800',
  },
  shopType: {
    fontSize: 11,
    marginTop: 1,
    fontWeight: '600',
  },
  shopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  shopMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  shopMetaTxt: {
    fontSize: 10,
    fontWeight: '700',
  },
  bookBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bookBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  }
});
