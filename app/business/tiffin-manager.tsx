// Major cleanup + production-style refactor for your TiffinManagerScreen.
// Because apparently food delivery for hostel students now requires
// analytics dashboards, QR simulations, kitchen intelligence,
// dispatch logistics, and emotional support for paneer shortages.

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
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  MapPin,
  Pause,
  Play,
  Plus,
  Printer,
  Search,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  Utensils,
} from 'lucide-react-native';

import { GlassCard } from '@/components/GlassCard';
import { CustomerBusinessView } from '@/components/CustomerBusinessView';

import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

import { Spacing } from '@/constants/Theme';

type ActiveTab =
  | 'subs'
  | 'menu'
  | 'scanner'
  | 'kitchen'
  | 'dispatch';

export default function TiffinManagerScreen() {
  const { userRole, businessType } =
    useApp();

  if (
    userRole === 'customer' ||
    businessType !== 'Tiffin'
  ) {
    return (
      <CustomerBusinessView type="Tiffin" />
    );
  }

  return <MerchantScreen />;
}

function MerchantScreen() {
  const { colors, profile } =
    useApp();

  const [activeTab, setActiveTab] =
    useState<ActiveTab>('subs');

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [subscriptions, setSubscriptions] =
    useState<any[]>([]);

  const [menu, setMenu] =
    useState<any[]>([]);

  const [dispatches, setDispatches] =
    useState<any[]>([]);

  // SEARCH + FILTER
  const [search, setSearch] =
    useState('');

  const [filter, setFilter] =
    useState<
      'All' | 'Active' | 'Paused'
    >('All');

  // FORM
  const [showForm, setShowForm] =
    useState(false);

  const [name, setName] =
    useState('');

  const [hostel, setHostel] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [plan, setPlan] =
    useState(
      'Basic Veg (2 Meals)'
    );

  const [days, setDays] =
    useState('30');

  const [spicy, setSpicy] =
    useState('Medium');

  const [allergy, setAllergy] =
    useState('');

  // SCANNER
  const [scanCode, setScanCode] =
    useState('');

  const [scanning, setScanning] =
    useState(false);

  const [scanResult, setScanResult] =
    useState<any>(null);

  // ANALYTICS
  const totalSubs = useMemo(
    () => subscriptions.length,
    [subscriptions]
  );

  const activeSubs = useMemo(
    () =>
      subscriptions.filter(
        (s) =>
          s.status === 'Active'
      ).length,
    [subscriptions]
  );

  const expiringSoon = useMemo(
    () =>
      subscriptions.filter(
        (s) => s.daysLeft <= 5
      ).length,
    [subscriptions]
  );

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const [
        subsRes,
        menuRes,
        dispatchRes,
      ] = await Promise.all([
        supabase
          .from(
            'tiffin_subscriptions'
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
            'tiffin_weekly_menu'
          )
          .select('*')
          .eq(
            'merchant_id',
            profile.id
          ),

        supabase
          .from(
            'tiffin_dispatch_jobs'
          )
          .select('*')
          .eq(
            'merchant_id',
            profile.id
          ),
      ]);

      setSubscriptions(
        (subsRes.data || []).map(
          (s: any) => ({
            ...s,
            studentName:
              s.student_name,
            hostel:
              s.hostel_address,
            plan:
              s.plan_type,
            daysLeft:
              s.days_left,
            spicy:
              s.spice_level,
            allergy:
              s.allergies,
            avatar:
              'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&q=80',
          })
        )
      );

      setMenu(menuRes.data || []);
      setDispatches(
        dispatchRes.data || []
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

  // FILTERED SUBS
  const filteredSubs =
    subscriptions.filter((s) => {
      const q =
        search.toLowerCase();

      const matchesSearch =
        s.studentName
          ?.toLowerCase()
          .includes(q) ||
        s.hostel
          ?.toLowerCase()
          .includes(q) ||
        s.plan
          ?.toLowerCase()
          .includes(q);

      const matchesFilter =
        filter === 'All' ||
        s.status === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });

  // CREATE SUBSCRIPTION
  const addSubscription =
    async () => {
      if (
        !name ||
        !hostel ||
        !phone
      ) {
        Alert.alert(
          'Missing Fields',
          'Food logistics continues collapsing under the crushing burden of incomplete forms.'
        );

        return;
      }

      await supabase
        .from(
          'tiffin_subscriptions'
        )
        .insert([
          {
            merchant_id:
              profile?.id,
            student_name: name,
            hostel_address:
              hostel,
            plan_type: plan,
            days_left:
              parseInt(days) || 30,
            spice_level:
              spicy,
            allergies:
              allergy ||
              'None',
            status: 'Active',
            phone,
          },
        ]);

      Alert.alert(
        'Subscription Added',
        `${name} can now survive hostel life with organized carbohydrates.`
      );

      setShowForm(false);

      setName('');
      setHostel('');
      setPhone('');
      setPlan(
        'Basic Veg (2 Meals)'
      );
      setDays('30');
      setSpicy('Medium');
      setAllergy('');

      fetchData();
    };

  // TOGGLE STATUS
  const toggleStatus =
    async (id: string) => {
      const sub =
        subscriptions.find(
          (s) => s.id === id
        );

      if (!sub) return;

      const next =
        sub.status === 'Active'
          ? 'Paused'
          : 'Active';

      await supabase
        .from(
          'tiffin_subscriptions'
        )
        .update({
          status: next,
        })
        .eq('id', id);

      fetchData();
    };

  // SCAN
  const simulateScan =
    async () => {
      if (!scanCode) {
        Alert.alert(
          'Missing Token',
          'The scanner cannot read your thoughts. Yet.'
        );

        return;
      }

      setScanning(true);

      setTimeout(() => {
        const found =
          subscriptions.find(
            (s) =>
              s.studentName
                .toLowerCase()
                .includes(
                  scanCode.toLowerCase()
                ) ||
              s.id
                .toLowerCase()
                .includes(
                  scanCode.toLowerCase()
                )
          );

        setScanning(false);

        if (!found) {
          setScanResult({
            success: false,
            title:
              'Invalid Token',
            body:
              'No active mess plan detected.',
          });

          return;
        }

        if (
          found.status ===
          'Paused'
        ) {
          setScanResult({
            success: false,
            title:
              'Subscription Paused',
            body: `${found.studentName} currently has meal access disabled.`,
          });

          return;
        }

        setScanResult({
          success: true,
          title:
            'Meal Verified',
          body: `${found.studentName} successfully checked in.`,
        });
      }, 1200);
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
            'Tiffin Manager',
          headerTintColor:
            colors.primary,
          headerStyle: {
            backgroundColor:
              colors.background,
          },
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
        {loading ? (
          <View
            style={{
              padding: 40,
              alignItems:
                'center',
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
            {/* DASHBOARD */}
            <GlassCard
              style={[
                styles.analyticsCard,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >
              <Text
                style={
                  styles.analyticsTitle
                }
              >
                TIFFIN OPERATIONS
              </Text>

              <View
                style={
                  styles.analyticsRow
                }
              >
                <View>
                  <Text
                    style={
                      styles.analyticsNumber
                    }
                  >
                    {totalSubs}
                  </Text>

                  <Text
                    style={
                      styles.analyticsLabel
                    }
                  >
                    Total Subs
                  </Text>
                </View>

                <View>
                  <Text
                    style={
                      styles.analyticsNumber
                    }
                  >
                    {activeSubs}
                  </Text>

                  <Text
                    style={
                      styles.analyticsLabel
                    }
                  >
                    Active
                  </Text>
                </View>

                <View>
                  <Text
                    style={
                      styles.analyticsNumber
                    }
                  >
                    {
                      expiringSoon
                    }
                  </Text>

                  <Text
                    style={
                      styles.analyticsLabel
                    }
                  >
                    Expiring
                  </Text>
                </View>
              </View>
            </GlassCard>

            {/* SUBSCRIPTIONS */}
            {activeTab ===
              'subs' && (
              <>
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
                      size={18}
                      color={
                        colors.textMuted
                      }
                    />

                    <TextInput
                      placeholder="Search students..."
                      placeholderTextColor={
                        colors.textMuted
                      }
                      value={search}
                      onChangeText={
                        setSearch
                      }
                      style={{
                        flex: 1,
                        marginLeft: 8,
                        color:
                          colors.text,
                      }}
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
                      setShowForm(
                        !showForm
                      )
                    }
                  >
                    <Plus
                      size={20}
                      color="#FFF"
                    />
                  </TouchableOpacity>
                </View>

                {/* FILTERS */}
                <View
                  style={
                    styles.filterRow
                  }
                >
                  {[
                    'All',
                    'Active',
                    'Paused',
                  ].map((f) => {
                    const active =
                      filter === f;

                    return (
                      <TouchableOpacity
                        key={f}
                        style={[
                          styles.filterChip,
                          {
                            backgroundColor:
                              active
                                ? colors.primary +
                                  '20'
                                : colors.surface,
                            borderColor:
                              active
                                ? colors.primary
                                : colors.border,
                          },
                        ]}
                        onPress={() =>
                          setFilter(
                            f as any
                          )
                        }
                      >
                        <Text
                          style={{
                            color:
                              active
                                ? colors.primary
                                : colors.textMuted,
                            fontSize: 10,
                            fontWeight:
                              '800',
                          }}
                        >
                          {f}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* FORM */}
                {showForm && (
                  <GlassCard
                    style={
                      styles.formCard
                    }
                  >
                    <View
                      style={
                        styles.formHeader
                      }
                    >
                      <View
                        style={
                          styles.row
                        }
                      >
                        <Sparkles
                          size={16}
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
                          Add
                          Subscription
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() =>
                          setShowForm(
                            false
                          )
                        }
                      >
                        <Text
                          style={{
                            color:
                              colors.error,
                            fontWeight:
                              '900',
                          }}
                        >
                          Close
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {[
                      [
                        name,
                        setName,
                        'Student Name',
                      ],
                      [
                        hostel,
                        setHostel,
                        'Hostel Address',
                      ],
                      [
                        phone,
                        setPhone,
                        'Phone Number',
                      ],
                      [
                        plan,
                        setPlan,
                        'Meal Plan',
                      ],
                      [
                        days,
                        setDays,
                        'Days',
                      ],
                    ].map(
                      (
                        item,
                        index
                      ) => (
                        <TextInput
                          key={index}
                          value={
                            item[0] as string
                          }
                          onChangeText={
                            item[1] as any
                          }
                          placeholder={
                            item[2] as string
                          }
                          placeholderTextColor={
                            colors.textMuted
                          }
                          style={[
                            styles.input,
                            {
                              color:
                                colors.text,
                              borderColor:
                                colors.border,
                              backgroundColor:
                                colors.surface,
                            },
                          ]}
                        />
                      )
                    )}

                    <TouchableOpacity
                      style={[
                        styles.submitBtn,
                        {
                          backgroundColor:
                            colors.primary,
                        },
                      ]}
                      onPress={
                        addSubscription
                      }
                    >
                      <Text
                        style={
                          styles.submitText
                        }
                      >
                        Create Plan
                      </Text>
                    </TouchableOpacity>
                  </GlassCard>
                )}

                {/* LIST */}
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
                          styles.cardHeader
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
                              styles.studentName,
                              {
                                color:
                                  colors.text,
                              },
                            ]}
                          >
                            {
                              sub.studentName
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
                              sub.hostel
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
                              fontWeight:
                                '900',
                              fontSize: 9,
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
                          styles.planBox,
                          {
                            borderTopColor:
                              colors.border,
                          },
                        ]}
                      >
                        <View>
                          <Text
                            style={
                              styles.smallLabel
                            }
                          >
                            PLAN
                          </Text>

                          <Text
                            style={{
                              color:
                                colors.text,
                              fontWeight:
                                '800',
                            }}
                          >
                            {
                              sub.plan
                            }
                          </Text>
                        </View>

                        <View
                          style={{
                            alignItems:
                              'flex-end',
                          }}
                        >
                          <Text
                            style={
                              styles.smallLabel
                            }
                          >
                            DAYS LEFT
                          </Text>

                          <Text
                            style={{
                              color:
                                sub.daysLeft <=
                                5
                                  ? colors.error
                                  : colors.text,
                              fontWeight:
                                '900',
                            }}
                          >
                            {
                              sub.daysLeft
                            }
                          </Text>
                        </View>
                      </View>

                      <View
                        style={
                          styles.actionsRow
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
                            Share.share({
                              message: `Meal token for ${sub.studentName}: ${sub.id}`,
                            })
                          }
                        >
                          <Share2
                            size={14}
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
                            Share
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
                                    '20'
                                  : colors.success +
                                    '20',
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
                            <Pause
                              size={14}
                              color={
                                colors.error
                              }
                            />
                          ) : (
                            <Play
                              size={14}
                              color={
                                colors.success
                              }
                            />
                          )}

                          <Text
                            style={[
                              styles.actionText,
                              {
                                color:
                                  sub.status ===
                                  'Active'
                                    ? colors.error
                                    : colors.success,
                              },
                            ]}
                          >
                            {sub.status ===
                            'Active'
                              ? 'Pause'
                              : 'Resume'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </GlassCard>
                  )
                )}
              </>
            )}

            {/* MENU */}
            {activeTab ===
              'menu' && (
              <>
                {menu.map(
                  (
                    item,
                    index
                  ) => (
                    <GlassCard
                      key={index}
                      style={
                        styles.menuCard
                      }
                    >
                      <View
                        style={
                          styles.row
                        }
                      >
                        <Calendar
                          size={16}
                          color={
                            colors.primary
                          }
                        />

                        <Text
                          style={[
                            styles.menuTitle,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {item.day}
                        </Text>
                      </View>

                      <TextInput
                        multiline
                        value={
                          item.lunch
                        }
                        onChangeText={(
                          txt
                        ) => {
                          setMenu(
                            (
                              prev
                            ) =>
                              prev.map(
                                (
                                  p,
                                  i
                                ) =>
                                  i ===
                                  index
                                    ? {
                                        ...p,
                                        lunch:
                                          txt,
                                      }
                                    : p
                              )
                          );
                        }}
                        style={[
                          styles.menuInput,
                          {
                            color:
                              colors.text,
                            borderColor:
                              colors.border,
                          },
                        ]}
                      />

                      <TextInput
                        multiline
                        value={
                          item.dinner
                        }
                        onChangeText={(
                          txt
                        ) => {
                          setMenu(
                            (
                              prev
                            ) =>
                              prev.map(
                                (
                                  p,
                                  i
                                ) =>
                                  i ===
                                  index
                                    ? {
                                        ...p,
                                        dinner:
                                          txt,
                                      }
                                    : p
                              )
                          );
                        }}
                        style={[
                          styles.menuInput,
                          {
                            color:
                              colors.text,
                            borderColor:
                              colors.border,
                          },
                        ]}
                      />
                    </GlassCard>
                  )
                )}
              </>
            )}

            {/* SCANNER */}
            {activeTab ===
              'scanner' && (
              <GlassCard
                style={
                  styles.scannerCard
                }
              >
                <Cpu
                  size={44}
                  color={
                    colors.primary
                  }
                />

                <Text
                  style={[
                    styles.scannerTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Meal Scanner
                </Text>

                <TextInput
                  value={scanCode}
                  onChangeText={
                    setScanCode
                  }
                  placeholder="Enter Token"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  style={[
                    styles.input,
                    {
                      width: '100%',
                      color:
                        colors.text,
                      borderColor:
                        colors.border,
                      backgroundColor:
                        colors.surface,
                    },
                  ]}
                />

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    {
                      width: '100%',
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                  onPress={
                    simulateScan
                  }
                >
                  {scanning ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text
                      style={
                        styles.submitText
                      }
                    >
                      Scan Token
                    </Text>
                  )}
                </TouchableOpacity>

                {scanResult && (
                  <View
                    style={[
                      styles.scanResult,
                      {
                        borderColor:
                          scanResult.success
                            ? colors.success
                            : colors.error,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          scanResult.success
                            ? colors.success
                            : colors.error,
                        fontWeight:
                          '900',
                      }}
                    >
                      {
                        scanResult.title
                      }
                    </Text>

                    <Text
                      style={{
                        color:
                          colors.textMuted,
                        marginTop: 4,
                      }}
                    >
                      {
                        scanResult.body
                      }
                    </Text>
                  </View>
                )}
              </GlassCard>
            )}

            {/* KITCHEN */}
            {activeTab ===
              'kitchen' && (
              <GlassCard
                style={
                  styles.kitchenCard
                }
              >
                <View
                  style={
                    styles.formHeader
                  }
                >
                  <View
                    style={
                      styles.row
                    }
                  >
                    <TrendingUp
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
                      Kitchen
                      Metrics
                    </Text>
                  </View>

                  <Printer
                    size={18}
                    color={
                      colors.text
                    }
                  />
                </View>

                <View
                  style={
                    styles.metricGrid
                  }
                >
                  {[
                    [
                      'Veg',
                      subscriptions.filter(
                        (
                          s
                        ) =>
                          s.plan
                            .toLowerCase()
                            .includes(
                              'veg'
                            )
                      )
                        .length,
                    ],
                    [
                      'Spicy',
                      subscriptions.filter(
                        (
                          s
                        ) =>
                          s.spicy ===
                          'Spicy'
                      )
                        .length,
                    ],
                    [
                      'Allergy',
                      subscriptions.filter(
                        (
                          s
                        ) =>
                          s.allergy !==
                          'None'
                      )
                        .length,
                    ],
                  ].map(
                    (
                      item,
                      index
                    ) => (
                      <View
                        key={index}
                        style={
                          styles.metricBox
                        }
                      >
                        <Text
                          style={{
                            color:
                              colors.primary,
                            fontWeight:
                              '900',
                            fontSize: 22,
                          }}
                        >
                          {
                            item[1]
                          }
                        </Text>

                        <Text
                          style={{
                            color:
                              colors.textMuted,
                            fontSize: 10,
                          }}
                        >
                          {
                            item[0]
                          }
                        </Text>
                      </View>
                    )
                  )}
                </View>
              </GlassCard>
            )}

            {/* DISPATCH */}
            {activeTab ===
              'dispatch' && (
              <>
                {dispatches.map(
                  (
                    item,
                    index
                  ) => (
                    <GlassCard
                      key={index}
                      style={
                        styles.dispatchCard
                      }
                    >
                      <View
                        style={
                          styles.cardHeader
                        }
                      >
                        <View
                          style={{
                            flex: 1,
                          }}
                        >
                          <Text
                            style={[
                              styles.studentName,
                              {
                                color:
                                  colors.text,
                              },
                            ]}
                          >
                            {
                              item.student_name
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
                              item.hostel
                            }
                          </Text>
                        </View>

                        <MapPin
                          size={18}
                          color={
                            colors.primary
                          }
                        />
                      </View>

                      <View
                        style={[
                          styles.planBox,
                          {
                            borderTopColor:
                              colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              colors.text,
                          }}
                        >
                          Runner:{' '}
                          {
                            item.runner
                          }
                        </Text>

                        <Text
                          style={{
                            color:
                              colors.primary,
                            fontWeight:
                              '900',
                          }}
                        >
                          {
                            item.status
                          }
                        </Text>
                      </View>
                    </GlassCard>
                  )
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
            id: 'menu',
            label: 'Menu',
            icon: Utensils,
          },
          {
            id: 'scanner',
            label: 'Scanner',
            icon: Cpu,
          },
          {
            id: 'kitchen',
            label: 'Kitchen',
            icon: Sparkles,
          },
          {
            id: 'dispatch',
            label: 'Dispatch',
            icon: MapPin,
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
                  tab.id as ActiveTab
                )
              }
            >
              <Icon
                size={18}
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
                  fontSize: 9,
                  fontWeight: '800',
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

  analyticsTitle: {
    color:
      'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 18,
  },

  analyticsRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
  },

  analyticsNumber: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
  },

  analyticsLabel: {
    color:
      'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 4,
  },

  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  searchBar: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },

  filterChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },

  formCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },

  formHeader: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  formTitle: {
    fontWeight: '900',
    fontSize: 15,
    marginLeft: 6,
  },

  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  submitBtn: {
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  submitText: {
    color: '#FFF',
    fontWeight: '900',
  },

  subCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  studentName: {
    fontSize: 15,
    fontWeight: '900',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  planBox: {
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent:
      'space-between',
  },

  smallLabel: {
    fontSize: 9,
    opacity: 0.6,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  actionBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  actionText: {
    fontSize: 11,
    fontWeight: '800',
  },

  menuCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  menuTitle: {
    fontWeight: '900',
    marginLeft: 8,
  },

  menuInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    minHeight: 70,
  },

  scannerCard: {
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
  },

  scannerTitle: {
    fontWeight: '900',
    fontSize: 18,
    marginVertical: 14,
  },

  scanResult: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },

  kitchenCard: {
    padding: 18,
    borderRadius: 22,
  },

  metricGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  metricBox: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor:
      'rgba(255,255,255,0.03)',
  },

  dispatchCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
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