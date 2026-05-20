// MoversManagerScreen.tsx
// Refactored because gigantic monolithic React Native files
// are apparently a beloved modern ritual sacrifice.

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
  Box,
  Calculator,
  Camera,
  CheckCircle2,
  Package,
  Plus,
  QrCode,
  Search,
  Share2,
  Sparkles,
  Truck,
} from 'lucide-react-native';

import { GlassCard } from '@/components/GlassCard';
import { CustomerBusinessView } from '@/components/CustomerBusinessView';

import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

import { Spacing } from '@/constants/Theme';

type ActiveTab =
  | 'shifts'
  | 'quote'
  | 'inventory';

export default function MoversManagerScreen() {
  const { userRole, businessType } =
    useApp();

  if (
    userRole === 'customer' ||
    businessType !== 'Transport'
  ) {
    return (
      <CustomerBusinessView type="Transport" />
    );
  }

  return <MoversMerchantScreen />;
}

function MoversMerchantScreen() {
  const { colors, profile } =
    useApp();

  const [activeTab, setActiveTab] =
    useState<ActiveTab>('shifts');

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [shifts, setShifts] =
    useState<any[]>([]);

  const [inventories, setInventories] =
    useState<any[]>([]);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [shiftFilter, setShiftFilter] =
    useState<
      | 'All'
      | 'Booked'
      | 'Packing'
      | 'In Transit'
      | 'Unpacked & Delivered'
    >('All');

  // NEW SHIFT
  const [showModal, setShowModal] =
    useState(false);

  const [name, setName] =
    useState('');

  const [source, setSource] =
    useState('Hostel A');

  const [destination, setDestination] =
    useState('PG Elite');

  const [items, setItems] =
    useState(
      '3 Boxes, 1 Table'
    );

  const [quote, setQuote] =
    useState('1800');

  // SETTLE
  const [settlingShift, setSettlingShift] =
    useState<any | null>(null);

  const [settleAmount, setSettleAmount] =
    useState('0');

  // QUOTE MAKER
  const [distance, setDistance] =
    useState('5');

  const [srcFloor, setSrcFloor] =
    useState('3');

  const [destFloor, setDestFloor] =
    useState('1');

  const [srcLift, setSrcLift] =
    useState(false);

  const [destLift, setDestLift] =
    useState(true);

  const [heavies, setHeavies] =
    useState('1');

  const [computedQuote, setComputedQuote] =
    useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const [
        shiftsRes,
        inventoryRes,
      ] = await Promise.all([
        supabase
          .from('movers_shifts')
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
            'movers_inventories'
          )
          .select('*')
          .eq(
            'merchant_id',
            profile.id
          ),
      ]);

      setShifts(
        (shiftsRes.data || []).map(
          (item: any) => ({
            id: item.id,
            studentName:
              item.student_name,
            source: item.source,
            destination:
              item.destination,
            itemsSummary:
              item.items_summary,
            status:
              item.status,
            quoteAmount:
              item.quote_amount,
            depositPaid:
              item.deposit_paid,
            date: item.date,
          })
        )
      );

      setInventories(
        (inventoryRes.data || []).map(
          (item: any) => ({
            id: item.id,
            studentName:
              item.student_name,
            boxes: item.boxes,
            cooler:
              item.cooler,
            table:
              item.table_qty,
            cycle:
              item.cycle,
            verified:
              item.photo_verified,
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

  // FILTERS
  const filteredShifts =
    shifts.filter((shift) => {
      const matchesSearch =
        shift.studentName
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        shift.source
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        shift.destination
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          );

      const matchesFilter =
        shiftFilter === 'All' ||
        shift.status ===
          shiftFilter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });

  // ANALYTICS
  const activeJobs = useMemo(
    () =>
      shifts.filter(
        (s) =>
          s.status !==
          'Unpacked & Delivered'
      ).length,
    [shifts]
  );

  const totalRevenue = useMemo(
    () =>
      shifts.reduce(
        (acc, item) =>
          acc + item.quoteAmount,
        0
      ),
    [shifts]
  );

  // ACTIONS
  const createShift =
    async () => {
      if (!name || !items) {
        Alert.alert(
          'Missing fields',
          'Humans continue their war against complete forms.'
        );
        return;
      }

      await supabase
        .from('movers_shifts')
        .insert([
          {
            merchant_id:
              profile?.id,
            student_name:
              name,
            source,
            destination,
            items_summary:
              items,
            status:
              'Booked',
            quote_amount:
              parseInt(
                quote
              ) || 1500,
            deposit_paid: 200,
            date: 'Today',
          },
        ]);

      fetchData();

      setShowModal(false);

      setName('');
      setItems('');
    };

  const nextStatus =
    async (
      id: string,
      current: string
    ) => {
      const sequence = [
        'Booked',
        'Packing',
        'In Transit',
        'Unpacked & Delivered',
      ];

      const next =
        sequence[
          sequence.indexOf(
            current
          ) + 1
        ];

      if (!next) return;

      await supabase
        .from('movers_shifts')
        .update({
          status: next,
        })
        .eq('id', id);

      fetchData();
    };

  const settleDues =
    async () => {
      if (!settlingShift) return;

      await supabase
        .from('movers_shifts')
        .update({
          deposit_paid:
            settlingShift.quoteAmount,
        })
        .eq(
          'id',
          settlingShift.id
        );

      Alert.alert(
        'Settled',
        'Money exchanged. Civilization preserved another day.'
      );

      setSettlingShift(null);

      fetchData();
    };

  const calculateQuote =
    () => {
      const dist =
        parseFloat(distance) ||
        0;

      const sf =
        parseInt(srcFloor) ||
        0;

      const df =
        parseInt(destFloor) ||
        0;

      const hv =
        parseInt(heavies) ||
        0;

      let total = 500;

      total += dist * 50;

      if (!srcLift)
        total += sf * 150;

      if (!destLift)
        total += df * 150;

      total += hv * 200;

      setComputedQuote(
        Math.round(total)
      );
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
            'Hostel Shifting',
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
              marginTop: 40,
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
              <Text
                style={
                  styles.analyticsLabel
                }
              >
                ACTIVE LOGISTICS
              </Text>

              <Text
                style={
                  styles.analyticsValue
                }
              >
                {activeJobs}
              </Text>

              <View
                style={
                  styles.analyticsDivider
                }
              />

              <Text
                style={
                  styles.analyticsSub
                }
              >
                Total Projected Revenue
              </Text>

              <Text
                style={
                  styles.analyticsRevenue
                }
              >
                ₹{totalRevenue}
              </Text>
            </GlassCard>

            {/* SHIFTS */}
            {activeTab ===
              'shifts' && (
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
                      placeholder="Search shifts..."
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
                      setShowModal(
                        !showModal
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
                    'Booked',
                    'Packing',
                    'In Transit',
                    'Unpacked & Delivered',
                  ].map((item) => {
                    const active =
                      shiftFilter ===
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
                          setShiftFilter(
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
                            fontSize: 10,
                            fontWeight:
                              '700',
                          }}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* CREATE */}
                {showModal && (
                  <GlassCard
                    style={
                      styles.modalCard
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
                          Create Shift
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() =>
                          setShowModal(
                            false
                          )
                        }
                      >
                        <Text
                          style={{
                            color:
                              colors.error,
                            fontWeight:
                              '800',
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
                        source,
                        setSource,
                        'Source',
                      ],
                      [
                        destination,
                        setDestination,
                        'Destination',
                      ],
                      [
                        items,
                        setItems,
                        'Cargo',
                      ],
                      [
                        quote,
                        setQuote,
                        'Quote',
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
                          keyboardType={
                            item[2] ===
                            'Quote'
                              ? 'numeric'
                              : 'default'
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
                        createShift
                      }
                    >
                      <Text
                        style={
                          styles.submitText
                        }
                      >
                        Book Shift
                      </Text>
                    </TouchableOpacity>
                  </GlassCard>
                )}

                {/* LIST */}
                {filteredShifts.map(
                  (shift) => {
                    const fullyPaid =
                      shift.quoteAmount ===
                      shift.depositPaid;

                    return (
                      <GlassCard
                        key={
                          shift.id
                        }
                        style={
                          styles.shiftCard
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
                                styles.customerName,
                                {
                                  color:
                                    colors.text,
                                },
                              ]}
                            >
                              {
                                shift.studentName
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
                                shift.source
                              }{' '}
                              →{' '}
                              {
                                shift.destination
                              }
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor:
                                  fullyPaid
                                    ? colors.success +
                                      '20'
                                    : colors.accent +
                                      '20',
                              },
                            ]}
                          >
                            <Truck
                              size={
                                12
                              }
                              color={
                                fullyPaid
                                  ? colors.success
                                  : colors.accent
                              }
                            />

                            <Text
                              style={{
                                color:
                                  fullyPaid
                                    ? colors.success
                                    : colors.accent,
                                fontSize: 9,
                                fontWeight:
                                  '900',
                                marginLeft: 4,
                              }}
                            >
                              {
                                shift.status
                              }
                            </Text>
                          </View>
                        </View>

                        <View
                          style={[
                            styles.cargoBox,
                            {
                              borderTopColor:
                                colors.border,
                            },
                          ]}
                        >
                          <Box
                            size={16}
                            color={
                              colors.primary
                            }
                          />

                          <Text
                            style={[
                              styles.cargoText,
                              {
                                color:
                                  colors.text,
                              },
                            ]}
                          >
                            {
                              shift.itemsSummary
                            }
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.invoiceRow,
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
                            }}
                          >
                            Due
                          </Text>

                          <Text
                            style={{
                              color:
                                fullyPaid
                                  ? colors.success
                                  : colors.error,
                              fontWeight:
                                '900',
                            }}
                          >
                            {fullyPaid
                              ? 'Paid'
                              : `₹${
                                  shift.quoteAmount -
                                  shift.depositPaid
                                }`}
                          </Text>
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
                                message: `${shift.studentName}: ${shift.status}`,
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

                          {shift.status !==
                          'Unpacked & Delivered' ? (
                            <TouchableOpacity
                              style={[
                                styles.actionBtn,
                                {
                                  backgroundColor:
                                    colors.primary,
                                },
                              ]}
                              onPress={() =>
                                nextStatus(
                                  shift.id,
                                  shift.status
                                )
                              }
                            >
                              <Text
                                style={[
                                  styles.actionText,
                                  {
                                    color:
                                      '#FFF',
                                  },
                                ]}
                              >
                                Next Stage
                              </Text>
                            </TouchableOpacity>
                          ) : !fullyPaid ? (
                            <TouchableOpacity
                              style={[
                                styles.actionBtn,
                                {
                                  backgroundColor:
                                    colors.success,
                                },
                              ]}
                              onPress={() => {
                                setSettlingShift(
                                  shift
                                );

                                setSettleAmount(
                                  (
                                    shift.quoteAmount -
                                    shift.depositPaid
                                  ).toString()
                                );
                              }}
                            >
                              <Text
                                style={[
                                  styles.actionText,
                                  {
                                    color:
                                      '#FFF',
                                  },
                                ]}
                              >
                                Settle
                              </Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      </GlassCard>
                    );
                  }
                )}

                {/* SETTLE */}
                {settlingShift && (
                  <GlassCard
                    style={
                      styles.modalCard
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
                        <QrCode
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
                          Settle
                        </Text>
                      </View>
                    </View>

                    <TextInput
                      value={
                        settleAmount
                      }
                      onChangeText={
                        setSettleAmount
                      }
                      keyboardType="numeric"
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

                    <TouchableOpacity
                      style={[
                        styles.submitBtn,
                        {
                          backgroundColor:
                            colors.success,
                        },
                      ]}
                      onPress={
                        settleDues
                      }
                    >
                      <Text
                        style={
                          styles.submitText
                        }
                      >
                        Confirm Payment
                      </Text>
                    </TouchableOpacity>
                  </GlassCard>
                )}
              </>
            )}

            {/* QUOTE */}
            {activeTab ===
              'quote' && (
              <GlassCard
                style={
                  styles.quoteCard
                }
              >
                <View
                  style={
                    styles.row
                  }
                >
                  <Calculator
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
                    Quote Generator
                  </Text>
                </View>

                {[
                  [
                    distance,
                    setDistance,
                    'Distance',
                  ],
                  [
                    srcFloor,
                    setSrcFloor,
                    'Source Floor',
                  ],
                  [
                    destFloor,
                    setDestFloor,
                    'Destination Floor',
                  ],
                  [
                    heavies,
                    setHeavies,
                    'Heavy Appliances',
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
                      keyboardType="numeric"
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

                <View
                  style={
                    styles.liftRow
                  }
                >
                  <ToggleChip
                    title={`Source Lift ${
                      srcLift
                        ? 'YES'
                        : 'NO'
                    }`}
                    active={
                      srcLift
                    }
                    onPress={() =>
                      setSrcLift(
                        !srcLift
                      )
                    }
                    colors={
                      colors
                    }
                  />

                  <ToggleChip
                    title={`Dest Lift ${
                      destLift
                        ? 'YES'
                        : 'NO'
                    }`}
                    active={
                      destLift
                    }
                    onPress={() =>
                      setDestLift(
                        !destLift
                      )
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
                    calculateQuote
                  }
                >
                  <Text
                    style={
                      styles.submitText
                    }
                  >
                    Calculate
                  </Text>
                </TouchableOpacity>

                {computedQuote !==
                  null && (
                  <View
                    style={[
                      styles.quoteResult,
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
                        fontWeight:
                          '800',
                      }}
                    >
                      Estimated Quote
                    </Text>

                    <Text
                      style={{
                        color:
                          colors.primary,
                        fontSize: 28,
                        fontWeight:
                          '900',
                      }}
                    >
                      ₹
                      {
                        computedQuote
                      }
                    </Text>
                  </View>
                )}
              </GlassCard>
            )}

            {/* INVENTORY */}
            {activeTab ===
              'inventory' && (
              <>
                {inventories.map(
                  (inv) => (
                    <GlassCard
                      key={inv.id}
                      style={
                        styles.inventoryCard
                      }
                    >
                      <View
                        style={
                          styles.cardHeader
                        }
                      >
                        <View
                          style={
                            styles.row
                          }
                        >
                          <Package
                            size={
                              18
                            }
                            color={
                              colors.primary
                            }
                          />

                          <Text
                            style={[
                              styles.customerName,
                              {
                                color:
                                  colors.text,
                                marginLeft: 8,
                              },
                            ]}
                          >
                            {
                              inv.studentName
                            }
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.statusBadge,
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
                            VERIFIED
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.inventoryGrid,
                          {
                            borderTopColor:
                              colors.border,
                          },
                        ]}
                      >
                        {[
                          [
                            'Boxes',
                            inv.boxes,
                          ],
                          [
                            'Cooler',
                            inv.cooler,
                          ],
                          [
                            'Desk',
                            inv.table,
                          ],
                          [
                            'Cycle',
                            inv.cycle,
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

                      <TouchableOpacity
                        style={[
                          styles.photoBtn,
                          {
                            backgroundColor:
                              colors.surface,
                          },
                        ]}
                        onPress={() =>
                          Alert.alert(
                            'Photos',
                            '3 cargo photos locked. Humans love evidence after losing things.'
                          )
                        }
                      >
                        <Camera
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
                          View Photos
                        </Text>
                      </TouchableOpacity>
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
            id: 'shifts',
            label: 'Shifts',
            icon: Truck,
          },
          {
            id: 'quote',
            label: 'Quote',
            icon: Calculator,
          },
          {
            id: 'inventory',
            label: 'Inventory',
            icon: Package,
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

function ToggleChip({
  title,
  active,
  onPress,
  colors,
}: any) {
  return (
    <TouchableOpacity
      style={[
        styles.toggleChip,
        {
          backgroundColor: active
            ? colors.primary +
              '20'
            : colors.surface,
          borderColor: active
            ? colors.primary
            : colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={{
          color: active
            ? colors.primary
            : colors.text,
          fontSize: 11,
          fontWeight: '700',
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
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

  analyticsLabel: {
    color:
      'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '900',
  },

  analyticsValue: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 6,
  },

  analyticsDivider: {
    height: 1,
    backgroundColor:
      'rgba(255,255,255,0.15)',
    marginVertical: 14,
  },

  analyticsSub: {
    color:
      'rgba(255,255,255,0.7)',
    fontSize: 11,
  },

  analyticsRevenue: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },

  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  searchBar: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
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
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },

  filterChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },

  modalCard: {
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
    fontSize: 15,
    fontWeight: '900',
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

  shiftCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  customerName: {
    fontSize: 15,
    fontWeight: '900',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  cargoBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  cargoText: {
    marginLeft: 8,
    fontWeight: '700',
    flex: 1,
  },

  invoiceRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent:
      'space-between',
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
    gap: 5,
  },

  actionText: {
    fontSize: 11,
    fontWeight: '800',
  },

  quoteCard: {
    padding: 16,
    borderRadius: 20,
  },

  liftRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },

  toggleChip: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quoteResult: {
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 16,
    alignItems: 'center',
  },

  inventoryCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  inventoryGrid: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
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
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },

  photoBtn: {
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
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