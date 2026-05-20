import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';

import {
  Plus,
  ChevronRight,
  Clock,
  Search,
  MessageSquare,
  X,
  CalendarDays,
  TrendingUp,
  CircleDollarSign,
  ClipboardList,
} from 'lucide-react-native';

import { Spacing } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { MOCK_SESSION } from '@/constants/Auth';
import { useApp } from '@/lib/AppContext';
import {
  AnalyticsWidget,
  BookingWidget,
} from '@/components/BookingWidgets';

import { StatusBar } from 'expo-status-bar';
import { BookingModal } from '@/components/BookingModal';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

// ======================================================
// ROOT
// ======================================================

export default function BookingsScreen() {
  const {
    userRole,
    colors,
  } = useApp();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          colors.background,
      }}
      edges={['left', 'right']}
    >
      {userRole === 'customer' ? (
        <CustomerBookings />
      ) : (
        <MerchantBookings />
      )}
    </SafeAreaView>
  );
}

// ======================================================
// CUSTOMER
// ======================================================

function CustomerBookings() {
  const {
    colors,
    t,
    session,
    theme,
  } = useApp();

  const [bookings, setBookings] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const router = useRouter();

  const studentName =
    session?.user?.user_metadata
      ?.full_name ||
    MOCK_SESSION.name;

  // ======================================================
  // LOAD
  // ======================================================

  const loadBookings = async () => {
    try {
      const allItems: any[] = [];

      // APPOINTMENTS

      const {
        data: appointmentsData,
      } = await supabase
        .from('appointments')
        .select('*')
        .eq(
          'customer_name',
          studentName
        );

      if (appointmentsData) {
        appointmentsData.forEach(
          (appt) => {
            allItems.push({
              id: appt.id,
              service:
                appt.service,
              business_type:
                appt.business_type ||
                'Barber',
              time: appt.time,
              price: Number(
                appt.price
              ),
              status:
                appt.status,
              avatar:
                appt.business_type ===
                'Barber'
                  ? 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100&q=80'
                  : 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=100&q=80',
              created_at:
                appt.created_at,
              is_cancellable:
                true,
            });
          }
        );
      }

      // TIFFIN

      const {
        data: tiffinData,
      } = await supabase
        .from(
          'tiffin_subscriptions'
        )
        .select('*')
        .eq(
          'student_name',
          studentName
        );

      if (tiffinData) {
        tiffinData.forEach(
          (sub) => {
            allItems.push({
              id: sub.id,
              service: `${sub.plan_type} Tiffin Plan`,
              business_type:
                'Tiffin',
              time: `${sub.days_left} Days Left`,
              price:
                sub.plan_type.includes(
                  'Premium'
                )
                  ? 2200
                  : 1500,
              status:
                sub.status ===
                'Active'
                  ? 'confirmed'
                  : 'completed',
              avatar:
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80',
              created_at:
                sub.created_at,
              is_cancellable:
                false,
            });
          }
        );
      }

      // LAUNDRY

      const {
        data: laundryData,
      } = await supabase
        .from('laundry_orders')
        .select('*')
        .eq(
          'customer_name',
          studentName
        );

      if (laundryData) {
        laundryData.forEach(
          (order) => {
            allItems.push({
              id: order.id,
              service: `${order.service_type} (${order.items_count} items)`,
              business_type:
                'Laundry',
              time:
                'Processing Order',
              price: Number(
                order.amount
              ),
              status:
                order.status ===
                  'Delivered' ||
                order.status ===
                  'Completed'
                  ? 'completed'
                  : 'pending',
              avatar:
                'https://images.unsplash.com/photo-1545173168-9f1947eebd01?w=100&q=80',
              created_at:
                order.created_at,
              is_cancellable:
                false,
            });
          }
        );
      }

      allItems.sort(
        (a, b) =>
          new Date(
            b.created_at || 0
          ).getTime() -
          new Date(
            a.created_at || 0
          ).getTime()
      );

      setBookings(allItems);
    } catch (e: any) {
      console.warn(
        e.message
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const onRefresh =
    useCallback(() => {
      setRefreshing(true);
      loadBookings();
    }, []);

  // ======================================================
  // CANCEL
  // ======================================================

  const handleCancelBooking =
    async (id: string) => {
      const bookingToCancel =
        bookings.find(
          (b) => b.id === id
        );

      if (
        bookingToCancel
          ?.is_cancellable ===
        false
      ) {
        Alert.alert(
          'Cannot Cancel',
          'Subscriptions and laundry orders require merchant approval.'
        );

        return;
      }

      Alert.alert(
        'Cancel Booking',
        'Are you sure you want to cancel this booking?',
        [
          {
            text: 'Keep',
            style: 'cancel',
          },

          {
            text:
              'Cancel Booking',
            style:
              'destructive',

            onPress:
              async () => {
                try {
                  await supabase
                    .from(
                      'appointments'
                    )
                    .update({
                      status:
                        'cancelled',
                    })
                    .eq('id', id);

                  loadBookings();
                } catch (
                  err: any
                ) {
                  Alert.alert(
                    'Error',
                    err.message
                  );
                }
              },
          },
        ]
      );
    };

  // ======================================================
  // STATS
  // ======================================================

  const confirmedCount =
    useMemo(() => {
      return bookings.filter(
        (b) =>
          b.status ===
            'confirmed' ||
          b.status ===
            'completed'
      ).length;
    }, [bookings]);

  const totalSpend =
    useMemo(() => {
      return bookings.reduce(
        (
          acc,
          item
        ) =>
          acc +
          Number(item.price),
        0
      );
    }, [bookings]);

  // ======================================================
  // LOADER
  // ======================================================

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.loaderWrap,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <StatusBar
        style={
          theme === 'dark'
            ? 'light'
            : 'dark'
        }
      />

      <Stack.Screen
        options={{
          title: 'My Bookings',

          headerShadowVisible:
            false,

          headerStyle: {
            backgroundColor:
              colors.background,
          },

          headerTitleStyle: {
            color: colors.text,
            fontWeight: '900',
          },

          headerTintColor:
            colors.primary,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
            tintColor={
              colors.primary
            }
          />
        }
      >
        {/* HERO */}

        <LinearGradient
          colors={[
            colors.primary +
              '18',
            'transparent',
          ]}
          style={
            styles.heroGradient
          }
        />

        <GlassCard
          style={[
            styles.heroCard,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          <View
            style={
              styles.heroTop
            }
          >
            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={[
                  styles.heroTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Your Service Hub
              </Text>

              <Text
                style={[
                  styles.heroSub,
                  {
                    color:
                      colors.textMuted,
                  },
                ]}
              >
                Track all active
                bookings,
                subscriptions
                and orders in
                one place.
                Humans invented
                appointments and
                then panic when
                they have three
                in one week.
              </Text>
            </View>

            <View
              style={[
                styles.heroIcon,
                {
                  backgroundColor:
                    colors.primary +
                    '14',
                },
              ]}
            >
              <CalendarDays
                size={30}
                color={
                  colors.primary
                }
              />
            </View>
          </View>

          {/* STATS */}

          <View
            style={
              styles.statsRow
            }
          >
            <StatsCard
              colors={colors}
              icon={
                ClipboardList
              }
              value={
                bookings.length
              }
              label="Bookings"
            />

            <StatsCard
              colors={colors}
              icon={
                TrendingUp
              }
              value={
                confirmedCount
              }
              label="Active"
            />

            <StatsCard
              colors={colors}
              icon={
                CircleDollarSign
              }
              value={`₹${totalSpend}`}
              label="Spent"
            />
          </View>
        </GlassCard>

        {/* BOOKINGS */}

        {bookings.map(
          (app) => (
            <GlassCard
              key={app.id}
              style={[
                styles.orderCard,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <View
                style={
                  styles.orderMain
                }
              >
                <View
                  style={[
                    styles.shopThumbnail,
                    {
                      borderColor:
                        colors.border,
                    },
                  ]}
                >
                  <Image
                    source={{
                      uri:
                        app.avatar,
                    }}
                    style={
                      styles.customerAvatar
                    }
                  />
                </View>

                <View
                  style={
                    styles.orderInfo
                  }
                >
                  <Text
                    numberOfLines={
                      1
                    }
                    style={[
                      styles.customerName,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {
                      app.service
                    }
                  </Text>

                  <Text
                    style={[
                      styles.serviceName,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    {
                      app.business_type
                    }{' '}
                    Hub
                  </Text>

                  <View
                    style={
                      styles.timeRow
                    }
                  >
                    <Clock
                      size={
                        11
                      }
                      color={
                        colors.textMuted
                      }
                    />

                    <Text
                      style={[
                        styles.timeText,
                        {
                          color:
                            colors.textMuted,
                        },
                      ]}
                    >
                      {
                        app.time
                      }
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.priceCol
                  }
                >
                  <Text
                    style={[
                      styles.orderPrice,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    ₹
                    {
                      app.price
                    }
                  </Text>

                  <View
                    style={[
                      styles.statusLabel,

                      {
                        backgroundColor:
                          app.status ===
                            'confirmed' ||
                          app.status ===
                            'completed'
                            ? colors.success +
                              '15'
                            : app.status ===
                              'cancelled'
                            ? colors.error +
                              '15'
                            : colors.secondary +
                              '15',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,

                        {
                          color:
                            app.status ===
                              'confirmed' ||
                            app.status ===
                              'completed'
                              ? colors.success
                              : app.status ===
                                'cancelled'
                              ? colors.error
                              : colors.secondary,
                        },
                      ]}
                    >
                      {app.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor:
                      colors.border,
                  },
                ]}
              />

              <View
                style={
                  styles.customerActions
                }
              >
                <TouchableOpacity
                  activeOpacity={
                    0.8
                  }
                  style={
                    styles.actionBtn
                  }
                  onPress={() =>
                    router.push(
                      '/chat/chat_support_list' as any
                    )
                  }
                >
                  <MessageSquare
                    size={15}
                    color={
                      colors.primary
                    }
                  />

                  <Text
                    style={[
                      styles.actionTxt,
                      {
                        color:
                          colors.primary,
                      },
                    ]}
                  >
                    Chat
                  </Text>
                </TouchableOpacity>

                {app.status !==
                  'cancelled' &&
                  app.status !==
                    'completed' &&
                  app.is_cancellable !==
                    false && (
                    <TouchableOpacity
                      activeOpacity={
                        0.8
                      }
                      style={
                        styles.actionBtn
                      }
                      onPress={() =>
                        handleCancelBooking(
                          app.id
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.actionTxt,
                          {
                            color:
                              colors.error,
                          },
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  )}
              </View>
            </GlassCard>
          )
        )}

        {/* EMPTY */}

        {!bookings.length && (
          <GlassCard
            style={[
              styles.emptyWrap,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.emptyTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              No Bookings Yet
            </Text>

            <Text
              style={[
                styles.emptySub,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              Explore nearby
              services and
              reserve your
              first booking.
            </Text>
          </GlassCard>
        )}

        {/* CTA */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.findMoreBtn,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
          onPress={() =>
            router.push(
              '/(tabs)'
            )
          }
        >
          <Text
            style={
              styles.findMoreTxt
            }
          >
            Explore Services
          </Text>

          <ChevronRight
            size={18}
            color="#FFF"
          />
        </TouchableOpacity>

        <View
          style={{ height: 120 }}
        />
      </ScrollView>
    </View>
  );
}

// ======================================================
// MERCHANT
// ======================================================

function MerchantBookings() {
  const {
    colors,
    t,
    theme,
  } = useApp();

  const [searchQuery, setSearchQuery] =
    useState('');

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<
    | 'all'
    | 'pending'
    | 'confirmed'
    | 'completed'
  >('all');

  const [
    bookingModalVisible,
    setBookingModalVisible,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [appointments, setAppointments] =
    useState<any[]>([]);

  const router = useRouter();

  // ======================================================
  // LOAD
  // ======================================================

  const loadMerchantBookings =
    async () => {
      try {
        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!user) return;

        const profileRes =
          await supabase
            .from('merchants')
            .select('*')
            .eq(
              'user_id',
              user.id
            )
            .single();

        if (profileRes.data) {
          const {
            data,
            error,
          } = await supabase
            .from(
              'appointments'
            )
            .select('*')
            .eq(
              'merchant_id',
              profileRes
                .data.id
            )
            .order(
              'created_at',
              {
                ascending:
                  false,
              }
            );

          if (error)
            throw error;

          setAppointments(
            data || []
          );
        }
      } catch (e: any) {
        console.warn(
          e.message
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  useEffect(() => {
    loadMerchantBookings();
  }, []);

  const onRefresh =
    useCallback(() => {
      setRefreshing(true);
      loadMerchantBookings();
    }, []);

  // ======================================================
  // UPDATE STATUS
  // ======================================================

  const updateStatus =
    async (
      id: string,
      newStatus: any
    ) => {
      try {
        await supabase
          .from(
            'appointments'
          )
          .update({
            status:
              newStatus,
          })
          .eq('id', id);

        loadMerchantBookings();
      } catch (
        err: any
      ) {
        Alert.alert(
          'Error',
          err.message
        );
      }
    };

  // ======================================================
  // FILTERED
  // ======================================================

  const filteredAppointments =
    appointments.filter(
      (app) => {
        const customer =
          (
            app.customer_name ||
            ''
          ).toLowerCase();

        const service =
          (
            app.service ||
            ''
          ).toLowerCase();

        const matchesSearch =
          customer.includes(
            searchQuery.toLowerCase()
          ) ||
          service.includes(
            searchQuery.toLowerCase()
          );

        const matchesFilter =
          activeFilter ===
            'all' ||
          app.status ===
            activeFilter;

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );

  const revenue =
    appointments
      .filter(
        (a) =>
          a.status ===
            'confirmed' ||
          a.status ===
            'completed'
      )
      .reduce(
        (
          sum,
          a
        ) =>
          sum +
          Number(a.price),
        0
      );

  // ======================================================
  // LOADER
  // ======================================================

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.loaderWrap,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <StatusBar
        style={
          theme === 'dark'
            ? 'light'
            : 'dark'
        }
      />

      <Stack.Screen
        options={{
          title:
            'Tasks & Bookings',

          headerShadowVisible:
            false,

          headerStyle: {
            backgroundColor:
              colors.background,
          },

          headerTitleStyle: {
            color: colors.text,
            fontWeight: '900',
          },

          headerTintColor:
            colors.primary,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
            tintColor={
              colors.primary
            }
          />
        }
      >
        {/* ANALYTICS */}

        <AnalyticsWidget
          revenue={revenue}
        />

        {/* HEADER */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Bookings Queue
          </Text>

          <TouchableOpacity
            activeOpacity={
              0.85
            }
            style={[
              styles.addBtn,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
            onPress={() =>
              setBookingModalVisible(
                true
              )
            }
          >
            <Plus
              size={15}
              color="#FFF"
            />

            <Text
              style={
                styles.addBtnText
              }
            >
              Walk-In
            </Text>
          </TouchableOpacity>
        </View>

        <BookingModal
          visible={
            bookingModalVisible
          }
          onClose={() =>
            setBookingModalVisible(
              false
            )
          }
        />

        {/* SEARCH */}

        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          <Search
            size={18}
            color={
              colors.textMuted
            }
          />

          <TextInput
            placeholder="Search bookings..."
            placeholderTextColor={
              colors.textMuted
            }
            style={[
              styles.searchInput,
              {
                color:
                  colors.text,
              },
            ]}
            value={
              searchQuery
            }
            onChangeText={
              setSearchQuery
            }
          />

          {searchQuery ? (
            <TouchableOpacity
              onPress={() =>
                setSearchQuery(
                  ''
                )
              }
            >
              <X
                size={18}
                color={
                  colors.textMuted
                }
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* FILTERS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          style={
            styles.filterTabsScroll
          }
        >
          <View
            style={
              styles.filterTabs
            }
          >
            {[
              'all',
              'pending',
              'confirmed',
              'completed',
            ].map(
              (
                status
              ) => (
                <TouchableOpacity
                  key={
                    status
                  }
                  activeOpacity={
                    0.85
                  }
                  onPress={() =>
                    setActiveFilter(
                      status as any
                    )
                  }
                  style={[
                    styles.filterTab,
                    {
                      backgroundColor:
                        colors.surface,
                      borderColor:
                        colors.border,
                    },

                    activeFilter ===
                      status && {
                      backgroundColor:
                        colors.primary,
                      borderColor:
                        colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      {
                        color:
                          colors.textMuted,
                      },

                      activeFilter ===
                        status && {
                        color:
                          '#FFF',
                      },
                    ]}
                  >
                    {status.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </ScrollView>

        {/* LIST */}

        <View
          style={
            styles.bookingsList
          }
        >
          {filteredAppointments.map(
            (app) => (
              <BookingWidget
                key={app.id}
                item={{
                  id: app.id,
                  customerName:
                    app.customer_name ||
                    'Resident Student',
                  service:
                    app.service,
                  time: app.time,
                  price:
                    app.price,
                  status:
                    app.status,
                }}
                onStatusChange={
                  updateStatus
                }
              />
            )
          )}
        </View>

        {/* EMPTY */}

        {!filteredAppointments.length && (
          <GlassCard
            style={[
              styles.emptyWrap,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.emptyTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              No Bookings Found
            </Text>

            <Text
              style={[
                styles.emptySub,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              Try another
              search or wait
              for incoming
              customer requests.
              The economic
              engine trembles.
            </Text>
          </GlassCard>
        )}

        {/* MANAGE */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.manageServicesBtn,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
          onPress={() =>
            router.push(
              '/catalog/catelog_manager'
            )
          }
        >
          <Text
            style={[
              styles.manageServicesText,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Manage Catalog
          </Text>

          <ChevronRight
            size={18}
            color={
              colors.textMuted
            }
          />
        </TouchableOpacity>

        <View
          style={{ height: 120 }}
        />
      </ScrollView>
    </View>
  );
}

// ======================================================
// STATS CARD
// ======================================================

function StatsCard({
  colors,
  icon: Icon,
  value,
  label,
}: any) {
  return (
    <View
      style={[
        styles.statsCard,
        {
          backgroundColor:
            colors.background,
          borderColor:
            colors.border,
        },
      ]}
    >
      <Icon
        size={18}
        color={colors.primary}
      />

      <Text
        numberOfLines={1}
        style={[
          styles.statsValue,
          {
            color:
              colors.text,
          },
        ]}
      >
        {value}
      </Text>

      <Text
        style={[
          styles.statsLabel,
          {
            color:
              colors.textMuted,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 30,
  },

  heroGradient: {
    position: 'absolute',
    top: -120,
    left: -30,
    right: -30,
    height: 320,
  },

  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
    overflow: 'hidden',
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  heroSub: {
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
    paddingRight: 14,
    fontWeight: '500',
  },

  heroIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  statsCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    minHeight: 92,
    justifyContent: 'center',
  },

  statsValue: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 10,
  },

  statsLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
  },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 12,
    gap: 5,

    ...Platform.select({
      ios: {
        shadowColor:
          '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.14,
        shadowRadius: 6,
      },

      android: {
        elevation: 4,
      },
    }),
  },

  addBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    height: 52,
    marginBottom: 16,
    gap: 8,
  },

  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
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
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },

  filterTabText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  bookingsList: {
    gap: 10,
  },

  orderCard: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 14,
  },

  orderMain: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'center',
  },

  shopThumbnail: {
    width: 54,
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
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
    marginTop: 3,
    fontWeight: '600',
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },

  timeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  priceCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },

  orderPrice: {
    fontSize: 15,
    fontWeight: '900',
  },

  statusLabel: {
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  divider: {
    height: 1,
    opacity: 0.08,
  },

  customerActions: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  actionTxt: {
    fontSize: 12,
    fontWeight: '800',
  },

  manageServicesBtn: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 20,
    borderWidth: 1,
  },

  manageServicesText: {
    fontSize: 14,
    fontWeight: '800',
  },

  findMoreBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    height: 54,
    borderRadius: 16,
  },

  findMoreTxt: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },

  emptyWrap: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
  },

  emptySub: {
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 260,
  },
});