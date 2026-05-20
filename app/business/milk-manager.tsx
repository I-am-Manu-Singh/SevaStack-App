// MilkManagerScreen.tsx
// Refactored into sane reusable sections because apparently
// humanity enjoys creating 2000-line React Native screens
// and calling it “rapid development”.

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';

import {
  Award,
  CheckCircle2,
  Flame,
  MapPin,
  MinusCircle,
  Pause,
  Play,
  PlusCircle,
  RefreshCw,
  Share2,
  Truck,
  Users,
} from 'lucide-react-native';

import { GlassCard } from '@/components/GlassCard';
import { CustomerBusinessView } from '@/components/CustomerBusinessView';

import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

import { Spacing } from '@/constants/Theme';

type TabType =
  | 'subs'
  | 'bottles'
  | 'quality'
  | 'routes';

export default function MilkManagerScreen() {
  const { userRole, businessType } =
    useApp();

  if (
    userRole === 'customer' ||
    businessType !== 'Milk'
  ) {
    return (
      <CustomerBusinessView type="Milk" />
    );
  }

  return <MilkMerchantScreen />;
}

function MilkMerchantScreen() {
  const { colors, profile } =
    useApp();

  const [activeTab, setActiveTab] =
    useState<TabType>('subs');

  const [subscriptions, setSubscriptions] =
    useState<any[]>([]);

  const [qualityLogs, setQualityLogs] =
    useState<any[]>([]);

  const [dispatchRuns, setDispatchRuns] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [activeFilter, setActiveFilter] =
    useState<
      'All' | 'Active' | 'Paused'
    >('All');

  // QUALITY
  const [fat, setFat] =
    useState('4.8%');

  const [snf, setSnf] =
    useState('8.5%');

  const [lacto, setLacto] =
    useState('28.5');

  const [temp, setTemp] =
    useState('4°C');

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const [
        subsRes,
        qualityRes,
        runsRes,
      ] = await Promise.all([
        supabase
          .from('milk_customers')
          .select('*')
          .eq(
            'merchant_id',
            profile.id
          ),

        supabase
          .from(
            'milk_quality_log'
          )
          .select('*')
          .eq(
            'merchant_id',
            profile.id
          )
          .order('created_at', {
            ascending: false,
          }),

        supabase
          .from(
            'milk_dispatch_runs'
          )
          .select('*')
          .eq(
            'merchant_id',
            profile.id
          ),
      ]);

      // SUBSCRIPTIONS
      let subs =
        subsRes.data || [];

      if (!subs.length) {
        const seed =
          await supabase
            .from(
              'milk_customers'
            )
            .insert([
              {
                merchant_id:
                  profile.id,
                customer_name:
                  'Varun Sharma',
                address:
                  'Hostel A',
                milk_type:
                  'Full Cream',
                quantity_liters: 1.5,
                status:
                  'Active',
                bottles_due: 3,
              },
            ])
            .select();

        subs =
          seed.data || [];
      }

      setSubscriptions(
        subs.map(
          (item: any) => ({
            id: item.id,
            customerName:
              item.customer_name,
            address:
              item.address,
            milkType:
              item.milk_type,
            quantity:
              item.quantity_liters,
            status:
              item.status,
            bottlesDue:
              item.bottles_due,
            avatar:
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
          })
        )
      );

      // QUALITY
      setQualityLogs(
        qualityRes.data || []
      );

      // RUNS
      setDispatchRuns(
        (runsRes.data || []).map(
          (run: any) => ({
            id: run.id,
            zone: run.zone,
            runner: run.runner,
            milkLitres:
              run.milk_litres,
            completed:
              run.completed,
            total: run.total,
            status:
              run.status,
          })
        )
      );
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // FILTER
  const filteredSubs =
    subscriptions.filter((sub) => {
      const matchesSearch =
        sub.customerName
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        sub.address
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          );

      const matchesStatus =
        activeFilter === 'All' ||
        sub.status ===
          activeFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  // ANALYTICS
  const totalLitres = useMemo(
    () =>
      subscriptions.reduce(
        (acc, item) =>
          acc + item.quantity,
        0
      ),
    [subscriptions]
  );

  const activeCustomers =
    subscriptions.filter(
      (s) =>
        s.status === 'Active'
    ).length;

  const pendingBottles =
    subscriptions.reduce(
      (acc, item) =>
        acc + item.bottlesDue,
      0
    );

  // ACTIONS
  const adjustVolume = async (
    id: string,
    delta: number
  ) => {
    const match =
      subscriptions.find(
        (s) => s.id === id
      );

    if (!match) return;

    const nextQty = Math.max(
      0.5,
      match.quantity + delta
    );

    await supabase
      .from('milk_customers')
      .update({
        quantity_liters:
          nextQty,
      })
      .eq('id', id);

    fetchData();
  };

  const toggleStatus = async (
    id: string
  ) => {
    const sub =
      subscriptions.find(
        (s) => s.id === id
      );

    if (!sub) return;

    const next =
      sub.status ===
      'Active'
        ? 'Paused'
        : 'Active';

    await supabase
      .from('milk_customers')
      .update({
        status: next,
      })
      .eq('id', id);

    fetchData();
  };

  const returnBottle =
    async (
      id: string,
      amount: number
    ) => {
      const sub =
        subscriptions.find(
          (s) => s.id === id
        );

      if (!sub) return;

      await supabase
        .from('milk_customers')
        .update({
          bottles_due:
            Math.max(
              0,
              sub.bottlesDue -
                amount
            ),
        })
        .eq('id', id);

      fetchData();
    };

  const addQualityLog =
    async () => {
      await supabase
        .from(
          'milk_quality_log'
        )
        .insert([
          {
            merchant_id:
              profile?.id,
            date: 'Today',
            fat,
            snf,
            lacto,
            temp,
            status:
              'Approved',
          },
        ]);

      Alert.alert(
        'Quality Logged',
        'Transparency. The thing most dairy companies fear.'
      );

      fetchData();
    };

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
            'Milk & Dairy',
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
        {loading ? (
          <ActivityIndicator
            size="large"
            color={
              colors.primary
            }
            style={{
              marginTop: 50,
            }}
          />
        ) : (
          <>
            {/* ANALYTICS */}
            <GlassCard
              style={[
                styles.analyticsCard,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >
              <View
                style={
                  styles.analyticsTop
                }
              >
                <View>
                  <Text
                    style={
                      styles.analyticsMini
                    }
                  >
                    DAILY DAIRY FLOW
                  </Text>

                  <Text
                    style={
                      styles.analyticsValue
                    }
                  >
                    {totalLitres}
                    L
                  </Text>
                </View>

                <Truck
                  size={34}
                  color="#FFF"
                />
              </View>

              <View
                style={
                  styles.analyticsDivider
                }
              />

              <View
                style={
                  styles.analyticsStats
                }
              >
                <View>
                  <Text
                    style={
                      styles.analyticsStatValue
                    }
                  >
                    {
                      activeCustomers
                    }
                  </Text>

                  <Text
                    style={
                      styles.analyticsStatLabel
                    }
                  >
                    Active
                  </Text>
                </View>

                <View>
                  <Text
                    style={
                      styles.analyticsStatValue
                    }
                  >
                    {
                      pendingBottles
                    }
                  </Text>

                  <Text
                    style={
                      styles.analyticsStatLabel
                    }
                  >
                    Bottles
                  </Text>
                </View>

                <View>
                  <Text
                    style={
                      styles.analyticsStatValue
                    }
                  >
                    {
                      dispatchRuns.length
                    }
                  </Text>

                  <Text
                    style={
                      styles.analyticsStatLabel
                    }
                  >
                    Routes
                  </Text>
                </View>
              </View>
            </GlassCard>

            {/* SUBSCRIPTIONS */}
            {activeTab ===
              'subs' && (
              <>
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Subscriptions
                </Text>

                <View
                  style={[
                    styles.searchBar,
                    {
                      borderColor:
                        colors.border,
                      backgroundColor:
                        colors.surface,
                    },
                  ]}
                >
                  <TextInput
                    placeholder="Search customers..."
                    placeholderTextColor={
                      colors.textMuted
                    }
                    value={
                      searchQuery
                    }
                    onChangeText={
                      setSearchQuery
                    }
                    style={{
                      flex: 1,
                      color:
                        colors.text,
                    }}
                  />
                </View>

                <View
                  style={
                    styles.filterRow
                  }
                >
                  {[
                    'All',
                    'Active',
                    'Paused',
                  ].map(
                    (filter) => {
                      const active =
                        activeFilter ===
                        filter;

                      return (
                        <TouchableOpacity
                          key={
                            filter
                          }
                          style={[
                            styles.filterChip,
                            {
                              borderColor:
                                active
                                  ? colors.primary
                                  : colors.border,
                              backgroundColor:
                                active
                                  ? colors.primary +
                                    '20'
                                  : colors.surface,
                            },
                          ]}
                          onPress={() =>
                            setActiveFilter(
                              filter as any
                            )
                          }
                        >
                          <Text
                            style={{
                              color:
                                active
                                  ? colors.primary
                                  : colors.textMuted,
                              fontSize: 11,
                              fontWeight:
                                '700',
                            }}
                          >
                            {
                              filter
                            }
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>

                {filteredSubs.map(
                  (sub) => (
                    <GlassCard
                      key={sub.id}
                      style={
                        styles.subCard
                      }
                    >
                      <View
                        style={
                          styles.subHeader
                        }
                      >
                        <Image
                          source={{
                            uri: sub.avatar,
                          }}
                          style={
                            styles.avatar
                          }
                        />

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
                              sub.customerName
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
                              sub.address
                            }
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                sub.status ===
                                'Active'
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
                                sub.status ===
                                'Active'
                                  ? colors.success
                                  : colors.error,
                              fontSize: 9,
                              fontWeight:
                                '900',
                            }}
                          >
                            {
                              sub.status
                            }
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.subBody,
                          {
                            borderTopColor:
                              colors.border,
                          },
                        ]}
                      >
                        <View>
                          <Text
                            style={
                              styles.miniLabel
                            }
                          >
                            TYPE
                          </Text>

                          <Text
                            style={[
                              styles.boldText,
                              {
                                color:
                                  colors.text,
                              },
                            ]}
                          >
                            {
                              sub.milkType
                            }
                          </Text>
                        </View>

                        <View>
                          <Text
                            style={
                              styles.miniLabel
                            }
                          >
                            VOLUME
                          </Text>

                          <View
                            style={
                              styles.qtyRow
                            }
                          >
                            <TouchableOpacity
                              onPress={() =>
                                adjustVolume(
                                  sub.id,
                                  -0.5
                                )
                              }
                            >
                              <MinusCircle
                                size={
                                  22
                                }
                                color={
                                  colors.error
                                }
                              />
                            </TouchableOpacity>

                            <Text
                              style={[
                                styles.qtyText,
                                {
                                  color:
                                    colors.text,
                                },
                              ]}
                            >
                              {
                                sub.quantity
                              }
                              L
                            </Text>

                            <TouchableOpacity
                              onPress={() =>
                                adjustVolume(
                                  sub.id,
                                  0.5
                                )
                              }
                            >
                              <PlusCircle
                                size={
                                  22
                                }
                                color={
                                  colors.primary
                                }
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.actionRow,
                          {
                            borderTopColor:
                              colors.border,
                          },
                        ]}
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
                            Share.share({
                              message: `${sub.customerName}: ${sub.quantity}L scheduled.`,
                            })
                          }
                        >
                          <Share2
                            size={13}
                            color={
                              colors.text
                            }
                          />

                          <Text
                            style={[
                              styles.actionText,
                              {
                                color:
                                  colors.text,
                              },
                            ]}
                          >
                            Notify
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.actionBtn,
                            {
                              backgroundColor:
                                sub.status ===
                                'Active'
                                  ? colors.error +
                                    '15'
                                  : colors.success +
                                    '15',
                            },
                          ]}
                          onPress={() =>
                            toggleStatus(
                              sub.id
                            )
                          }
                        >
                          {sub.status ===
                          'Active' ? (
                            <>
                              <Pause
                                size={
                                  13
                                }
                                color={
                                  colors.error
                                }
                              />

                              <Text
                                style={[
                                  styles.actionText,
                                  {
                                    color:
                                      colors.error,
                                  },
                                ]}
                              >
                                Pause
                              </Text>
                            </>
                          ) : (
                            <>
                              <Play
                                size={
                                  13
                                }
                                color={
                                  colors.success
                                }
                              />

                              <Text
                                style={[
                                  styles.actionText,
                                  {
                                    color:
                                      colors.success,
                                  },
                                ]}
                              >
                                Resume
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </GlassCard>
                  )
                )}
              </>
            )}

            {/* BOTTLES */}
            {activeTab ===
              'bottles' && (
              <>
                {subscriptions
                  .filter(
                    (s) =>
                      s.bottlesDue >
                      0
                  )
                  .map((sub) => (
                    <GlassCard
                      key={sub.id}
                      style={
                        styles.bottleCard
                      }
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
                          sub.customerName
                        }
                      </Text>

                      <Text
                        style={{
                          color:
                            colors.textMuted,
                          marginTop: 4,
                        }}
                      >
                        Pending:{' '}
                        {
                          sub.bottlesDue
                        }{' '}
                        bottles
                      </Text>

                      <View
                        style={
                          styles.bottleBtnRow
                        }
                      >
                        <TouchableOpacity
                          style={[
                            styles.bottleBtn,
                            {
                              borderColor:
                                colors.primary,
                            },
                          ]}
                          onPress={() =>
                            returnBottle(
                              sub.id,
                              1
                            )
                          }
                        >
                          <Text
                            style={{
                              color:
                                colors.primary,
                              fontWeight:
                                '800',
                            }}
                          >
                            +1
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.bottleBtn,
                            {
                              borderColor:
                                colors.success,
                            },
                          ]}
                          onPress={() =>
                            returnBottle(
                              sub.id,
                              sub.bottlesDue
                            )
                          }
                        >
                          <Text
                            style={{
                              color:
                                colors.success,
                              fontWeight:
                                '800',
                            }}
                          >
                            Return All
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </GlassCard>
                  ))}
              </>
            )}

            {/* QUALITY */}
            {activeTab ===
              'quality' && (
              <>
                <GlassCard
                  style={
                    styles.qualityForm
                  }
                >
                  <View
                    style={
                      styles.formTitleRow
                    }
                  >
                    <Award
                      size={18}
                      color={
                        colors.primary
                      }
                    />

                    <Text
                      style={[
                        styles.formTitle,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      Quality Audit
                    </Text>
                  </View>

                  <View
                    style={
                      styles.gridRow
                    }
                  >
                    <Input
                      label="Fat"
                      value={fat}
                      setValue={
                        setFat
                      }
                      colors={
                        colors
                      }
                    />

                    <Input
                      label="SNF"
                      value={snf}
                      setValue={
                        setSnf
                      }
                      colors={
                        colors
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.gridRow
                    }
                  >
                    <Input
                      label="Lacto"
                      value={lacto}
                      setValue={
                        setLacto
                      }
                      colors={
                        colors
                      }
                    />

                    <Input
                      label="Temp"
                      value={temp}
                      setValue={
                        setTemp
                      }
                      colors={
                        colors
                      }
                    />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.submitBtn,
                      {
                        backgroundColor:
                          colors.primary,
                      },
                    ]}
                    onPress={
                      addQualityLog
                    }
                  >
                    <Text
                      style={
                        styles.submitText
                      }
                    >
                      Save Audit
                    </Text>
                  </TouchableOpacity>
                </GlassCard>

                {qualityLogs.map(
                  (
                    log,
                    index
                  ) => (
                    <GlassCard
                      key={index}
                      style={
                        styles.logCard
                      }
                    >
                      <View
                        style={
                          styles.logHeader
                        }
                      >
                        <Text
                          style={{
                            color:
                              colors.text,
                            fontWeight:
                              '900',
                          }}
                        >
                          {
                            log.date
                          }
                        </Text>

                        <View
                          style={[
                            styles.approvedBadge,
                            {
                              backgroundColor:
                                colors.success +
                                '20',
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color:
                                colors.success,
                              fontSize: 9,
                              fontWeight:
                                '900',
                            }}
                          >
                            {
                              log.status
                            }
                          </Text>
                        </View>
                      </View>

                      <View
                        style={
                          styles.metricsRow
                        }
                      >
                        {[
                          [
                            'Fat',
                            log.fat,
                          ],
                          [
                            'SNF',
                            log.snf,
                          ],
                          [
                            'Lacto',
                            log.lacto,
                          ],
                          [
                            'Temp',
                            log.temp,
                          ],
                        ].map(
                          (
                            item
                          ) => (
                            <View
                              key={
                                item[0]
                              }
                            >
                              <Text
                                style={
                                  styles.metricLabel
                                }
                              >
                                {
                                  item[0]
                                }
                              </Text>

                              <Text
                                style={[
                                  styles.metricValue,
                                  {
                                    color:
                                      colors.text,
                                  },
                                ]}
                              >
                                {
                                  item[1]
                                }
                              </Text>
                            </View>
                          )
                        )}
                      </View>
                    </GlassCard>
                  )
                )}
              </>
            )}

            {/* ROUTES */}
            {activeTab ===
              'routes' && (
              <>
                {dispatchRuns.map(
                  (run) => {
                    const progress =
                      (run.completed /
                        run.total) *
                      100;

                    return (
                      <GlassCard
                        key={run.id}
                        style={
                          styles.routeCard
                        }
                      >
                        <View
                          style={
                            styles.routeHeader
                          }
                        >
                          <View
                            style={{
                              flex: 1,
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
                                run.zone
                              }
                            </Text>

                            <Text
                              style={{
                                color:
                                  colors.textMuted,
                                fontSize: 11,
                              }}
                            >
                              Runner:{' '}
                              {
                                run.runner
                              }
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor:
                                  run.status ===
                                  'Delivered'
                                    ? colors.success +
                                      '20'
                                    : colors.accent +
                                      '20',
                              },
                            ]}
                          >
                            <Text
                              style={{
                                color:
                                  run.status ===
                                  'Delivered'
                                    ? colors.success
                                    : colors.accent,
                                fontSize: 9,
                                fontWeight:
                                  '900',
                              }}
                            >
                              {
                                run.status
                              }
                            </Text>
                          </View>
                        </View>

                        <View
                          style={{
                            marginTop: 12,
                          }}
                        >
                          <Text
                            style={
                              styles.miniLabel
                            }
                          >
                            DELIVERY
                          </Text>

                          <Text
                            style={[
                              styles.boldText,
                              {
                                color:
                                  colors.text,
                              },
                            ]}
                          >
                            {
                              run.completed
                            }
                            /
                            {
                              run.total
                            }{' '}
                            homes
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.progressBg,
                            {
                              backgroundColor:
                                colors.border,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${progress}%`,
                                backgroundColor:
                                  colors.primary,
                              },
                            ]}
                          />
                        </View>

                        <View
                          style={
                            styles.routeBtnRow
                          }
                        >
                          <TouchableOpacity
                            style={[
                              styles.routeBtn,
                              {
                                backgroundColor:
                                  colors.surface,
                              },
                            ]}
                            onPress={() =>
                              Alert.alert(
                                'GPS',
                                `${run.runner} is somewhere fighting traffic and human existence.`
                              )
                            }
                          >
                            <MapPin
                              size={13}
                              color={
                                colors.text
                              }
                            />

                            <Text
                              style={[
                                styles.actionText,
                                {
                                  color:
                                    colors.text,
                                },
                              ]}
                            >
                              Trace
                            </Text>
                          </TouchableOpacity>

                          {run.status !==
                            'Delivered' && (
                            <TouchableOpacity
                              style={[
                                styles.routeBtn,
                                {
                                  backgroundColor:
                                    colors.primary,
                                },
                              ]}
                              onPress={async () => {
                                await supabase
                                  .from(
                                    'milk_dispatch_runs'
                                  )
                                  .update(
                                    {
                                      completed:
                                        run.total,
                                      status:
                                        'Delivered',
                                    }
                                  )
                                  .eq(
                                    'id',
                                    run.id
                                  );

                                fetchData();
                              }}
                            >
                              <CheckCircle2
                                size={
                                  13
                                }
                                color="#FFF"
                              />

                              <Text
                                style={[
                                  styles.actionText,
                                  {
                                    color:
                                      '#FFF',
                                  },
                                ]}
                              >
                                Delivered
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </GlassCard>
                    );
                  }
                )}
              </>
            )}

            <View
              style={{
                height: 120,
              }}
            />
          </>
        )}
      </ScrollView>

      {/* BOTTOM NAV */}
      <View
        style={[
          styles.bottomBar,
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
            id: 'subs',
            label: 'Subs',
            icon: Users,
          },
          {
            id: 'bottles',
            label: 'Bottles',
            icon: RefreshCw,
          },
          {
            id: 'quality',
            label: 'Quality',
            icon: Flame,
          },
          {
            id: 'routes',
            label: 'Routes',
            icon: Truck,
          },
        ].map((tab) => {
          const Icon = tab.icon;

          const active =
            activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.bottomBtn,
                active && {
                  backgroundColor:
                    colors.primary +
                    '20',
                },
              ]}
              onPress={() =>
                setActiveTab(
                  tab.id as TabType
                )
              }
            >
              <Icon
                size={20}
                color={
                  active
                    ? colors.primary
                    : colors.textMuted
                }
              />

              <Text
                style={{
                  color: active
                    ? colors.primary
                    : colors.textMuted,
                  fontSize: 10,
                  fontWeight: '900',
                }}
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

function Input({
  label,
  value,
  setValue,
  colors,
}: any) {
  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: 10,
          color: colors.textMuted,
          marginBottom: 4,
          fontWeight: '700',
        }}
      >
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={setValue}
        style={[
          styles.input,
          {
            borderColor:
              colors.border,
            color: colors.text,
            backgroundColor:
              colors.surface,
          },
        ]}
      />
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

  analyticsCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
  },

  analyticsTop: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  analyticsMini: {
    color:
      'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '900',
  },

  analyticsValue: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 4,
  },

  analyticsDivider: {
    height: 1,
    backgroundColor:
      'rgba(255,255,255,0.15)',
    marginVertical: 16,
  },

  analyticsStats: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
  },

  analyticsStatValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },

  analyticsStatLabel: {
    color:
      'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 16,
  },

  searchBar: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginBottom: 12,
  },

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },

  subCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  customerName: {
    fontSize: 15,
    fontWeight: '900',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  subBody: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent:
      'space-between',
  },

  miniLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '800',
  },

  boldText: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4,
  },

  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },

  qtyText: {
    fontSize: 15,
    fontWeight: '900',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },

  actionBtn: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },

  actionText: {
    fontSize: 11,
    fontWeight: '800',
  },

  bottleCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  bottleBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  bottleBtn: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  qualityForm: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },

  formTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },

  formTitle: {
    fontSize: 15,
    fontWeight: '900',
  },

  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },

  input: {
    height: 42,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },

  submitBtn: {
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  submitText: {
    color: '#FFF',
    fontWeight: '900',
  },

  logCard: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 10,
  },

  logHeader: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  approvedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  metricsRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
  },

  metricLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '800',
  },

  metricValue: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4,
  },

  routeCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressBg: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 14,
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
  },

  routeBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  routeBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },

  bottomBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    height: 74,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  bottomBtn: {
    flex: 1,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
});