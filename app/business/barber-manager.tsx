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
  Scissors,
  Users,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Share2,
  CheckCircle2,
  Sparkles,
  QrCode,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
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
// ROOT SCREEN
// ======================================================

export default function BarberManagerScreen() {
  const { userRole, businessType } =
    useApp();

  if (
    userRole === 'customer' ||
    businessType !== 'Barber'
  ) {
    return (
      <CustomerBusinessView type="Barber" />
    );
  }

  return (
    <BarberManagerScreenMerchant />
  );
}

// ======================================================
// MERCHANT SCREEN
// ======================================================

function BarberManagerScreenMerchant() {
  const {
    colors,
    profile,
  } = useApp();

  const [activeTab, setActiveTab] =
    useState<
      'queue' | 'allergies' | 'appointments'
    >('queue');

  const [chairs, setChairs] =
    useState<any[]>([]);

  const [queue, setQueue] =
    useState<any[]>([]);

  const [allergies, setAllergies] =
    useState<any[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState('');

  // ====================================================
  // WALK-IN
  // ====================================================

  const [newWalkinModal, setNewWalkinModal] =
    useState(false);

  const [newName, setNewName] =
    useState('');

  const [newHostel, setNewHostel] =
    useState('');

  const [newService, setNewService] =
    useState('Haircut');

  const [
    newAllergyWarning,
    setNewAllergyWarning,
  ] = useState('');

  // ====================================================
  // BILLING
  // ====================================================

  const [settlingChair, setSettlingChair] =
    useState<any | null>(null);

  const [billingCombo, setBillingCombo] =
    useState('Basic Cut');

  const [billAmount, setBillAmount] =
    useState('150');

  // ====================================================
  // FETCH DATA
  // ====================================================

  const fetchData = useCallback(
    async () => {
      if (!profile?.id) return;

      try {
        const [
          chairsData,
          queueData,
          allergiesData,
        ] = await Promise.all([
          supabase
            .from('barber_chairs')
            .select('*')
            .eq(
              'merchant_id',
              profile.id
            ),

          supabase
            .from('barber_queue')
            .select('*')
            .eq(
              'merchant_id',
              profile.id
            ),

          supabase
            .from('barber_allergies')
            .select('*')
            .eq(
              'merchant_id',
              profile.id
            ),
        ]);

        // ========================================
        // CHAIRS
        // ========================================

        let finalChairs =
          chairsData.data || [];

        if (finalChairs.length === 0) {
          const defaultChairs = [
            {
              barber_name:
                'Rohit',
              customer_name:
                'Vacant',
              service: 'None',
              time_remaining: 0,
              status: 'Vacant',
            },
            {
              barber_name:
                'Vikram',
              customer_name:
                'Vacant',
              service: 'None',
              time_remaining: 0,
              status: 'Vacant',
            },
          ].map(c => ({
            ...c,
            merchant_id:
              profile.id,
          }));

          const seed =
            await supabase
              .from(
                'barber_chairs'
              )
              .insert(
                defaultChairs
              )
              .select();

          finalChairs =
            seed.data || [];
        }

        setChairs(
          finalChairs.map(
            (c: any) => ({
              id: c.id,
              barberName:
                c.barber_name,
              customerName:
                c.customer_name,
              service:
                c.service,
              timeRemaining:
                c.time_remaining,
              status:
                c.status,
            })
          )
        );

        // ========================================
        // QUEUE
        // ========================================

        let finalQueue =
          queueData.data || [];

        if (finalQueue.length === 0) {
          const defaults = [
            {
              customer_name:
                'Varun Sharma',
              hostel:
                'Hostel H-3',
              service:
                'Beard Trim',
              phone:
                '+91 9999988888',
              status:
                'Waiting',
            },
          ].map(q => ({
            ...q,
            merchant_id:
              profile.id,
          }));

          const seed =
            await supabase
              .from(
                'barber_queue'
              )
              .insert(defaults)
              .select();

          finalQueue =
            seed.data || [];
        }

        setQueue(
          finalQueue.map(
            (q: any) => ({
              id: q.id,
              customerName:
                q.customer_name,
              hostel:
                q.hostel,
              service:
                q.service,
              phone:
                q.phone,
              status:
                q.status,
            })
          )
        );

        // ========================================
        // ALLERGIES
        // ========================================

        let finalAllergies =
          allergiesData.data ||
          [];

        if (
          finalAllergies.length ===
          0
        ) {
          const defaults = [
            {
              customer_name:
                'Rohan Singh',
              warning:
                'Sensitive to alcohol-based sprays.',
              severity:
                'High',
              date: 'Today',
            },
          ].map(a => ({
            ...a,
            merchant_id:
              profile.id,
          }));

          const seed =
            await supabase
              .from(
                'barber_allergies'
              )
              .insert(defaults)
              .select();

          finalAllergies =
            seed.data || [];
        }

        setAllergies(
          finalAllergies.map(
            (a: any) => ({
              id: a.id,
              customerName:
                a.customer_name,
              warning:
                a.warning,
              severity:
                a.severity,
              date: a.date,
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

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  // ====================================================
  // ANALYTICS
  // ====================================================

  const occupiedChairs =
    chairs.filter(
      c => c.status === 'Occupied'
    ).length;

  const vacantChairs =
    chairs.filter(
      c => c.status === 'Vacant'
    ).length;

  const estimatedRevenue =
    occupiedChairs * 220;

  const averageWaitTime =
    queue.length * 12;

  const filteredQueue =
    queue.filter(
      q =>
        q.customerName
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        q.service
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          )
    );

  // ====================================================
  // ACTIONS
  // ====================================================

  const handleAddWalkin =
    async () => {
      if (!newName.trim()) {
        Alert.alert(
          'Missing Name',
          'Please enter customer name.'
        );

        return;
      }

      const { error } =
        await supabase
          .from('barber_queue')
          .insert([
            {
              merchant_id:
                profile?.id,
              customer_name:
                newName,
              hostel:
                newHostel ||
                'Walk-in',
              service:
                newService,
              phone:
                '+91 9999999999',
              status:
                'Waiting',
            },
          ]);

      if (error) {
        Alert.alert(
          'Error',
          error.message
        );

        return;
      }

      if (
        newAllergyWarning.trim()
      ) {
        await supabase
          .from(
            'barber_allergies'
          )
          .insert([
            {
              merchant_id:
                profile?.id,
              customer_name:
                newName,
              warning:
                newAllergyWarning,
              severity:
                'High',
              date: 'Today',
            },
          ]);
      }

      Alert.alert(
        'Customer Added',
        `${newName} added to queue.`
      );

      setNewName('');
      setNewHostel('');
      setNewService(
        'Haircut'
      );
      setNewAllergyWarning(
        ''
      );

      setNewWalkinModal(
        false
      );

      fetchData();
    };

  const callNextInQueue =
    async (chairId: string) => {
      if (queue.length === 0) {
        Alert.alert(
          'Queue Empty',
          'No customers waiting.'
        );

        return;
      }

      const next =
        queue[0];

      await supabase
        .from('barber_queue')
        .delete()
        .eq('id', next.id);

      await supabase
        .from('barber_chairs')
        .update({
          customer_name:
            next.customerName,
          service:
            next.service,
          time_remaining:
            20,
          status:
            'Occupied',
        })
        .eq('id', chairId);

      Alert.alert(
        'Chair Assigned',
        `${next.customerName} moved to chair.`
      );

      fetchData();
    };

  const handleSettleStylingDues =
    async () => {
      if (!settlingChair)
        return;

      await supabase
        .from('barber_chairs')
        .update({
          customer_name:
            'Vacant',
          service:
            'None',
          time_remaining: 0,
          status:
            'Vacant',
        })
        .eq(
          'id',
          settlingChair.id
        );

      Alert.alert(
        'Payment Complete',
        `₹${billAmount} settled successfully.`
      );

      setSettlingChair(
        null
      );

      fetchData();
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
            'Barber Operations',
          headerStyle: {
            backgroundColor:
              colors.background,
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
          <View
            style={{
              padding: 40,
            }}
          >
            <ActivityIndicator
              size="large"
              color={
                colors.primary
              }
            />
          </View>
        ) : (
          <>
            {/* ================================= */}
            {/* HERO */}
            {/* ================================= */}

            <View
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
                    Barber
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
                    Queue,
                    bookings,
                    chairs,
                    billing
                    and safety
                    monitoring.
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
                      fontSize: 10,
                      fontWeight:
                        '800',
                    }}
                  >
                    LIVE
                  </Text>
                </View>
              </View>
            </View>

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
                    'Occupied',
                  value:
                    occupiedChairs,
                  icon:
                    Users,
                },
                {
                  label:
                    'Waiting',
                  value:
                    queue.length,
                  icon:
                    Clock,
                },
                {
                  label:
                    'Revenue',
                  value: `₹${estimatedRevenue}`,
                  icon:
                    TrendingUp,
                },
                {
                  label:
                    'Avg Wait',
                  value: `${averageWaitTime}m`,
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
                size={16}
                color={
                  colors.textMuted
                }
              />

              <TextInput
                placeholder="Search queue..."
                placeholderTextColor={
                  colors.textMuted
                }
                value={
                  searchQuery
                }
                onChangeText={
                  setSearchQuery
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

            {/* ================================= */}
            {/* CHAIRS */}
            {/* ================================= */}

            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              LIVE CHAIRS
            </Text>

            <View
              style={
                styles.chairsGrid
              }
            >
              {chairs.map(ch => (
                <GlassCard
                  key={ch.id}
                  style={
                    styles.chairCard
                  }
                >
                  <View
                    style={
                      styles.chairHeader
                    }
                  >
                    <Scissors
                      size={
                        18
                      }
                      color={
                        ch.status ===
                        'Occupied'
                          ? colors.primary
                          : colors.textMuted
                      }
                    />

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            ch.status ===
                            'Occupied'
                              ? colors.primary +
                                '20'
                              : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            ch.status ===
                            'Occupied'
                              ? colors.primary
                              : colors.textMuted,

                          fontSize: 9,
                          fontWeight:
                            '900',
                        }}
                      >
                        {
                          ch.status
                        }
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.barberName,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    {
                      ch.barberName
                    }
                  </Text>

                  <Text
                    style={[
                      styles.clientName,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {
                      ch.customerName
                    }
                  </Text>

                  <View
                    style={
                      styles.chairFooter
                    }
                  >
                    <Text
                      style={[
                        styles.chairMeta,
                        {
                          color:
                            colors.textMuted,
                        },
                      ]}
                    >
                      ETA{' '}
                      {
                        ch.timeRemaining
                      }
                      m
                    </Text>

                    <Text
                      style={[
                        styles.chairMeta,
                        {
                          color:
                            colors.success,
                        },
                      ]}
                    >
                      ₹220
                    </Text>
                  </View>

                  {ch.status ===
                  'Vacant' ? (
                    <TouchableOpacity
                      style={[
                        styles.primaryBtn,
                        {
                          backgroundColor:
                            colors.primary,
                        },
                      ]}
                      onPress={() =>
                        callNextInQueue(
                          ch.id
                        )
                      }
                    >
                      <Text
                        style={
                          styles.primaryBtnText
                        }
                      >
                        Call
                        Next
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.secondaryBtn,
                        {
                          borderColor:
                            colors.success,
                        },
                      ]}
                      onPress={() =>
                        setSettlingChair(
                          ch
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.secondaryBtnText,
                          {
                            color:
                              colors.success,
                          },
                        ]}
                      >
                        Complete
                        Service
                      </Text>
                    </TouchableOpacity>
                  )}
                </GlassCard>
              ))}
            </View>

            {/* ================================= */}
            {/* BILLING */}
            {/* ================================= */}

            {settlingChair && (
              <GlassCard
                style={
                  styles.billCard
                }
              >
                <View
                  style={
                    styles.billHeader
                  }
                >
                  <View
                    style={{
                      flexDirection:
                        'row',
                      alignItems:
                        'center',
                    }}
                  >
                    <QrCode
                      size={
                        18
                      }
                      color={
                        colors.primary
                      }
                    />

                    <Text
                      style={[
                        styles.billTitle,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      Billing
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      setSettlingChair(
                        null
                      )
                    }
                  >
                    <Text
                      style={{
                        color:
                          colors.error,
                        fontWeight:
                          '700',
                      }}
                    >
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  value={
                    billAmount
                  }
                  onChangeText={
                    setBillAmount
                  }
                  keyboardType="numeric"
                  placeholder="Amount"
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
                    handleSettleStylingDues
                  }
                >
                  <Text
                    style={
                      styles.primaryBtnText
                    }
                  >
                    Confirm
                    Payment
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* ================================= */}
            {/* ADD WALK-IN */}
            {/* ================================= */}

            <View
              style={
                styles.queueHeader
              }
            >
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color:
                      colors.textMuted,
                  },
                ]}
              >
                WAITING
                QUEUE
              </Text>

              <TouchableOpacity
                style={[
                  styles.addBtn,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
                onPress={() =>
                  setNewWalkinModal(
                    !newWalkinModal
                  )
                }
              >
                <Plus
                  size={14}
                  color="#FFF"
                />

                <Text
                  style={
                    styles.addBtnText
                  }
                >
                  Walk-in
                </Text>
              </TouchableOpacity>
            </View>

            {newWalkinModal && (
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
                  Add Walk-in
                </Text>

                <TextInput
                  placeholder="Customer Name"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  value={
                    newName
                  }
                  onChangeText={
                    setNewName
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
                  placeholder="Hostel / Address"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  value={
                    newHostel
                  }
                  onChangeText={
                    setNewHostel
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
                  placeholder="Service"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  value={
                    newService
                  }
                  onChangeText={
                    setNewService
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
                    handleAddWalkin
                  }
                >
                  <Text
                    style={
                      styles.primaryBtnText
                    }
                  >
                    Add To
                    Queue
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* ================================= */}
            {/* QUEUE */}
            {/* ================================= */}

            {filteredQueue.length ===
              0 && (
              <GlassCard
                style={
                  styles.emptyCard
                }
              >
                <Users
                  size={36}
                  color={
                    colors.textMuted
                  }
                />

                <Text
                  style={[
                    styles.emptyTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Queue Empty
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
                  Walk-ins
                  will appear
                  here.
                </Text>
              </GlassCard>
            )}

            {filteredQueue.map(
              (qu, idx) => (
                <GlassCard
                  key={qu.id}
                  style={
                    styles.queueCard
                  }
                >
                  <View
                    style={
                      styles.queueTop
                    }
                  >
                    <View
                      style={
                        styles.queueIndex
                      }
                    >
                      <Text
                        style={{
                          color:
                            colors.primary,
                          fontWeight:
                            '900',
                        }}
                      >
                        #
                        {idx +
                          1}
                      </Text>
                    </View>

                    <View
                      style={{
                        flex: 1,
                        marginLeft: 12,
                      }}
                    >
                      <Text
                        style={[
                          styles.customerName,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {
                          qu.customerName
                        }
                      </Text>

                      <Text
                        style={{
                          color:
                            colors.textMuted,
                          fontSize: 11,
                        }}
                      >
                        {
                          qu.hostel
                        }
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.serviceBadge,
                        {
                          backgroundColor:
                            colors.accent +
                            '20',
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            colors.accent,
                          fontSize: 9,
                          fontWeight:
                            '900',
                        }}
                      >
                        {
                          qu.service
                        }
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.queueActions,
                      {
                        borderTopColor:
                          colors.border,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.queueBtn,
                        {
                          backgroundColor:
                            colors.surface,
                        },
                      ]}
                      onPress={() =>
                        Share.share(
                          {
                            message: `Hi ${qu.customerName}, your turn is near. Please reach the salon.`,
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
                          styles.queueBtnText,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        Notify
                      </Text>
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              )
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
            id: 'queue',
            label: 'Queue',
            icon: Users,
          },
          {
            id: 'allergies',
            label: 'Safety',
            icon:
              AlertTriangle,
          },
          {
            id: 'appointments',
            label: 'Bookings',
            icon: Clock,
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
                  styles.bottomLabel,
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

    searchContainer: {
      height: 48,
      borderRadius: 14,
      borderWidth: 1,
      flexDirection:
        'row',
      alignItems:
        'center',
      paddingHorizontal: 12,
      marginBottom: 16,
    },

    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 13,
      fontWeight:
        '600',
    },

    sectionTitle: {
      fontSize: 11,
      fontWeight:
        '800',
      letterSpacing: 1,
      marginBottom: 12,
    },

    chairsGrid: {
      flexDirection:
        'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 20,
    },

    chairCard: {
      width: '47%',
      padding: 14,
      borderRadius: 18,
    },

    chairHeader: {
      flexDirection:
        'row',
      justifyContent:
        'space-between',
      marginBottom: 10,
    },

    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
    },

    barberName: {
      fontSize: 10,
      fontWeight:
        '700',
    },

    clientName: {
      fontSize: 15,
      fontWeight:
        '900',
      marginTop: 4,
    },

    chairFooter: {
      flexDirection:
        'row',
      justifyContent:
        'space-between',
      marginTop: 10,
      marginBottom: 12,
    },

    chairMeta: {
      fontSize: 10,
      fontWeight:
        '700',
    },

    primaryBtn: {
      height: 34,
      borderRadius: 10,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    secondaryBtn: {
      height: 34,
      borderRadius: 10,
      borderWidth: 1,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    primaryBtnText: {
      color: '#FFF',
      fontSize: 12,
      fontWeight:
        '800',
    },

    secondaryBtnText: {
      fontSize: 12,
      fontWeight:
        '800',
    },

    billCard: {
      padding: 16,
      borderRadius: 18,
      marginBottom: 20,
    },

    billHeader: {
      flexDirection:
        'row',
      justifyContent:
        'space-between',
      alignItems:
        'center',
      marginBottom: 14,
    },

    billTitle: {
      fontSize: 15,
      fontWeight:
        '800',
      marginLeft: 8,
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

    queueHeader: {
      flexDirection:
        'row',
      justifyContent:
        'space-between',
      alignItems:
        'center',
      marginBottom: 14,
    },

    addBtn: {
      flexDirection:
        'row',
      alignItems:
        'center',
      height: 32,
      paddingHorizontal: 12,
      borderRadius: 10,
    },

    addBtnText: {
      color: '#FFF',
      fontSize: 11,
      fontWeight:
        '800',
      marginLeft: 4,
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

    queueCard: {
      padding: 14,
      borderRadius: 18,
      marginBottom: 10,
    },

    queueTop: {
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    queueIndex: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent:
        'center',
      alignItems:
        'center',
      backgroundColor:
        'rgba(255,255,255,0.05)',
    },

    customerName: {
      fontSize: 14,
      fontWeight:
        '800',
    },

    serviceBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },

    queueActions: {
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      flexDirection:
        'row',
      justifyContent:
        'flex-end',
    },

    queueBtn: {
      flexDirection:
        'row',
      alignItems:
        'center',
      paddingHorizontal: 12,
      height: 32,
      borderRadius: 10,
    },

    queueBtnText: {
      marginLeft: 6,
      fontSize: 11,
      fontWeight:
        '700',
    },

    emptyCard: {
      padding: 30,
      borderRadius: 20,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    emptyTitle: {
      fontSize: 16,
      fontWeight:
        '800',
      marginTop: 10,
    },

    emptySub: {
      fontSize: 12,
      marginTop: 4,
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

    bottomLabel: {
      fontSize: 10,
      fontWeight:
        '800',
      marginTop: 4,
    },
  });