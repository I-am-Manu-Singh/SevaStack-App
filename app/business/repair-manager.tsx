// RepairManagerScreen.tsx
// Refactored because gigantic 1500-line screens are apparently
// how humanity copes with existential uncertainty.

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
  Hammer,
  Plus,
  QrCode,
  Search,
  Settings,
  Share2,
  Sparkles,
  Wrench,
} from 'lucide-react-native';

import { GlassCard } from '@/components/GlassCard';
import { CustomerBusinessView } from '@/components/CustomerBusinessView';

import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

import { Spacing } from '@/constants/Theme';

type ActiveTab =
  | 'repairs'
  | 'parts'
  | 'otp';

export default function RepairManagerScreen() {
  const { userRole, businessType } =
    useApp();

  if (
    userRole === 'customer' ||
    businessType !== 'Handyman'
  ) {
    return (
      <CustomerBusinessView type="Handyman" />
    );
  }

  return <RepairMerchantScreen />;
}

function RepairMerchantScreen() {
  const { colors, profile } =
    useApp();

  const [activeTab, setActiveTab] =
    useState<ActiveTab>('repairs');

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [repairs, setRepairs] =
    useState<any[]>([]);

  const [parts, setParts] =
    useState<any[]>([]);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [repairFilter, setRepairFilter] =
    useState<
      | 'All'
      | 'Reported'
      | 'Inspecting'
      | 'Fixing'
      | 'Resolved'
    >('All');

  // CREATE JOB
  const [showCreate, setShowCreate] =
    useState(false);

  const [name, setName] =
    useState('');

  const [room, setRoom] =
    useState('Hostel A - 302');

  const [category, setCategory] =
    useState('Electrical');

  const [issue, setIssue] =
    useState(
      'Tube light flickering'
    );

  const [cost, setCost] =
    useState('200');

  // PARTS
  const [selectedRepair, setSelectedRepair] =
    useState<any | null>(null);

  const [selectedParts, setSelectedParts] =
    useState<string[]>([]);

  const [laborCharge, setLaborCharge] =
    useState('150');

  // OTP
  const [verifyingRepair, setVerifyingRepair] =
    useState<any | null>(null);

  const [inputOtp, setInputOtp] =
    useState('');

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const [
        repairsRes,
        partsRes,
      ] = await Promise.all([
        supabase
          .from('repair_jobs')
          .select('*')
          .eq(
            'merchant_id',
            profile.id
          )
          .order('created_at', {
            ascending: false,
          }),

        supabase
          .from('repair_parts')
          .select('*')
          .eq(
            'merchant_id',
            profile.id
          ),
      ]);

      setRepairs(
        (repairsRes.data || []).map(
          (item: any) => ({
            id: item.id,
            studentName:
              item.student_name,
            room: item.room,
            category:
              item.category,
            issue: item.issue,
            status:
              item.status,
            cost: item.cost,
            partsUsed:
              item.parts_used,
            otpCode:
              item.otp_code,
            date: item.date,
          })
        )
      );

      setParts(partsRes.data || []);
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

  const filteredRepairs =
    repairs.filter((repair) => {
      const matchesSearch =
        repair.studentName
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        repair.room
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        repair.issue
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          );

      const matchesFilter =
        repairFilter === 'All' ||
        repair.status ===
          repairFilter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });

  // ANALYTICS
  const activeRepairs = useMemo(
    () =>
      repairs.filter(
        (r) =>
          r.status !==
          'Resolved'
      ).length,
    [repairs]
  );

  const totalRevenue = useMemo(
    () =>
      repairs.reduce(
        (acc, item) =>
          acc + (item.cost || 0),
        0
      ),
    [repairs]
  );

  // CREATE
  const createRepair =
    async () => {
      if (!name || !issue) {
        Alert.alert(
          'Missing fields',
          'Humans remain passionately committed to incomplete forms.'
        );
        return;
      }

      const otp = Math.floor(
        1000 +
          Math.random() * 9000
      ).toString();

      await supabase
        .from('repair_jobs')
        .insert([
          {
            merchant_id:
              profile?.id,
            student_name:
              name,
            room,
            category,
            issue,
            status:
              'Reported',
            cost:
              parseInt(cost) ||
              200,
            parts_used:
              'None',
            otp_code: otp,
            date: 'Today',
          },
        ]);

      fetchData();

      setShowCreate(false);

      setName('');
      setIssue('');
    };

  // STATUS
  const nextRepairStage =
    async (
      id: string,
      current: string
    ) => {
      const stages = [
        'Reported',
        'Inspecting',
        'Fixing',
        'Resolved',
      ];

      const next =
        stages[
          stages.indexOf(
            current
          ) + 1
        ];

      if (!next) return;

      if (next === 'Resolved') {
        const found =
          repairs.find(
            (r) =>
              r.id === id
          );

        if (found) {
          setVerifyingRepair(
            found
          );
        }

        return;
      }

      await supabase
        .from('repair_jobs')
        .update({
          status: next,
        })
        .eq('id', id);

      fetchData();
    };

  // OTP VERIFY
  const verifyOtp =
    async () => {
      if (
        inputOtp !==
        verifyingRepair?.otpCode
      ) {
        Alert.alert(
          'Invalid OTP',
          'Wrong code. Tiny numbers continue gatekeeping civilization.'
        );

        return;
      }

      await supabase
        .from('repair_jobs')
        .update({
          status: 'Resolved',
        })
        .eq(
          'id',
          verifyingRepair.id
        );

      Alert.alert(
        'Resolved',
        'Repair closed successfully.'
      );

      setVerifyingRepair(null);

      setInputOtp('');

      fetchData();
    };

  // PARTS INVOICE
  const calculateInvoice =
    async () => {
      if (!selectedRepair) return;

      let partsTotal = 0;

      const names: string[] = [];

      parts.forEach((part) => {
        if (
          selectedParts.includes(
            part.id
          )
        ) {
          partsTotal +=
            part.price;

          names.push(part.name);
        }
      });

      const finalCost =
        partsTotal +
        (parseInt(
          laborCharge
        ) || 150);

      await supabase
        .from('repair_jobs')
        .update({
          cost: finalCost,
          parts_used:
            names.join(', '),
        })
        .eq(
          'id',
          selectedRepair.id
        );

      Alert.alert(
        'Invoice Updated',
        `₹${finalCost} total invoice generated. Commerce marches onward.`
      );

      setSelectedRepair(null);

      setSelectedParts([]);

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
            'Repair Management',
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
                ACTIVE REPAIRS
              </Text>

              <Text
                style={
                  styles.analyticsValue
                }
              >
                {activeRepairs}
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
                Total Revenue
              </Text>

              <Text
                style={
                  styles.analyticsRevenue
                }
              >
                ₹{totalRevenue}
              </Text>
            </GlassCard>

            {/* REPAIRS */}
            {activeTab ===
              'repairs' && (
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
                      placeholder="Search repairs..."
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
                      setShowCreate(
                        !showCreate
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
                    'Reported',
                    'Inspecting',
                    'Fixing',
                    'Resolved',
                  ].map((item) => {
                    const active =
                      repairFilter ===
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
                          setRepairFilter(
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
                              '800',
                          }}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* CREATE FORM */}
                {showCreate && (
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
                          New Repair
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() =>
                          setShowCreate(
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
                        room,
                        setRoom,
                        'Room',
                      ],
                      [
                        category,
                        setCategory,
                        'Category',
                      ],
                      [
                        issue,
                        setIssue,
                        'Issue',
                      ],
                      [
                        cost,
                        setCost,
                        'Estimated Cost',
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
                          keyboardType={
                            item[2] ===
                            'Estimated Cost'
                              ? 'numeric'
                              : 'default'
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
                        createRepair
                      }
                    >
                      <Text
                        style={
                          styles.submitText
                        }
                      >
                        Create Ticket
                      </Text>
                    </TouchableOpacity>
                  </GlassCard>
                )}

                {/* LIST */}
                {filteredRepairs.map(
                  (repair) => {
                    const resolved =
                      repair.status ===
                      'Resolved';

                    return (
                      <GlassCard
                        key={
                          repair.id
                        }
                        style={
                          styles.repairCard
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
                                repair.studentName
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
                                repair.room
                              }
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor:
                                  resolved
                                    ? colors.success +
                                      '20'
                                    : colors.accent +
                                      '20',
                              },
                            ]}
                          >
                            <Wrench
                              size={
                                12
                              }
                              color={
                                resolved
                                  ? colors.success
                                  : colors.accent
                              }
                            />

                            <Text
                              style={{
                                color:
                                  resolved
                                    ? colors.success
                                    : colors.accent,
                                fontSize: 9,
                                fontWeight:
                                  '900',
                                marginLeft: 4,
                              }}
                            >
                              {
                                repair.status
                              }
                            </Text>
                          </View>
                        </View>

                        <View
                          style={[
                            styles.detailsBox,
                            {
                              borderTopColor:
                                colors.border,
                            },
                          ]}
                        >
                          <Settings
                            size={16}
                            color={
                              colors.primary
                            }
                          />

                          <View
                            style={{
                              flex: 1,
                              marginLeft: 8,
                            }}
                          >
                            <Text
                              style={[
                                styles.issueTitle,
                                {
                                  color:
                                    colors.text,
                                },
                              ]}
                            >
                              {
                                repair.category
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
                                repair.issue
                              }
                            </Text>

                            <Text
                              style={{
                                color:
                                  colors.textMuted,
                                fontSize: 10,
                                marginTop: 6,
                              }}
                            >
                              Parts:{' '}
                              {
                                repair.partsUsed
                              }
                            </Text>
                          </View>
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
                            Invoice
                          </Text>

                          <Text
                            style={{
                              color:
                                colors.text,
                              fontWeight:
                                '900',
                            }}
                          >
                            ₹
                            {
                              repair.cost
                            }
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
                                message: `${repair.studentName}: ${repair.status}`,
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
                              Share
                            </Text>
                          </TouchableOpacity>

                          {!resolved && (
                            <TouchableOpacity
                              style={[
                                styles.actionBtn,
                                {
                                  backgroundColor:
                                    colors.primary,
                                },
                              ]}
                              onPress={() =>
                                nextRepairStage(
                                  repair.id,
                                  repair.status
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
                                Next
                              </Text>
                            </TouchableOpacity>
                          )}

                          {!resolved && (
                            <TouchableOpacity
                              style={[
                                styles.actionBtn,
                                {
                                  backgroundColor:
                                    colors.success,
                                },
                              ]}
                              onPress={() =>
                                setSelectedRepair(
                                  repair
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
                                Invoice
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </GlassCard>
                    );
                  }
                )}

                {/* PARTS MODAL */}
                {selectedRepair && (
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
                        <Settings
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
                          Parts Invoice
                        </Text>
                      </View>
                    </View>

                    <TextInput
                      value={
                        laborCharge
                      }
                      onChangeText={
                        setLaborCharge
                      }
                      keyboardType="numeric"
                      placeholder="Labor"
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

                    {parts.map(
                      (part) => {
                        const selected =
                          selectedParts.includes(
                            part.id
                          );

                        return (
                          <TouchableOpacity
                            key={
                              part.id
                            }
                            style={[
                              styles.partRow,
                              {
                                borderBottomColor:
                                  colors.border,
                                backgroundColor:
                                  selected
                                    ? colors.primary +
                                      '10'
                                    : 'transparent',
                              },
                            ]}
                            onPress={() => {
                              if (
                                selected
                              ) {
                                setSelectedParts(
                                  selectedParts.filter(
                                    (
                                      id
                                    ) =>
                                      id !==
                                      part.id
                                  )
                                );
                              } else {
                                setSelectedParts(
                                  [
                                    ...selectedParts,
                                    part.id,
                                  ]
                                );
                              }
                            }}
                          >
                            <View
                              style={{
                                flex: 1,
                              }}
                            >
                              <Text
                                style={{
                                  color:
                                    colors.text,
                                  fontWeight:
                                    '800',
                                }}
                              >
                                {
                                  part.name
                                }
                              </Text>

                              <Text
                                style={{
                                  color:
                                    colors.textMuted,
                                  fontSize: 11,
                                }}
                              >
                                ₹
                                {
                                  part.price
                                }{' '}
                                • Stock{' '}
                                {
                                  part.stock
                                }
                              </Text>
                            </View>

                            <View
                              style={[
                                styles.selectBadge,
                                {
                                  backgroundColor:
                                    selected
                                      ? colors.success +
                                        '20'
                                      : colors.border,
                                },
                              ]}
                            >
                              <Text
                                style={{
                                  color:
                                    selected
                                      ? colors.success
                                      : colors.textMuted,
                                  fontSize: 10,
                                  fontWeight:
                                    '900',
                                }}
                              >
                                {selected
                                  ? 'ADDED'
                                  : 'ADD'}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      }
                    )}

                    <TouchableOpacity
                      style={[
                        styles.submitBtn,
                        {
                          backgroundColor:
                            colors.success,
                          marginTop: 12,
                        },
                      ]}
                      onPress={
                        calculateInvoice
                      }
                    >
                      <Text
                        style={
                          styles.submitText
                        }
                      >
                        Calculate Invoice
                      </Text>
                    </TouchableOpacity>
                  </GlassCard>
                )}

                {/* OTP */}
                {verifyingRepair && (
                  <GlassCard
                    style={
                      styles.modalCard
                    }
                  >
                    <View
                      style={
                        styles.row
                      }
                    >
                      <AlertTriangle
                        size={18}
                        color={
                          colors.accent
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
                        Verify OTP
                      </Text>
                    </View>

                    <Text
                      style={{
                        color:
                          colors.textMuted,
                        fontSize: 12,
                        marginTop: 12,
                        marginBottom: 14,
                      }}
                    >
                      Ask the student
                      for the 4-digit
                      completion code.
                      Humans love
                      security theatre.
                    </Text>

                    <TextInput
                      value={
                        inputOtp
                      }
                      onChangeText={
                        setInputOtp
                      }
                      keyboardType="numeric"
                      maxLength={4}
                      placeholder="0000"
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
                          textAlign:
                            'center',
                          letterSpacing: 8,
                          fontSize: 20,
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
                        verifyOtp
                      }
                    >
                      <Text
                        style={
                          styles.submitText
                        }
                      >
                        Verify
                      </Text>
                    </TouchableOpacity>
                  </GlassCard>
                )}
              </>
            )}

            {/* PARTS */}
            {activeTab ===
              'parts' && (
              <>
                {parts.map((part) => (
                  <GlassCard
                    key={part.id}
                    style={
                      styles.partsCard
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
                        <Settings
                          size={18}
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
                            part.name
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
                          {
                            part.stock
                          }{' '}
                          STOCK
                        </Text>
                      </View>
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
                        Price
                      </Text>

                      <Text
                        style={{
                          color:
                            colors.text,
                          fontWeight:
                            '900',
                        }}
                      >
                        ₹
                        {
                          part.price
                        }
                      </Text>
                    </View>
                  </GlassCard>
                ))}
              </>
            )}

            {/* OTP TAB */}
            {activeTab ===
              'otp' && (
              <>
                {repairs
                  .filter(
                    (r) =>
                      r.status !==
                      'Resolved'
                  )
                  .map((repair) => (
                    <GlassCard
                      key={repair.id}
                      style={
                        styles.partsCard
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
                              repair.studentName
                            }
                          </Text>

                          <Text
                            style={{
                              color:
                                colors.textMuted,
                              fontSize: 11,
                            }}
                          >
                            OTP:{' '}
                            {
                              repair.otpCode
                            }
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.actionBtn,
                            {
                              backgroundColor:
                                colors.primary,
                              flex: 0,
                              paddingHorizontal: 14,
                            },
                          ]}
                          onPress={() =>
                            setVerifyingRepair(
                              repair
                            )
                          }
                        >
                          <QrCode
                            size={14}
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
                            Verify
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
            id: 'repairs',
            label: 'Repairs',
            icon: Hammer,
          },
          {
            id: 'parts',
            label: 'Parts',
            icon: Settings,
          },
          {
            id: 'otp',
            label: 'OTP',
            icon: Wrench,
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

  repairCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  partsCard: {
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

  detailsBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
  },

  issueTitle: {
    fontWeight: '800',
    fontSize: 13,
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

  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },

  selectBadge: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 8,
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