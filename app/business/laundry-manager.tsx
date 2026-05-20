// LaundryManagerScreen.tsx
// Cleaner architecture, analytics, better UX, reusable flow.
// Because apparently humans now need enterprise dashboards for socks.

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
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
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock3,
  Droplets,
  Flame,
  Plus,
  QrCode,
  Search,
  Share2,
  Shirt,
  Sparkles,
  TimerReset,
  Waves,
} from 'lucide-react-native';

import { Spacing } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { CustomerBusinessView } from '@/components/CustomerBusinessView';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

type TabType =
  | 'orders'
  | 'delicate'
  | 'schedule';

const STATUS_FLOW = [
  'Received',
  'In-Wash',
  'Ironing',
  'Ready for Pick',
  'Completed',
];

export default function LaundryManagerScreen() {
  const { userRole, businessType } =
    useApp();

  if (
    userRole === 'customer' ||
    businessType !== 'Laundry'
  ) {
    return (
      <CustomerBusinessView type="Laundry" />
    );
  }

  return <LaundryMerchantScreen />;
}

function LaundryMerchantScreen() {
  const { colors, profile } =
    useApp();

  const [activeTab, setActiveTab] =
    useState<TabType>('orders');

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [orders, setOrders] = useState<
    any[]
  >([]);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<
      | 'All'
      | 'Received'
      | 'In-Wash'
      | 'Ironing'
      | 'Ready for Pick'
    >('All');

  // MODAL
  const [showNewOrder, setShowNewOrder] =
    useState(false);

  // FORM
  const [customerName, setCustomerName] =
    useState('');

  const [room, setRoom] =
    useState('');

  const [items, setItems] =
    useState('6');

  const [serviceType, setServiceType] =
    useState('Wash & Iron');

  const [instructions, setInstructions] =
    useState('');

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const { data, error } =
        await supabase
          .from('laundry_orders')
          .select('*')
          .eq(
            'merchant_id',
            profile.id
          )
          .order('created_at', {
            ascending: false,
          });

      if (error) throw error;

      setOrders(
        (data || []).map(
          (row: any) => ({
            id: row.id,
            customerName:
              row.customer_name,
            room: row.room,
            items: row.items,
            serviceType:
              row.service_type,
            amount:
              parseFloat(
                row.amount
              ) || 0,
            status: row.status,
            delicateTag:
              row.delicate_tag,
            date:
              row.created_at
                ? new Date(
                    row.created_at
                  ).toLocaleDateString()
                : 'Today',
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

  // ANALYTICS
  const activeOrders =
    orders.filter(
      (o) =>
        o.status !== 'Completed'
    ).length;

  const delicateOrders =
    orders.filter(
      (o) => o.delicateTag
    ).length;

  const readyOrders =
    orders.filter(
      (o) =>
        o.status ===
        'Ready for Pick'
    ).length;

  const totalRevenue =
    orders.reduce(
      (sum, o) => sum + o.amount,
      0
    );

  // FILTER
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchesSearch =
        ord.customerName
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        ord.room
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        ord.serviceType
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          );

      const matchesStatus =
        statusFilter === 'All' ||
        ord.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        ord.status !== 'Completed'
      );
    });
  }, [
    orders,
    searchQuery,
    statusFilter,
  ]);

  const delicateWarnings =
    useMemo(() => {
      return orders.filter(
        (o) => o.delicateTag
      );
    }, [orders]);

  // ADD ORDER
  const addOrder = async () => {
    if (!customerName || !room) {
      Alert.alert(
        'Missing Details',
        'Please fill customer info.'
      );

      return;
    }

    try {
      let rate = 20;

      if (
        serviceType.includes(
          'Dry'
        )
      ) {
        rate = 70;
      }

      if (
        serviceType.includes(
          'Iron'
        )
      ) {
        rate = 30;
      }

      const qty =
        parseInt(items) || 5;

      const { error } =
        await supabase
          .from(
            'laundry_orders'
          )
          .insert([
            {
              merchant_id:
                profile?.id,
              customer_name:
                customerName,
              room,
              items: qty,
              service_type:
                serviceType,
              amount: qty * rate,
              status:
                'Received',
              delicate_tag:
                instructions ||
                null,
            },
          ]);

      if (error) throw error;

      Alert.alert(
        'Laundry Added',
        'Order created successfully.'
      );

      setCustomerName('');
      setRoom('');
      setItems('6');
      setInstructions('');
      setShowNewOrder(false);

      fetchData();
    } catch (e: any) {
      Alert.alert(
        'Error',
        e.message
      );
    }
  };

  // STATUS FLOW
  const updateStatus = async (
    id: string,
    currentStatus: string
  ) => {
    const currentIndex =
      STATUS_FLOW.indexOf(
        currentStatus
      );

    if (
      currentIndex === -1 ||
      currentIndex ===
        STATUS_FLOW.length - 1
    ) {
      return;
    }

    const nextStatus =
      STATUS_FLOW[
        currentIndex + 1
      ];

    try {
      const { error } =
        await supabase
          .from(
            'laundry_orders'
          )
          .update({
            status: nextStatus,
          })
          .eq('id', id);

      if (error) throw error;

      fetchData();

      if (
        nextStatus ===
        'Completed'
      ) {
        Alert.alert(
          'Completed',
          'Laundry order closed.'
        );
      }
    } catch (e: any) {
      Alert.alert(
        'Error',
        e.message
      );
    }
  };

  const verifyDelicate =
    async (id: string) => {
      try {
        const { error } =
          await supabase
            .from(
              'laundry_orders'
            )
            .update({
              status:
                'In-Wash',
            })
            .eq('id', id);

        if (error)
          throw error;

        Alert.alert(
          'Verified',
          'Garment marked safe.'
        );

        fetchData();
      } catch (e: any) {
        Alert.alert(
          'Error',
          e.message
        );
      }
    };

  const getNextActionLabel = (
    status: string
  ) => {
    switch (status) {
      case 'Received':
        return 'Start Washing';

      case 'In-Wash':
        return 'Move to Iron';

      case 'Ironing':
        return 'Ready for Pickup';

      case 'Ready for Pick':
        return 'Complete Order';

      default:
        return 'Processed';
    }
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
            'Laundry Hub',
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
        {/* HUD */}
        <GlassCard
          style={[
            styles.hudCard,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
        >
          <View
            style={
              styles.hudHeader
            }
          >
            <View>
              <Text
                style={
                  styles.hudMini
                }
              >
                TOTAL REVENUE
              </Text>

              <Text
                style={
                  styles.hudValue
                }
              >
                ₹
                {
                  totalRevenue
                }
              </Text>
            </View>

            <Waves
              size={34}
              color="#FFF"
            />
          </View>

          <View
            style={
              styles.hudDivider
            }
          />

          <View
            style={
              styles.hudStatsRow
            }
          >
            <View>
              <Text
                style={
                  styles.hudStatValue
                }
              >
                {
                  activeOrders
                }
              </Text>

              <Text
                style={
                  styles.hudStatLabel
                }
              >
                Active
              </Text>
            </View>

            <View>
              <Text
                style={
                  styles.hudStatValue
                }
              >
                {
                  delicateOrders
                }
              </Text>

              <Text
                style={
                  styles.hudStatLabel
                }
              >
                Delicate
              </Text>
            </View>

            <View>
              <Text
                style={
                  styles.hudStatValue
                }
              >
                {
                  readyOrders
                }
              </Text>

              <Text
                style={
                  styles.hudStatLabel
                }
              >
                Ready
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* ORDERS */}
        {activeTab === 'orders' && (
          <>
            <View
              style={
                styles.titleRow
              }
            >
              <View>
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Laundry Orders
                </Text>

                <Text
                  style={[
                    styles.sectionSub,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  Track wash,
                  ironing &
                  pickup flow
                </Text>
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
                  setShowNewOrder(
                    !showNewOrder
                  )
                }
              >
                <Plus
                  size={20}
                  color="#FFF"
                />
              </TouchableOpacity>
            </View>

            {/* SEARCH */}
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
                value={
                  searchQuery
                }
                onChangeText={
                  setSearchQuery
                }
                placeholder="Search customer, room..."
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

            {/* FILTER */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              style={{
                marginBottom: 16,
              }}
            >
              <View
                style={
                  styles.filterRow
                }
              >
                {[
                  'All',
                  'Received',
                  'In-Wash',
                  'Ironing',
                  'Ready for Pick',
                ].map((item) => {
                  const active =
                    statusFilter ===
                    item;

                  return (
                    <TouchableOpacity
                      key={item}
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
                        setStatusFilter(
                          item as any
                        )
                      }
                    >
                      <Text
                        style={{
                          color:
                            active
                              ? colors.primary
                              : colors.textMuted,
                          fontWeight:
                            '800',
                          fontSize: 11,
                        }}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* ADD ORDER */}
            {showNewOrder && (
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
                  <Sparkles
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
                    Create Laundry
                    Order
                  </Text>
                </View>

                <TextInput
                  placeholder="Customer Name"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  value={
                    customerName
                  }
                  onChangeText={
                    setCustomerName
                  }
                  style={[
                    styles.formInput,
                    {
                      borderColor:
                        colors.border,
                      color:
                        colors.text,
                      backgroundColor:
                        colors.surface,
                    },
                  ]}
                />

                <TextInput
                  placeholder="Room / Hostel"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  value={room}
                  onChangeText={
                    setRoom
                  }
                  style={[
                    styles.formInput,
                    {
                      borderColor:
                        colors.border,
                      color:
                        colors.text,
                      backgroundColor:
                        colors.surface,
                    },
                  ]}
                />

                <View
                  style={
                    styles.inlineGrid
                  }
                >
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={[
                        styles.inputLabel,
                        {
                          color:
                            colors.textMuted,
                        },
                      ]}
                    >
                      Clothes
                    </Text>

                    <TextInput
                      value={items}
                      onChangeText={
                        setItems
                      }
                      keyboardType="numeric"
                      style={[
                        styles.formInput,
                        {
                          borderColor:
                            colors.border,
                          color:
                            colors.text,
                          backgroundColor:
                            colors.surface,
                        },
                      ]}
                    />
                  </View>

                  <View
                    style={{
                      flex: 2,
                    }}
                  >
                    <Text
                      style={[
                        styles.inputLabel,
                        {
                          color:
                            colors.textMuted,
                        },
                      ]}
                    >
                      Service
                    </Text>

                    <View
                      style={
                        styles.serviceRow
                      }
                    >
                      {[
                        'Wash & Iron',
                        'Wash Only',
                        'Premium Dry Clean',
                      ].map(
                        (
                          service
                        ) => {
                          const active =
                            serviceType ===
                            service;

                          return (
                            <TouchableOpacity
                              key={
                                service
                              }
                              style={[
                                styles.serviceChip,
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
                                setServiceType(
                                  service
                                )
                              }
                            >
                              <Text
                                style={{
                                  color:
                                    active
                                      ? colors.primary
                                      : colors.textMuted,
                                  fontSize: 9,
                                  fontWeight:
                                    '700',
                                  textAlign:
                                    'center',
                                }}
                              >
                                {
                                  service
                                }
                              </Text>
                            </TouchableOpacity>
                          );
                        }
                      )}
                    </View>
                  </View>
                </View>

                <TextInput
                  placeholder="Special instructions"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  value={
                    instructions
                  }
                  onChangeText={
                    setInstructions
                  }
                  style={[
                    styles.formInput,
                    {
                      borderColor:
                        colors.border,
                      color:
                        colors.text,
                      backgroundColor:
                        colors.surface,
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
                    addOrder
                  }
                >
                  <Text
                    style={
                      styles.submitText
                    }
                  >
                    Create Order
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* LIST */}
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
              filteredOrders.map(
                (ord) => (
                  <GlassCard
                    key={ord.id}
                    style={
                      styles.orderCard
                    }
                  >
                    <View
                      style={
                        styles.orderHeader
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
                            ord.customerName
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
                            ord.room
                          }{' '}
                          •{' '}
                          {
                            ord.date
                          }
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              ord.status ===
                              'Ready for Pick'
                                ? colors.success +
                                  '20'
                                : colors.accent +
                                  '20',
                          },
                        ]}
                      >
                        <Clock3
                          size={
                            11
                          }
                          color={
                            ord.status ===
                            'Ready for Pick'
                              ? colors.success
                              : colors.accent
                          }
                        />

                        <Text
                          style={{
                            color:
                              ord.status ===
                              'Ready for Pick'
                                ? colors.success
                                : colors.accent,
                            fontSize: 9,
                            fontWeight:
                              '900',
                            marginLeft: 4,
                          }}
                        >
                          {
                            ord.status
                          }
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.detailsRow,
                        {
                          borderTopColor:
                            colors.border,
                        },
                      ]}
                    >
                      <View>
                        <Text
                          style={
                            styles.infoLabel
                          }
                        >
                          SERVICE
                        </Text>

                        <Text
                          style={[
                            styles.infoValue,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {
                            ord.serviceType
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
                            styles.infoLabel
                          }
                        >
                          ITEMS
                        </Text>

                        <Text
                          style={[
                            styles.infoValue,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {
                            ord.items
                          }
                        </Text>
                      </View>
                    </View>

                    {ord.delicateTag && (
                      <View
                        style={[
                          styles.warningBox,
                          {
                            backgroundColor:
                              colors.error +
                              '12',
                            borderColor:
                              colors.error +
                              '30',
                          },
                        ]}
                      >
                        <AlertTriangle
                          size={12}
                          color={
                            colors.error
                          }
                        />

                        <Text
                          style={{
                            color:
                              colors.error,
                            marginLeft: 6,
                            fontSize: 10,
                            fontWeight:
                              '700',
                            flex: 1,
                          }}
                        >
                          {
                            ord.delicateTag
                          }
                        </Text>
                      </View>
                    )}

                    <View
                      style={[
                        styles.priceRow,
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
                        Total
                        Charges
                      </Text>

                      <Text
                        style={[
                          styles.priceText,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        ₹
                        {
                          ord.amount
                        }
                      </Text>
                    </View>

                    <View
                      style={
                        styles.actionRow
                      }
                    >
                      <TouchableOpacity
                        style={[
                          styles.shareBtn,
                          {
                            backgroundColor:
                              colors.surface,
                          },
                        ]}
                        onPress={() =>
                          Share.share({
                            message: `Laundry order for ${ord.customerName} is currently ${ord.status}`,
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
                          style={{
                            color:
                              colors.text,
                            marginLeft: 5,
                            fontSize: 11,
                            fontWeight:
                              '700',
                          }}
                        >
                          Share
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.processBtn,
                          {
                            backgroundColor:
                              colors.primary,
                          },
                        ]}
                        onPress={() =>
                          updateStatus(
                            ord.id,
                            ord.status
                          )
                        }
                      >
                        <Text
                          style={{
                            color:
                              '#FFF',
                            fontWeight:
                              '900',
                            fontSize: 10,
                          }}
                        >
                          {getNextActionLabel(
                            ord.status
                          )}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </GlassCard>
                )
              )
            )}
          </>
        )}

        {/* DELICATE */}
        {activeTab ===
          'delicate' && (
          <>
            {delicateWarnings.map(
              (item) => (
                <GlassCard
                  key={item.id}
                  style={
                    styles.warningCard
                  }
                >
                  <View
                    style={
                      styles.orderHeader
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
                          item.customerName
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
                          item.room
                        }
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            item.status ===
                            'Received'
                              ? colors.error +
                                '20'
                              : colors.success +
                                '20',
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            item.status ===
                            'Received'
                              ? colors.error
                              : colors.success,
                          fontWeight:
                            '900',
                          fontSize: 9,
                        }}
                      >
                        {item.status ===
                        'Received'
                          ? 'CHECK'
                          : 'SAFE'}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.warningPanel,
                      {
                        borderTopColor:
                          colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.warningText,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      {
                        item.delicateTag
                      }
                    </Text>
                  </View>

                  {item.status ===
                    'Received' && (
                    <TouchableOpacity
                      style={[
                        styles.verifyBtn,
                        {
                          backgroundColor:
                            colors.success,
                        },
                      ]}
                      onPress={() =>
                        verifyDelicate(
                          item.id
                        )
                      }
                    >
                      <CheckCircle2
                        size={14}
                        color="#FFF"
                      />

                      <Text
                        style={{
                          color:
                            '#FFF',
                          fontWeight:
                            '800',
                          marginLeft: 6,
                          fontSize: 11,
                        }}
                      >
                        Mark Safe
                      </Text>
                    </TouchableOpacity>
                  )}
                </GlassCard>
              )
            )}
          </>
        )}

        {/* SCHEDULE */}
        {activeTab ===
          'schedule' && (
          <>
            {[
              {
                id: '1',
                place:
                  'Hostel A-203',
                time:
                  '10:00 AM - 12:00 PM',
                runner:
                  'Ravi',
                action:
                  'Pickup',
              },
              {
                id: '2',
                place:
                  'PG Royal - 3',
                time:
                  '4:00 PM - 6:00 PM',
                runner:
                  'Amit',
                action:
                  'Delivery',
              },
            ].map((slot) => (
              <GlassCard
                key={slot.id}
                style={
                  styles.scheduleCard
                }
              >
                <View
                  style={
                    styles.orderHeader
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
                        slot.place
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
                        slot.action
                      }
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          colors.primary +
                          '20',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          colors.primary,
                        fontWeight:
                          '900',
                        fontSize: 9,
                      }}
                    >
                      {
                        slot.time
                      }
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.scheduleFooter,
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
                    Runner:{' '}
                    {
                      slot.runner
                    }
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.dispatchBtn,
                      {
                        backgroundColor:
                          colors.surface,
                      },
                    ]}
                    onPress={() =>
                      Alert.alert(
                        'Runner Assigned',
                        `${slot.runner} notified.`
                      )
                    }
                  >
                    <Text
                      style={{
                        color:
                          colors.text,
                        fontSize: 10,
                        fontWeight:
                          '700',
                      }}
                    >
                      Dispatch
                    </Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </>
        )}

        <View
          style={{
            height: 120,
          }}
        />
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
            id: 'orders',
            label: 'Orders',
            icon: Shirt,
          },
          {
            id: 'delicate',
            label: 'Safety',
            icon: AlertTriangle,
          },
          {
            id: 'schedule',
            label: 'Pickup',
            icon: Calendar,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    padding: Spacing.md,
  },

  hudCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
  },

  hudHeader: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  hudMini: {
    color:
      'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '900',
  },

  hudValue: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },

  hudDivider: {
    height: 1,
    backgroundColor:
      'rgba(255,255,255,0.15)',
    marginVertical: 16,
  },

  hudStatsRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
  },

  hudStatValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },

  hudStatLabel: {
    color:
      'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
  },

  sectionSub: {
    marginTop: 4,
    fontSize: 12,
  },

  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchBar: {
    height: 46,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 14,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
  },

  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },

  formCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },

  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  formTitle: {
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 8,
  },

  formInput: {
    height: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  inlineGrid: {
    flexDirection: 'row',
    gap: 10,
  },

  inputLabel: {
    fontSize: 10,
    marginBottom: 4,
    fontWeight: '800',
  },

  serviceRow: {
    flexDirection: 'row',
    gap: 6,
  },

  serviceChip: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  submitBtn: {
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },

  submitText: {
    color: '#FFF',
    fontWeight: '900',
  },

  orderCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  customerName: {
    fontSize: 15,
    fontWeight: '900',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  detailsRow: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent:
      'space-between',
  },

  infoLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    fontWeight: '800',
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },

  warningBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  priceRow: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  priceText: {
    fontSize: 16,
    fontWeight: '900',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },

  shareBtn: {
    height: 38,
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  processBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  warningCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  warningPanel: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },

  warningText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },

  verifyBtn: {
    marginTop: 14,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  scheduleCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  scheduleFooter: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  dispatchBtn: {
    height: 34,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
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