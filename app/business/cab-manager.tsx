// ======================================================
// CAB MANAGER SCREEN - CLEANED & MODERNIZED
// Humanity really built entire apps just to coordinate
// four people avoiding paying full cab fare.
// ======================================================

import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';

import { Stack } from 'expo-router';

import {
  Car,
  MapPin,
  Clock,
  Plus,
  Search,
  Share2,
  Sparkles,
  QrCode,
  TrendingUp,
  Users,
  Award,
  ArrowUpRight,
} from 'lucide-react-native';

import {
  Colors,
  Spacing,
} from '@/constants/Theme';

import { GlassCard } from '@/components/GlassCard';

import { useApp } from '@/lib/AppContext';

import { supabase } from '@/lib/supabase';

import { CustomerBusinessView } from '@/components/CustomerBusinessView';

// ======================================================
// ROOT
// ======================================================

export default function CabManagerScreen() {
  const { userRole, businessType } =
    useApp();

  if (
    userRole === 'customer' ||
    businessType !== 'Travel'
  ) {
    return (
      <CustomerBusinessView type="Travel" />
    );
  }

  return (
    <CabManagerScreenMerchant />
  );
}

// ======================================================
// MAIN
// ======================================================

function CabManagerScreenMerchant() {
  const {
    colors,
    profile,
  } = useApp();

  const [activeTab, setActiveTab] =
    useState<
      'pools' | 'split' | 'tokens'
    >('pools');

  const [pools, setPools] =
    useState<any[]>([]);

  const [tokens, setTokens] =
    useState<any[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  // ====================================================
  // SEARCH
  // ====================================================

  const [searchQuery, setSearchQuery] =
    useState('');

  const [poolFilter, setPoolFilter] =
    useState<
      'All' | 'Open' | 'Locked'
    >('All');

  // ====================================================
  // CREATE POOL
  // ====================================================

  const [newPoolModal, setNewPoolModal] =
    useState(false);

  const [newDest, setNewDest] =
    useState(
      'Jaipur Airport'
    );

  const [newTime, setNewTime] =
    useState(
      '25 May, 04:00 PM'
    );

  const [newVehicle, setNewVehicle] =
    useState('Sedan');

  const [newFare, setNewFare] =
    useState('1200');

  const [newMaxSeats, setNewMaxSeats] =
    useState('4');

  // ====================================================
  // JOIN POOL
  // ====================================================

  const [joiningPool, setJoiningPool] =
    useState<any | null>(null);

  const [joinStudent, setJoinStudent] =
    useState('');

  const [joinPhone, setJoinPhone] =
    useState('');

  // ====================================================
  // SPLIT
  // ====================================================

  const [splitFare, setSplitFare] =
    useState('1200');

  const [splitSeats, setSplitSeats] =
    useState('4');

  const [
    passengerShares,
    setPassengerShares,
  ] = useState([
    {
      name: 'Amit',
      share: 300,
      paid: true,
    },
    {
      name: 'Sneha',
      share: 300,
      paid: false,
    },
    {
      name: 'Rohan',
      share: 300,
      paid: false,
    },
    {
      name: 'Vikram',
      share: 300,
      paid: false,
    },
  ]);

  // ====================================================
  // FETCH
  // ====================================================

  const fetchData = useCallback(
    async () => {
      if (!profile?.id) return;

      try {
        const [
          poolsData,
          tokensData,
        ] = await Promise.all([
          supabase
            .from('cab_pools')
            .select('*')
            .eq(
              'merchant_id',
              profile.id
            ),

          supabase
            .from('cab_tokens')
            .select('*')
            .eq(
              'merchant_id',
              profile.id
            ),
        ]);

        // ========================================
        // POOLS
        // ========================================

        let finalPools =
          poolsData.data || [];

        if (
          finalPools.length ===
          0
        ) {
          const defaults = [
            {
              destination:
                'Jaipur Airport',
              departure_time:
                '25 May, 04:00 PM',
              vehicle_type:
                'Sedan Dzire',
              total_fare:
                1200,
              max_seats: 4,
              passengers_count: 2,
              passengers: [
                'Amit',
                'Sneha',
              ],
              status:
                'Open',
              date: 'Today',
            },
          ].map(p => ({
            ...p,
            merchant_id:
              profile.id,
          }));

          const seed =
            await supabase
              .from(
                'cab_pools'
              )
              .insert(defaults)
              .select();

          finalPools =
            seed.data || [];
        }

        setPools(
          finalPools.map(
            (p: any) => ({
              id: p.id,
              destination:
                p.destination,
              departureTime:
                p.departure_time,
              vehicleType:
                p.vehicle_type,
              totalFare:
                p.total_fare,
              maxSeats:
                p.max_seats,
              passengersCount:
                p.passengers_count,
              passengers:
                p.passengers ||
                [],
              status:
                p.status,
              date: p.date,
            })
          )
        );

        // ========================================
        // TOKENS
        // ========================================

        let finalTokens =
          tokensData.data || [];

        if (
          finalTokens.length ===
          0
        ) {
          const defaults = [
            {
              student_name:
                'Amit Patel',
              destination:
                'Jaipur Airport',
              deposit_paid:
                300,
              contact:
                '+91 9999999999',
              status:
                'Confirmed',
              pool_joined:
                'Pool #JP01',
            },
          ].map(t => ({
            ...t,
            merchant_id:
              profile.id,
          }));

          const seed =
            await supabase
              .from(
                'cab_tokens'
              )
              .insert(defaults)
              .select();

          finalTokens =
            seed.data || [];
        }

        setTokens(
          finalTokens.map(
            (t: any) => ({
              id: t.id,
              studentName:
                t.student_name,
              destination:
                t.destination,
              depositPaid:
                t.deposit_paid,
              contact:
                t.contact,
              status:
                t.status,
              poolJoined:
                t.pool_joined,
            })
          )
        );
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [profile?.id]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ====================================================
  // REFRESH
  // ====================================================

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  // ====================================================
  // ANALYTICS
  // ====================================================

  const activePools =
    pools.filter(
      p => p.status === 'Open'
    ).length;

  const totalTravelers =
    pools.reduce(
      (acc, curr) =>
        acc +
        curr.passengersCount,
      0
    );

  const totalRevenue =
    pools.reduce(
      (acc, curr) =>
        acc +
        curr.totalFare,
      0
    );

  const averageOccupancy =
    pools.length
      ? Math.round(
          pools.reduce(
            (acc, curr) =>
              acc +
              (curr.passengersCount /
                curr.maxSeats) *
                100,
            0
          ) / pools.length
        )
      : 0;

  // ====================================================
  // FILTER
  // ====================================================

  const filteredPools =
    pools.filter(pool => {
      const search =
        searchQuery.toLowerCase();

      const matchesSearch =
        pool.destination
          .toLowerCase()
          .includes(search) ||
        pool.vehicleType
          .toLowerCase()
          .includes(search);

      const matchesFilter =
        poolFilter === 'All' ||
        pool.status ===
          poolFilter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });

  // ====================================================
  // ACTIONS
  // ====================================================

  const handleAddNewPool =
    async () => {
      if (
        !newDest ||
        !newTime
      ) {
        Alert.alert(
          'Missing Fields',
          'Please complete required details.'
        );

        return;
      }

      const { error } =
        await supabase
          .from('cab_pools')
          .insert([
            {
              merchant_id:
                profile?.id,
              destination:
                newDest,
              departure_time:
                newTime,
              vehicle_type:
                newVehicle,
              total_fare:
                Number(
                  newFare
                ),
              max_seats:
                Number(
                  newMaxSeats
                ),
              passengers_count: 1,
              passengers: [
                'Dispatcher',
              ],
              status:
                'Open',
              date: 'Today',
            },
          ]);

      if (error) {
        Alert.alert(
          'Error',
          error.message
        );

        return;
      }

      Alert.alert(
        'Pool Created',
        `${newVehicle} pool created successfully.`
      );

      setNewPoolModal(false);

      fetchData();
    };

  const handleJoinStudent =
    async () => {
      if (!joinStudent)
        return;

      const newPassengers = [
        ...joiningPool.passengers,
        joinStudent,
      ];

      const newCount =
        joiningPool.passengersCount +
        1;

      const nextStatus =
        newCount >=
        joiningPool.maxSeats
          ? 'Locked'
          : 'Open';

      await supabase
        .from('cab_pools')
        .update({
          passengers:
            newPassengers,
          passengers_count:
            newCount,
          status:
            nextStatus,
        })
        .eq(
          'id',
          joiningPool.id
        );

      await supabase
        .from('cab_tokens')
        .insert([
          {
            merchant_id:
              profile?.id,
            student_name:
              joinStudent,
            destination:
              joiningPool.destination,
            deposit_paid:
              200,
            contact:
              joinPhone ||
              '+91 9999999999',
            status:
              'Confirmed',
            pool_joined:
              joiningPool.destination,
          },
        ]);

      Alert.alert(
        'Passenger Added',
        `${joinStudent} joined the pool.`
      );

      setJoinStudent('');
      setJoinPhone('');
      setJoiningPool(
        null
      );

      fetchData();
    };

  const recalculateFareSplit =
    () => {
      const total =
        Number(
          splitFare
        ) || 0;

      const seats =
        Number(
          splitSeats
        ) || 1;

      const perHead =
        Math.round(
          total / seats
        );

      const generated =
        Array.from(
          { length: seats },
          (_, i) => ({
            name: `Passenger ${
              i + 1
            }`,
            share:
              perHead,
            paid: false,
          })
        );

      setPassengerShares(
        generated
      );
    };

  const handlePayShare =
    (index: number) => {
      setPassengerShares(
        prev =>
          prev.map(
            (
              p,
              idx
            ) =>
              idx === index
                ? {
                    ...p,
                    paid: true,
                  }
                : p
          )
      );
    };

  // ====================================================
  // UI
  // ====================================================

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
      <StatusBar style="light" />

      <Stack.Screen
        options={{
          title:
            'Travel Operations',
          headerStyle: {
            backgroundColor:
              colors.background,
          },
          headerTintColor:
            colors.primary,
        }}
      />

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              isRefreshing
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
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={
              colors.primary
            }
            style={{
              marginTop: 40,
            }}
          />
        ) : (
          <>
            {/* ================================= */}
            {/* HERO */}
            {/* ================================= */}

            <GlassCard
              style={
                styles.heroCard
              }
            >
              <View
                style={
                  styles.heroTop
                }
              >
                <View>
                  <Text
                    style={[
                      styles.heroTitle,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    Cab Pool
                    Operations
                  </Text>

                  <Text
                    style={[
                      styles.heroSubtitle,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    Shared
                    rides,
                    fare
                    splits,
                    traveler
                    tracking,
                    deposits
                    and route
                    management.
                  </Text>
                </View>

                <View
                  style={[
                    styles.liveBadge,
                    {
                      backgroundColor:
                        colors.success +
                        '20',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.liveDot,
                      {
                        backgroundColor:
                          colors.success,
                      },
                    ]}
                  />

                  <Text
                    style={{
                      color:
                        colors.success,
                      fontWeight:
                        '800',
                      fontSize: 10,
                    }}
                  >
                    LIVE
                  </Text>
                </View>
              </View>
            </GlassCard>

            {/* ================================= */}
            {/* ANALYTICS */}
            {/* ================================= */}

            <View
              style={
                styles.analyticsRow
              }
            >
              {[
                {
                  label:
                    'Active Pools',
                  value:
                    activePools,
                  icon: Car,
                },
                {
                  label:
                    'Travelers',
                  value:
                    totalTravelers,
                  icon:
                    Users,
                },
                {
                  label:
                    'Revenue',
                  value: `₹${totalRevenue}`,
                  icon:
                    TrendingUp,
                },
                {
                  label:
                    'Occupancy',
                  value: `${averageOccupancy}%`,
                  icon:
                    ArrowUpRight,
                },
              ].map(
                (
                  item,
                  index
                ) => {
                  const Icon =
                    item.icon;

                  return (
                    <GlassCard
                      key={
                        index
                      }
                      style={
                        styles.analyticsCard
                      }
                    >
                      <Icon
                        size={
                          18
                        }
                        color={
                          colors.primary
                        }
                      />

                      <Text
                        style={[
                          styles.analyticsValue,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {
                          item.value
                        }
                      </Text>

                      <Text
                        style={[
                          styles.analyticsLabel,
                          {
                            color:
                              colors.textMuted,
                          },
                        ]}
                      >
                        {
                          item.label
                        }
                      </Text>
                    </GlassCard>
                  );
                }
              )}
            </View>

            {/* ================================= */}
            {/* SEARCH */}
            {/* ================================= */}

            <View
              style={
                styles.searchRow
              }
            >
              <View
                style={[
                  styles.searchBar,
                  {
                    backgroundColor:
                      colors.surface,
                    borderColor:
                      colors.border,
                  },
                ]}
              >
                <Search
                  size={16}
                  color={
                    colors.textMuted
                  }
                />

                <TextInput
                  value={
                    searchQuery
                  }
                  onChangeText={
                    setSearchQuery
                  }
                  placeholder="Search pools..."
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
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.addBtn,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
                onPress={() =>
                  setNewPoolModal(
                    !newPoolModal
                  )
                }
              >
                <Plus
                  size={20}
                  color="#FFF"
                />
              </TouchableOpacity>
            </View>

            {/* ================================= */}
            {/* FILTERS */}
            {/* ================================= */}

            <View
              style={
                styles.filterRow
              }
            >
              {[
                'All',
                'Open',
                'Locked',
              ].map(
                filter => (
                  <TouchableOpacity
                    key={
                      filter
                    }
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor:
                          colors.surface,
                        borderColor:
                          colors.border,
                      },
                      poolFilter ===
                        filter && {
                        backgroundColor:
                          colors.primary +
                          '20',
                        borderColor:
                          colors.primary,
                      },
                    ]}
                    onPress={() =>
                      setPoolFilter(
                        filter as any
                      )
                    }
                  >
                    <Text
                      style={{
                        color:
                          poolFilter ===
                          filter
                            ? colors.primary
                            : colors.textMuted,
                        fontWeight:
                          '700',
                        fontSize: 11,
                      }}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* ================================= */}
            {/* CREATE POOL */}
            {/* ================================= */}

            {newPoolModal && (
              <GlassCard
                style={
                  styles.modalCard
                }
              >
                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Create Pool
                </Text>

                <TextInput
                  value={
                    newDest
                  }
                  onChangeText={
                    setNewDest
                  }
                  placeholder="Destination"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  style={[
                    styles.formInput,
                    {
                      color:
                        colors.text,
                      borderColor:
                        colors.border,
                    },
                  ]}
                />

                <TextInput
                  value={
                    newTime
                  }
                  onChangeText={
                    setNewTime
                  }
                  placeholder="Departure Time"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  style={[
                    styles.formInput,
                    {
                      color:
                        colors.text,
                      borderColor:
                        colors.border,
                    },
                  ]}
                />

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                  onPress={
                    handleAddNewPool
                  }
                >
                  <Text
                    style={
                      styles.submitBtnText
                    }
                  >
                    Create
                    Cab Pool
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* ================================= */}
            {/* POOLS */}
            {/* ================================= */}

            {filteredPools.map(
              pool => (
                <GlassCard
                  key={pool.id}
                  style={
                    styles.poolCard
                  }
                >
                  <View
                    style={
                      styles.poolTop
                    }
                  >
                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <Text
                        style={[
                          styles.poolTitle,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {
                          pool.destination
                        }
                      </Text>

                      <Text
                        style={{
                          color:
                            colors.textMuted,
                          fontSize: 11,
                          marginTop: 4,
                        }}
                      >
                        {
                          pool.departureTime
                        }
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            pool.status ===
                            'Open'
                              ? colors.success +
                                '20'
                              : colors.error +
                                '20',
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            pool.status ===
                            'Open'
                              ? colors.success
                              : colors.error,
                          fontWeight:
                            '900',
                          fontSize: 9,
                        }}
                      >
                        {
                          pool.status
                        }
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.poolInfo,
                      {
                        borderTopColor:
                          colors.border,
                      },
                    ]}
                  >
                    <MapPin
                      size={16}
                      color={
                        colors.primary
                      }
                    />

                    <View
                      style={{
                        marginLeft: 10,
                        flex: 1,
                      }}
                    >
                      <Text
                        style={[
                          styles.poolVehicle,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {
                          pool.vehicleType
                        }
                      </Text>

                      <Text
                        style={{
                          color:
                            colors.textMuted,
                          fontSize: 11,
                          marginTop: 2,
                        }}
                      >
                        {
                          pool.passengers.join(
                            ', '
                          )
                        }
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.poolFooter,
                      {
                        borderTopColor:
                          colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          colors.textMuted,
                        fontSize: 11,
                      }}
                    >
                      ₹
                      {
                        pool.totalFare
                      }{' '}
                      total
                    </Text>

                    <Text
                      style={{
                        color:
                          pool.passengersCount >=
                          pool.maxSeats
                            ? colors.error
                            : colors.success,
                        fontWeight:
                          '800',
                        fontSize: 12,
                      }}
                    >
                      {
                        pool.passengersCount
                      }
                      /
                      {
                        pool.maxSeats
                      }{' '}
                      seats
                    </Text>
                  </View>

                  <View
                    style={
                      styles.poolActions
                    }
                  >
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor:
                            colors.surface,
                        },
                      ]}
                      onPress={() =>
                        Share.share(
                          {
                            message: `Cab pool to ${pool.destination}. ${pool.passengersCount}/${pool.maxSeats} seats filled.`,
                          }
                        )
                      }
                    >
                      <Share2
                        size={
                          13
                        }
                        color={
                          colors.text
                        }
                      />

                      <Text
                        style={[
                          styles.actionBtnText,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        Share
                      </Text>
                    </TouchableOpacity>

                    {pool.status ===
                      'Open' && (
                      <TouchableOpacity
                        style={[
                          styles.joinBtn,
                          {
                            backgroundColor:
                              colors.primary,
                          },
                        ]}
                        onPress={() =>
                          setJoiningPool(
                            pool
                          )
                        }
                      >
                        <Text
                          style={
                            styles.submitBtnText
                          }
                        >
                          Add
                          Passenger
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </GlassCard>
              )
            )}

            {/* ================================= */}
            {/* JOIN */}
            {/* ================================= */}

            {joiningPool && (
              <GlassCard
                style={
                  styles.modalCard
                }
              >
                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Add Passenger
                </Text>

                <TextInput
                  value={
                    joinStudent
                  }
                  onChangeText={
                    setJoinStudent
                  }
                  placeholder="Passenger Name"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  style={[
                    styles.formInput,
                    {
                      color:
                        colors.text,
                      borderColor:
                        colors.border,
                    },
                  ]}
                />

                <TextInput
                  value={
                    joinPhone
                  }
                  onChangeText={
                    setJoinPhone
                  }
                  placeholder="Phone Number"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  style={[
                    styles.formInput,
                    {
                      color:
                        colors.text,
                      borderColor:
                        colors.border,
                    },
                  ]}
                />

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    {
                      backgroundColor:
                        colors.success,
                    },
                  ]}
                  onPress={
                    handleJoinStudent
                  }
                >
                  <Text
                    style={
                      styles.submitBtnText
                    }
                  >
                    Confirm
                    Passenger
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            <View
              style={{
                height: 120,
              }}
            />
          </>
        )}
      </ScrollView>

      {/* ===================================== */}
      {/* BOTTOM NAV */}
      {/* ===================================== */}

      <View
        style={[
          styles.bottomTabBar,
          {
            backgroundColor:
              colors.surface +
              'E8',
            borderColor:
              colors.border,
          },
        ]}
      >
        {[
          {
            id: 'pools',
            label: 'Pools',
            icon: Car,
          },
          {
            id: 'split',
            label: 'Split',
            icon: Users,
          },
          {
            id: 'tokens',
            label: 'Tokens',
            icon: Award,
          },
        ].map(tab => {
          const Icon =
            tab.icon;

          const isActive =
            activeTab ===
            tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.bottomTabBtn,
                isActive && {
                  backgroundColor:
                    colors.primary +
                    '18',
                },
              ]}
              onPress={() =>
                setActiveTab(
                  tab.id as any
                )
              }
            >
              <Icon
                size={20}
                color={
                  isActive
                    ? colors.primary
                    : colors.textMuted
                }
              />

              <Text
                style={[
                  styles.bottomTabLabel,
                  {
                    color:
                      isActive
                        ? colors.primary
                        : colors.textMuted,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles: any =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    scrollContent: {
      padding:
        Spacing.md,
    },

    heroCard: {
      marginBottom: 18,
    },

    heroTop: {
      flexDirection:
        'row',
      justifyContent:
        'space-between',
    },

    heroTitle: {
      fontSize: 26,
      fontWeight:
        '900',
    },

    heroSubtitle: {
      fontSize: 13,
      marginTop: 6,
      lineHeight: 18,
      maxWidth: '85%',
    },

    liveBadge: {
      flexDirection:
        'row',
      alignItems:
        'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      height: 30,
    },

    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6,
    },

    analyticsRow: {
      flexDirection:
        'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 18,
    },

    analyticsCard: {
      width: '47%',
      padding: 14,
      borderRadius: 18,
    },

    analyticsValue: {
      fontSize: 20,
      fontWeight:
        '900',
      marginTop: 10,
    },

    analyticsLabel: {
      fontSize: 11,
      marginTop: 4,
      fontWeight:
        '700',
    },

    searchRow: {
      flexDirection:
        'row',
      gap: 8,
      marginBottom: 14,
    },

    searchBar: {
      flex: 1,
      flexDirection:
        'row',
      alignItems:
        'center',
      height: 46,
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 12,
    },

    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 13,
      fontWeight:
        '600',
    },

    addBtn: {
      width: 46,
      height: 46,
      borderRadius: 14,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    filterRow: {
      flexDirection:
        'row',
      gap: 8,
      marginBottom: 16,
    },

    filterChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
    },

    modalCard: {
      padding: 16,
      borderRadius: 18,
      marginBottom: 18,
    },

    modalTitle: {
      fontSize: 15,
      fontWeight:
        '800',
      marginBottom: 14,
    },

    formInput: {
      height: 46,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 12,
      fontSize: 13,
    },

    submitBtn: {
      height: 44,
      borderRadius: 12,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    submitBtnText: {
      color: '#FFF',
      fontWeight:
        '800',
      fontSize: 12,
    },

    poolCard: {
      padding: 14,
      borderRadius: 18,
      marginBottom: 12,
    },

    poolTop: {
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    poolTitle: {
      fontSize: 15,
      fontWeight:
        '900',
    },

    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
    },

    poolInfo: {
      borderTopWidth: 1,
      paddingTop: 12,
      marginTop: 10,
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    poolVehicle: {
      fontSize: 13,
      fontWeight:
        '800',
    },

    poolFooter: {
      borderTopWidth: 1,
      paddingTop: 10,
      marginTop: 10,
      flexDirection:
        'row',
      justifyContent:
        'space-between',
    },

    poolActions: {
      flexDirection:
        'row',
      gap: 8,
      marginTop: 14,
    },

    actionBtn: {
      flexDirection:
        'row',
      alignItems:
        'center',
      paddingHorizontal: 12,
      height: 34,
      borderRadius: 10,
    },

    actionBtnText: {
      marginLeft: 6,
      fontWeight:
        '700',
      fontSize: 11,
    },

    joinBtn: {
      flex: 1,
      height: 34,
      borderRadius: 10,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    bottomTabBar: {
      position:
        'absolute',
      bottom: 12,
      left: 16,
      right: 16,
      height: 62,
      borderRadius: 22,
      borderWidth: 1,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-around',
      paddingHorizontal: 6,
    },

    bottomTabBtn: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    bottomTabLabel: {
      fontSize: 10,
      fontWeight:
        '800',
      marginTop: 4,
    },
  });