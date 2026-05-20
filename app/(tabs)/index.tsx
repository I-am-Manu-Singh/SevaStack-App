
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';

import {
  Bell,
  BookOpen,
  User,
  Building,
  Calendar,
  Car,
  ChevronRight,
  Clock,
  Coffee,
  Gem,
  GraduationCap,
  Hammer,
  IndianRupee,
  Pencil,
  Plane,
  QrCode,
  RefreshCw,
  Scissors,
  Search,
  Settings,
  ShoppingBag,
  Shirt,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Truck,
  Users,
  Utensils,
  Waves,
  X,
  Zap,
} from 'lucide-react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/AppContext';

import { GlassCard } from '@/components/GlassCard';
import { BookingModal } from '@/components/BookingModal';

import {
  RevenueChart,
  EfficiencyWidget,
} from '@/components/AnalyticsWidgets';

import {
  InsightWidget,
  QuickPayWidget,
  StatWidget,
} from '@/components/DashboardWidgets';

import {
  DeliveryTrackerWidget,
} from '@/components/TrackerWidgets';

import {
  HostelRoomManagementWidget,
  LibrarySeatMapWidget,
  RefillReminderWidget,
  SalonQueueWidget,
  StationeryPrintWidget,
  StitchingTrackerWidget,
  TiffinMenuWidget,
} from '@/components/BusinessSpecificWidgets';

import {
  ShopSpotlightWidget,
  TrendingServiceWidget,
} from '@/components/CustomerWidgets';

import { LedgerWidget } from '@/components/LedgerWidget';

import { useMerchantData } from '@/hooks/useMerchantData';

import {
  BUSINESS_CONFIGS,
  DEFAULT_CONFIG,
} from '@/constants/AppConfigs';

import { MOCK_SESSION } from '@/constants/Auth';

import { BusinessType } from '@/constants/Types';

// ======================================================
// BUSINESS TYPES
// ======================================================

const BUSINESS_TYPES: {
  type: BusinessType;
  icon: any;
  label: string;
}[] = [
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

// ======================================================
// MAIN SCREEN
// ======================================================

export default function AppMainScreen() {
  const { userRole, colors, theme, session } = useApp();
  const router = useRouter();

  const userName =
    session?.user?.user_metadata?.full_name ||
    MOCK_SESSION.name;

  const initials = userName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}
      edges={['top']}
    >
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: `${colors.primary}18`,
                borderColor: `${colors.primary}30`,
              },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                {
                  color: colors.primary,
                },
              ]}
            >
              {initials}
            </Text>
          </View>

          <View>
            <Text
              style={[
                styles.headerRole,
                {
                  color: colors.textMuted,
                },
              ]}
            >
              {userRole === 'customer'
                ? 'Student / Resident'
                : userRole === 'merchant'
                ? 'Merchant Partner'
                : 'System Admin'}
            </Text>

            <Text
              style={[
                styles.headerName,
                {
                  color: colors.text,
                },
              ]}
              numberOfLines={1}
            >
              {userName}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <HeaderIconButton
            icon={<Bell size={18} color={colors.text} />}
            colors={colors}
            onPress={() => router.push('/notifications')}
            badge
          />

          <HeaderIconButton
            icon={<User size={18} color={colors.text} />} // Changed Users to User
            colors={colors}
            onPress={() => router.push('/profile' as any)}
          />
        </View>
      </View>

      {/* ================================================= */}
      {/* ROLE SWITCH */}
      {/* ================================================= */}

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

// ======================================================
// HEADER BUTTON
// ======================================================

function HeaderIconButton({
  icon,
  colors,
  badge,
  onPress,
}: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.headerIconBtn,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {icon}

      {badge && <View style={styles.notificationDot} />}
    </TouchableOpacity>
  );
}

// ======================================================
// CUSTOMER DASHBOARD
// ======================================================

function CustomerDiscovery() {
  const { colors, theme, t, session } = useApp();

  const router = useRouter();

  const [trackers, setTrackers] = useState<any[]>([]);
  const [outstandingDues, setOutstandingDues] = useState(0);

  const studentName =
    session?.user?.user_metadata?.full_name ||
    MOCK_SESSION.name;

  useEffect(() => {
    loadTrackers();
    loadDues();
  }, []);

  async function loadDues() {
    try {
      const { data } = await supabase
        .from('appointments')
        .select('price')
        .eq('customer_name', studentName)
        .in('status', ['pending', 'confirmed']);

      if (data) {
        const total = data.reduce(
          (sum, item) => sum + Number(item.price),
          0
        );

        setOutstandingDues(total);
      }
    } catch {}
  }

  async function loadTrackers() {
    setTrackers([
      {
        id: '1',
        title: 'Laundry Order',
        status: 'Washing',
        detail: '3 items • Ready by 5:30 PM',
        icon: Waves,
        color: '#3B82F6',
      },
      {
        id: '2',
        title: 'Tiffin Delivery',
        status: 'On The Way',
        detail: 'Paneer meal • ETA 12 mins',
        icon: Utensils,
        color: '#10B981',
      },
      {
        id: '3',
        title: 'Library Session',
        status: 'Checked In',
        detail: 'Seat B-12 • 2h remaining',
        icon: BookOpen,
        color: '#8B5CF6',
      },
    ]);
  }
return (
  <ScrollView
    style={{ flex: 1 }}
    contentContainerStyle={styles.content}
    showsVerticalScrollIndicator={false}
  >
    {/* SEARCH */}

    <View
      style={[
        styles.compactSearchBar,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Search
        size={16}
        color={colors.textMuted}
      />

      <TextInput
        placeholder="Search services..."
        placeholderTextColor={
          colors.textMuted
        }
        style={[
          styles.compactSearchInput,
          {
            color: colors.text,
          },
        ]}
      />
    </View>
{/* ESSENTIALS */}

    <View style={styles.sectionRow}>
      <SectionTitle
        title="Essentials"
        colors={colors}
      />

      <TouchableOpacity>
        <Text
          style={[
            styles.sectionAction,
            {
              color:
                colors.primary,
            },
          ]}
        >
          Explore
        </Text>
      </TouchableOpacity>
    </View>

    <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{
    paddingRight: 16,
  }}
>
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
    }}
  >
    {BUSINESS_TYPES.slice(
      0,
      8
    ).map(
      ({
        type,
        icon: Icon,
        label,
      }) => (
        <TouchableOpacity
          key={type}
          activeOpacity={0.82}
          style={{
            width: 74,
            alignItems: 'center',
          }}
        >
          <View
            style={[
              styles.compactGridIcon,
              {
                backgroundColor:
                  colors.surface,

                borderColor:
                  colors.border,
              },
            ]}
          >
            <Icon
              size={18}
              color={
                colors.primary
              }
            />
          </View>

          <Text
            numberOfLines={2}
            style={[
              styles.compactGridLabel,
              {
                color:
                  colors.text,

                marginTop: 6,

                textAlign:
                  'center',

                fontSize: 11,

                lineHeight: 14,
              },
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      )
    )}
  </View>
</ScrollView>
    {/* SUMMARY */}

    <View style={styles.topCardsRow}>
      <GlassCard
        style={[
          styles.miniCard,
          {
            borderColor:
              colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.miniLabel,
            {
              color:
                colors.textMuted,
            },
          ]}
        >
          HOSTEL
        </Text>

        <Text
          numberOfLines={1}
          style={[
            styles.miniValue,
            {
              color:
                colors.text,
            },
          ]}
        >
          PG Block-A
        </Text>
      </GlassCard>

      <GlassCard
        style={[
          styles.miniCard,
          {
            borderColor:
              colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.miniLabel,
            {
              color:
                colors.textMuted,
            },
          ]}
        >
          DUES
        </Text>

        <Text
          style={[
            styles.miniValue,
            {
              color:
                outstandingDues >
                0
                  ? '#EF4444'
                  : '#10B981',
            },
          ]}
        >
          ₹{outstandingDues}
        </Text>
      </GlassCard>
    </View>

    {/* LIVE ACTIVITY */}

    <View style={styles.sectionRow}>
      <SectionTitle
        title="Live Activity"
        colors={colors}
      />

      <TouchableOpacity>
        <Text
          style={[
            styles.sectionAction,
            {
              color:
                colors.primary,
            },
          ]}
        >
          View All
        </Text>
      </TouchableOpacity>
    </View>

    <View style={styles.trackerGrid}>
      {trackers.map((track) => (
        <TouchableOpacity
          activeOpacity={0.88}
          key={track.id}
          style={[
            styles.compactTracker,
            {
              backgroundColor:
                colors.surface,

              borderColor:
                colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.compactTrackerIcon,
              {
                backgroundColor:
                  `${track.color}15`,
              },
            ]}
          >
            <track.icon
              size={16}
              color={track.color}
            />
          </View>

          <View
            style={{
              flex: 1,
              marginHorizontal: 10,
            }}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.compactTrackerTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {track.title}
            </Text>

            <Text
              numberOfLines={1}
              style={[
                styles.compactTrackerSub,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              {track.detail}
            </Text>
          </View>

          <View
            style={[
              styles.liveBadge,
              {
                backgroundColor:
                  `${track.color}15`,
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={{
                fontSize: 9,
                fontWeight: '900',
                color:
                  track.color,
              }}
            >
              {track.status}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>

    {/* AI ASSISTANT */}

    <TouchableOpacity
      activeOpacity={0.92}
    >
      <LinearGradient
        colors={[
          '#6366F1',
          '#8B5CF6',
        ]}
        style={
          styles.compactAiHero
        }
      >
        <View
          style={{
            flex: 1,
          }}
        >
          <View
            style={
              styles.aiMiniBadge
            }
          >
            <Sparkles
              size={11}
              color="#FFF"
            />

            <Text
              style={
                styles.aiMiniBadgeText
              }
            >
              AI ASSISTANT
            </Text>
          </View>

          <Text
            style={
              styles.compactAiTitle
            }
          >
            Smart Campus Hub
          </Text>

          <Text
            style={
              styles.compactAiSub
            }
          >
            Book services, track orders,
            manage student life.
          </Text>
        </View>

        <View
          style={
            styles.compactTryBtn
          }
        >
          <Text
            style={
              styles.compactTryText
            }
          >
            Open
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>

    

    {/* TRENDING */}

    <View style={styles.sectionRow}>
      <SectionTitle
        title="Trending Near You"
        colors={colors}
      />

      <TouchableOpacity>
        <Text
          style={[
            styles.sectionAction,
            {
              color:
                colors.primary,
            },
          ]}
        >
          More
        </Text>
      </TouchableOpacity>
    </View>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={
        false
      }
      contentContainerStyle={{
        paddingRight: 16,
      }}
    >
      <TrendingServiceWidget />
      <TrendingServiceWidget />
    </ScrollView>

    {/* SPOTLIGHT */}

    <View style={styles.sectionRow}>
      <SectionTitle
        title="Popular Shops"
        colors={colors}
      />

      <TouchableOpacity>
        <Text
          style={[
            styles.sectionAction,
            {
              color:
                colors.primary,
            },
          ]}
        >
          See All
        </Text>
      </TouchableOpacity>
    </View>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={
        false
      }
      contentContainerStyle={{
        paddingRight: 16,
      }}
    >
      <ShopSpotlightWidget />
      <ShopSpotlightWidget />
      <ShopSpotlightWidget />
    </ScrollView>

    <View
      style={{
        height: 90,
      }}
    />
  </ScrollView>
);
}

// ======================================================
// MERCHANT DASHBOARD
// ======================================================

function MerchantDashboard() {
  const {
    colors,
    theme,
    businessType,
    setBusinessType,
    t,
  } = useApp();

  const router = useRouter();

  const {
    data: dbData,
    loading,
  } = useMerchantData();

  const [activeTab, setActiveTab] =
    useState<'feed' | 'analytics'>('feed');

  const [qrModalVisible, setQrModalVisible] =
    useState(false);

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  const stats = [
    {
      label: "Today's Revenue",
      value: dbData?.revenue || '₹4,250',
      icon: IndianRupee,
      color: colors.primary,
    },
    {
      label: 'Tasks',
      value:
        dbData?.appointments?.length?.toString() ||
        '0',
      icon: Calendar,
      color: '#10B981',
    },
    {
      label: 'Leads',
      value:
        dbData?.leads?.length?.toString() || '0',
      icon: Zap,
      color: '#F59E0B',
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* TYPE SWITCHER */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingRight: 20,
        }}
      >
        {BUSINESS_TYPES.map(
          ({ type, icon: Icon, label }) => (
            <TouchableOpacity
              key={type}
              activeOpacity={0.75}
              onPress={() => setBusinessType(type)}
              style={[
                styles.businessTypeBtn,
                {
                  backgroundColor:
                    businessType === type
                      ? colors.primary
                      : colors.surface,

                  borderColor:
                    businessType === type
                      ? colors.primary
                      : colors.border,
                },
              ]}
            >
              <Icon
                size={16}
                color={
                  businessType === type
                    ? '#FFF'
                    : colors.textMuted
                }
              />

              <Text
                style={[
                  styles.businessTypeText,
                  {
                    color:
                      businessType === type
                        ? '#FFF'
                        : colors.textMuted,
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      {/* TABS */}

      <View
        style={[
          styles.segment,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        {['feed', 'analytics'].map((tab) => (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.8}
            onPress={() =>
              setActiveTab(tab as any)
            }
            style={[
              styles.segmentBtn,
              activeTab === tab && {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                {
                  color:
                    activeTab === tab
                      ? '#FFF'
                      : colors.textMuted,
                },
              ]}
            >
              {tab === 'feed'
                ? 'Operations'
                : 'Analytics'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FEED */}

      {activeTab === 'feed' ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingRight: 20,
            }}
          >
            {stats.map((item, index) => (
              <StatWidget
                key={index}
                label={item.label}
                value={item.value}
                icon={item.icon}
                color={item.color}
              />
            ))}
          </ScrollView>

          <SectionTitle
            title="Operations"
            colors={colors}
          />

          <View style={styles.operationsGrid}>
            {[
              {
                label: 'Catalog',
                icon: BookOpen,
                route: '/catalog/catelog_manager',
              },
              {
                label: 'Inventory',
                icon: ShoppingBag,
                route: '/tools/inventory',
              },
             
              {
                label: 'Leads',
                icon: Zap,
                route: '/leads',
              },
              {
                label: 'Chat',
                icon: Users,
                route: '/chat/chat_support_list',
              },
             
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() =>
                  router.push(item.route as any)
                }
                style={styles.operationItem}
              >
                <View
                  style={[
                    styles.operationIcon,
                    {
                      backgroundColor:
                        colors.surface,
                      borderColor:
                        colors.border,
                    },
                  ]}
                >
                  <item.icon
                    size={20}
                    color={colors.primary}
                  />
                </View>

                <Text
                  style={[
                    styles.operationLabel,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* WIDGETS */}

          {businessType === 'Kirana' && (
            <LedgerWidget />
          )}

          {businessType === 'Library' && (
            <LibrarySeatMapWidget />
          )}

          {businessType === 'Pharmacy' && (
            <RefillReminderWidget />
          )}

          {businessType === 'Hostel' && (
            <HostelRoomManagementWidget />
          )}

          {businessType === 'Barber' && (
            <SalonQueueWidget />
          )}

          {businessType === 'Stationery' && (
            <StationeryPrintWidget />
          )}
        </>
      ) : (
        <>
          <RevenueChart />

          <View style={styles.analyticsRow}>
            <EfficiencyWidget
              label="Conversion"
              percentage={78}
            />

            <EfficiencyWidget
              label="Efficiency"
              percentage={92}
            />
          </View>

          <InsightWidget />

          <QuickPayWidget
            upiId="merchant@upi"
            onPress={() =>
              setQrModalVisible(true)
            }
          />

          <GlassCard
            style={[
              styles.marketingCard,
              {
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.row}>
              <View
                style={[
                  styles.trendIcon,
                  {
                    backgroundColor:
                      `${colors.success}15`,
                  },
                ]}
              >
                <TrendingUp
                  size={18}
                  color={colors.success}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.marketingTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Marketing Boost
                </Text>

                <Text
                  style={[
                    styles.marketingSub,
                    {
                      color: colors.textMuted,
                    },
                  ]}
                >
                  Students are engaging more with
                  promoted listings.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.offerBtn,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >
              <Text style={styles.offerBtnText}>
                Create Offer
              </Text>
            </TouchableOpacity>
          </GlassCard>
        </>
      )}

      <View style={{ height: 120 }} />

      {/* QR MODAL */}

      <Modal
        transparent
        visible={qrModalVisible}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <GlassCard
            style={[
              styles.modalCard,
              {
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.rowBetween}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Merchant QR
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setQrModalVisible(false)
                }
              >
                <X
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.qrContainer}>
              <View style={styles.qrBox}>
                <QrCode
                  size={160}
                  color="#000"
                />
              </View>

              <Text
                style={[
                  styles.qrBusiness,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Merchant Center
              </Text>

              <Text
                style={[
                  styles.qrUpi,
                  {
                    color: colors.textMuted,
                  },
                ]}
              >
                merchant@upi
              </Text>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ======================================================
// ADMIN DASHBOARD
// ======================================================
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

// ======================================================
// SECTION TITLE
// ======================================================

function SectionTitle({
  title,
  colors,
}: any) {
  return (
    <Text
      style={[
        styles.sectionTitle,
        {
          color: colors.text,
        },
      ]}
    >
      {title}
    </Text>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  avatarText: {
    fontSize: 16,
    fontWeight: '900',
  },

  headerRole: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  headerName: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
sectionRow: {
  flexDirection: 'row',

  justifyContent: 'space-between',
  alignItems: 'center',

  marginTop: 6,
  marginBottom: 6,
},

sectionAction: {
  fontSize: 11,

  fontWeight: '800',
},

liveBadge: {
  paddingHorizontal: 8,
  paddingVertical: 5,

  borderRadius: 999,
},
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },

  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  notificationDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    top: 8,
    right: 8,
  },

  searchBar: {
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },

  duesCard: {
    padding: 18,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    borderWidth: 1,
  },

  divider: {
    width: 1,
    height: 36,
    marginHorizontal: 16,
    opacity: 0.4,
  },

  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },

  duesAmount: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: -0.3,
    marginTop: 4,
  },

  trackerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 22,
    marginBottom: 12,
    borderWidth: 1,
    gap: 12,
  },

  trackerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  trackerTitle: {
    fontSize: 14,
    fontWeight: '800',
  },

  trackerStatus: {
    fontSize: 11,
    fontWeight: '800',
  },

  trackerDetail: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
  },

  aiHero: {
    borderRadius: 28,
    padding: 20,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },

  aiBadgeText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 11,
  },

  aiHeroTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
    marginBottom: 8,
  },

  aiHeroSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 20,
    maxWidth: '90%',
  },

  tryNowBtn: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  tryNowText: {
    color: '#6366F1',
    fontWeight: '900',
    fontSize: 12,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  gridItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 18,
  },

  gridIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 8,
  },

  gridLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  businessTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginRight: 10,
    marginBottom: 18,
  },

  businessTypeText: {
    fontSize: 12,
    fontWeight: '800',
  },
compactSearchBar: {
  height: 48,
  borderRadius: 14,
  borderWidth: 1,

  flexDirection: 'row',
  alignItems: 'center',

  paddingHorizontal: 14,
  marginBottom: 16,
},

compactSearchInput: {
  flex: 1,
  marginLeft: 10,
  fontSize: 14,
  fontWeight: '600',
},

topCardsRow: {
  flexDirection: 'row',
  gap: 10,
  marginTop:12,
},

miniCard: {
  flex: 1,
  padding: 14,
  borderRadius: 18,
  borderWidth: 1,
},

miniLabel: {
  fontSize: 10,
  fontWeight: '800',
},

miniValue: {
  marginTop: 6,
  fontSize: 15,
  fontWeight: '800',
},

trackerGrid: {
  gap: 10,
  marginBottom: 18,
},

compactTracker: {
  flexDirection: 'row',
  alignItems: 'center',

  borderWidth: 1,
  borderRadius: 16,

  padding: 12,
},

compactTrackerIcon: {
  width: 38,
  height: 38,
  borderRadius: 12,

  justifyContent: 'center',
  alignItems: 'center',

  marginRight: 12,
},

compactTrackerTitle: {
  fontSize: 13,
  fontWeight: '800',
},

compactTrackerSub: {
  marginTop: 2,
  fontSize: 11,
},

compactAiHero: {
  minHeight: 120,
  borderRadius: 22,

  padding: 18,

  flexDirection: 'row',
  alignItems: 'center',

  marginBottom: 20,
},

aiMiniBadge: {
  alignSelf: 'flex-start',

  flexDirection: 'row',
  alignItems: 'center',

  backgroundColor:
    'rgba(255,255,255,0.18)',

  paddingHorizontal: 10,
  paddingVertical: 5,

  borderRadius: 999,
},

aiMiniBadgeText: {
  color: '#FFF',
  fontSize: 10,
  fontWeight: '800',

  marginLeft: 6,
},

compactAiTitle: {
  color: '#FFF',

  fontSize: 20,
  fontWeight: '900',

  marginTop: 12,
},

compactAiSub: {
  color: 'rgba(255,255,255,0.8)',

  marginTop: 6,

  fontSize: 12,
  lineHeight: 18,
},

compactTryBtn: {
  height: 40,

  paddingHorizontal: 18,

  borderRadius: 999,

  backgroundColor:
    'rgba(255,255,255,0.18)',

  justifyContent: 'center',
},

compactTryText: {
  color: '#FFF',
  fontWeight: '800',
  fontSize: 12,
},

compactGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',

  rowGap: 18,
},

compactGridItem: {
  width: '23%',
  alignItems: 'center',
},

compactGridIcon: {
  width: 58,
  height: 58,

  borderRadius: 18,
  borderWidth: 1,

  justifyContent: 'center',
  alignItems: 'center',

  marginBottom: 8,
},

compactGridLabel: {
  fontSize: 11,
  fontWeight: '700',
  textAlign: 'center',
},
  segment: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    padding: 4,
    marginBottom: 18,
  },

  segmentBtn: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  segmentText: {
    fontSize: 13,
    fontWeight: '800',
  },

  operationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  operationItem: {
    width: '21%',
    alignItems: 'center',
    marginBottom: 18,
  },

  operationIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  operationLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  analyticsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },

  marketingCard: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 18,
  },

  trendIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  marketingTitle: {
    fontSize: 15,
    fontWeight: '800',
  },

  marketingSub: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 18,
  },

  offerBtn: {
    marginTop: 16,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  offerBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 13,
  },

  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },

  modalCard: {
    padding: 22,
    borderRadius: 30,
    borderWidth: 1,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },

  qrContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },

  qrBox: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
  },

  qrBusiness: {
    fontSize: 18,
    fontWeight: '800',
  },

  qrUpi: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
  },
});