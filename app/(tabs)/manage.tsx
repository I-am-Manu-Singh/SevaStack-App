import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, Platform, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Users,
  Settings,
  Plus,
  ChevronRight,
  Zap,
  Calendar as CalendarIcon,
  CheckCircle2,
  MessageSquare,
  Wrench,
  Plane,
  Clock,
  XCircle,
  Search,
  Phone,
  X
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { Appointment } from '@/constants/Types';
import { MOCK_SESSION } from '@/constants/Auth';
import { useApp } from '@/lib/AppContext';
import { AnalyticsWidget, BookingWidget } from '@/components/BookingWidgets';
import { StatusBar } from 'expo-status-bar';
import { BookingModal } from '@/components/BookingModal';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookingsScreen() {
  const { userRole, colors } = useApp();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      {userRole === 'customer' ? <CustomerBookings /> : <MerchantBookings />}
    </SafeAreaView>
  );
}

function CustomerBookings() {
  const { colors, t, session } = useApp();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const studentName = session?.user?.user_metadata?.full_name || MOCK_SESSION.name;

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('customer_name', studentName)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (e: any) {
      console.warn("Error fetching customer bookings:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBookings();
  }, []);

  const handleCancelBooking = async (id: string) => {
    Alert.alert(
      t('cancel_booking' as any) || "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: t('cancel'), style: "cancel" },
        { 
          text: t('cancel_booking' as any) || "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .eq('id', id);

              if (error) throw error;
              Alert.alert("Success", "Booking cancelled successfully.");
              loadBookings();
            } catch (err: any) {
              Alert.alert("Error", err.message);
            }
          }
        }
      ]
    );
  };

  const MOCK_FALLBACKS = [
    {
      id: 'mock-1',
      service: 'Morning Mess Subscription',
      business_type: 'Tiffin',
      time: '7:30 AM',
      price: 1800,
      status: 'confirmed',
      avatar: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80'
    },
    {
      id: 'mock-2',
      service: 'Premium Wash & Iron',
      business_type: 'Laundry',
      time: '12:00 PM',
      price: 150,
      status: 'pending',
      avatar: 'https://images.unsplash.com/photo-1545173168-9f1947eebd01?w=100&q=80'
    }
  ];

  const displayBookings = bookings.length > 0 ? bookings : MOCK_FALLBACKS;

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ 
        title: 'My Bookings',
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text, fontWeight: '800' },
        headerTintColor: colors.primary
      }} />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {displayBookings.map((app) => (
          <GlassCard key={app.id} style={[styles.orderCard, { borderColor: colors.border, borderWidth: 1, borderRadius: 20 }]}>
            <View style={styles.orderMain}>
              <View style={[styles.shopThumbnail, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                <Image source={{ uri: app.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80' }} style={styles.customerAvatar} />
              </View>
              <View style={styles.orderInfo}>
                <Text style={[styles.customerName, { color: colors.text }]}>{app.service}</Text>
                <Text style={[styles.serviceName, { color: colors.textMuted }]}>{app.business_type || app.businessType || 'General'} Hub</Text>
                <View style={styles.timeRow}>
                  <Clock size={11} color={colors.textMuted} />
                  <Text style={[styles.timeText, { color: colors.textMuted }]}>{app.time}</Text>
                </View>
              </View>
              <View style={styles.priceCol}>
                <Text style={[styles.orderPrice, { color: colors.text }]}>₹{app.price}</Text>
                <View style={[
                  styles.statusLabel,
                  { backgroundColor: app.status === 'confirmed' || app.status === 'completed' ? colors.success + '15' : app.status === 'cancelled' ? colors.error + '15' : colors.secondary + '15' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: app.status === 'confirmed' || app.status === 'completed' ? colors.success : app.status === 'cancelled' ? colors.error : colors.secondary }
                  ]}>{app.status.toUpperCase()}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.customerActions}>
              <TouchableOpacity 
                style={styles.textActionBtn} 
                onPress={() => router.push('/chat' as any)}
                activeOpacity={0.7}
              >
                <MessageSquare size={14} color={colors.primary} />
                <Text style={[styles.textActionTxt, { color: colors.primary }]}>Chat Support</Text>
              </TouchableOpacity>
              {app.status !== 'cancelled' && app.status !== 'completed' && (
                <TouchableOpacity 
                  style={styles.textActionBtn} 
                  onPress={() => handleCancelBooking(app.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.textActionTxt, { color: colors.error }]}>Cancel booking</Text>
                </TouchableOpacity>
              )}
            </View>
          </GlassCard>
        ))}

        {displayBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTxt, { color: colors.textMuted }]}>You have no active bookings yet.</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.findMoreBtn, { borderColor: colors.primary + '30', borderWidth: 1 }]}
          onPress={() => router.push('/(tabs)')}
          activeOpacity={0.8}
        >
          <Text style={[styles.findMoreTxt, { color: colors.primary }]}>{t('add_order') || 'Explore Services'}</Text>
          <ChevronRight size={18} color={colors.primary} />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function MerchantBookings() {
  const { colors, t, theme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const router = useRouter();

  const loadMerchantBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profileRes = await supabase.from('merchants').select('*').eq('user_id', user.id).single();
      if (profileRes.data) {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('merchant_id', profileRes.data.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAppointments(data || []);
      }
    } catch (e: any) {
      console.warn("Error fetching merchant bookings:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMerchantBookings();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMerchantBookings();
  }, []);

  const updateStatus = async (id: string, newStatus: any) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      Alert.alert("Success", `Status updated to ${newStatus.toUpperCase()}`);
      loadMerchantBookings();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    const customer = app.customerName || app.customer_name || '';
    const serviceName = app.service || '';
    const matchesSearch = customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || app.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const revenue = appointments
    .filter(a => a.status === 'confirmed' || a.status === 'completed')
    .reduce((sum, a) => sum + Number(a.price), 0);

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ 
        title: 'Tasks & Bookings',
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text, fontWeight: '800' },
        headerTintColor: colors.primary
      }} />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <AnalyticsWidget revenue={revenue} />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('bookings')}</Text>
          <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setBookingModalVisible(true)}
            activeOpacity={0.8}
          >
            <Plus size={14} color="#FFF" />
            <Text style={styles.addBtnText}>{t('walk_in')}</Text>
          </TouchableOpacity>
        </View>

        <BookingModal 
           visible={bookingModalVisible} 
           onClose={() => setBookingModalVisible(false)} 
        />

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            placeholder={t('search_bookings') || 'Search customer name...'}
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Status Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabsScroll}>
          <View style={styles.filterTabs}>
            {['all', 'pending', 'confirmed', 'completed'].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setActiveFilter(status as any)}
                style={[
                  styles.filterTab,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  activeFilter === status && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.filterTabText,
                  { color: colors.textMuted },
                  activeFilter === status && { color: '#FFF' }
                ]}>
                  {t(status as any)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.bookingsList}>
          {filteredAppointments.map((app) => (
            <BookingWidget
              key={app.id}
              item={{
                id: app.id,
                customerName: app.customer_name || app.customerName || 'Resident Student',
                service: app.service,
                time: app.time,
                price: app.price,
                status: app.status
              }}
              onStatusChange={updateStatus}
            />
          ))}

          {filteredAppointments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTxt, { color: colors.textMuted }]}>No bookings match the filters.</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.manageServicesBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.push('/catalog')}
          activeOpacity={0.8}
        >
          <Text style={[styles.manageServicesText, { color: colors.text }]}>{t('catalog')}</Text>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    height: 46,
    marginBottom: Spacing.md,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTabsScroll: {
    marginBottom: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  orderCard: {
    padding: 0,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  orderMain: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  customerAvatar: {
    width: '100%',
    height: '100%',
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '800',
  },
  serviceName: {
    fontSize: 11,
    marginTop: 1,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '800',
  },
  priceCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  divider: {
    height: 1,
    opacity: 0.08,
  },
  customerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  textActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  textActionTxt: {
    fontSize: 12,
    fontWeight: '800',
  },
  statusLabel: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  manageServicesBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: Spacing.md,
    borderWidth: 1,
  },
  manageServicesText: {
    fontSize: 14,
    fontWeight: '700',
  },
  findMoreBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.lg,
    height: 48,
    borderRadius: 14,
  },
  findMoreTxt: {
    fontSize: 14,
    fontWeight: '800',
  },
  shopThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyTxt: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingsList: {
    gap: 10,
  }
});
