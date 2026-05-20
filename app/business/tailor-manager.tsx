// TailorManagerScreen.tsx
// Refactored because apparently every artisan business now needs
// enterprise SaaS dashboards with glowing glassmorphism cards.
// Humanity invented sewing and immediately added analytics tabs.

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
  Clock,
  Plus,
  Scissors,
  Search,
  Share2,
  Shirt,
  Sliders,
  Sparkles,
} from 'lucide-react-native';

import { GlassCard } from '@/components/GlassCard';
import { CustomerBusinessView } from '@/components/CustomerBusinessView';

import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

import { Spacing } from '@/constants/Theme';

type ActiveTab =
  | 'stitching'
  | 'measurements'
  | 'trials';

export default function TailorManagerScreen() {
  const { userRole, businessType } =
    useApp();

  if (
    userRole === 'customer' ||
    businessType !== 'Tailor'
  ) {
    return (
      <CustomerBusinessView type="Tailor" />
    );
  }

  return <TailorMerchantScreen />;
}

function TailorMerchantScreen() {
  const { colors, profile } =
    useApp();

  const [activeTab, setActiveTab] =
    useState<ActiveTab>(
      'stitching'
    );

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [jobs, setJobs] =
    useState<any[]>([]);

  const [measurements, setMeasurements] =
    useState<any[]>([]);

  // SEARCH + FILTER
  const [searchQuery, setSearchQuery] =
    useState('');

  const [filter, setFilter] =
    useState<
      | 'All'
      | 'Fabric Cutting'
      | 'Under Stitching'
      | 'Ready for Dispatch'
    >('All');

  // NEW JOB
  const [showJobModal, setShowJobModal] =
    useState(false);

  const [customerName, setCustomerName] =
    useState('');

  const [itemType, setItemType] =
    useState('');

  const [details, setDetails] =
    useState('');

  const [amount, setAmount] =
    useState('1500');

  // NEW MEASUREMENTS
  const [
    showMeasurementModal,
    setShowMeasurementModal,
  ] = useState(false);

  const [measureName, setMeasureName] =
    useState('');

  const [chest, setChest] =
    useState('38');

  const [waist, setWaist] =
    useState('32');

  const [sleeves, setSleeves] =
    useState('24');

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const [
        jobsRes,
        measurementsRes,
      ] = await Promise.all([
        supabase
          .from('tailor_jobs')
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
            'tailor_measurements'
          )
          .select('*')
          .eq(
            'merchant_id',
            profile.id
          )
          .order('created_at', {
            ascending: false,
          }),
      ]);

      setJobs(jobsRes.data || []);
      setMeasurements(
        measurementsRes.data || []
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
  const activeOrders = useMemo(
    () =>
      jobs.filter(
        (j) =>
          j.progress_status !==
          'Delivered'
      ).length,
    [jobs]
  );

  const totalRevenue = useMemo(
    () =>
      jobs.reduce(
        (acc, item) =>
          acc + Number(item.amount || 0),
        0
      ),
    [jobs]
  );

  // FILTERED JOBS
  const filteredJobs = jobs.filter(
    (job) => {
      const matchesSearch =
        job.customer_name
          ?.toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        job.item_type
          ?.toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          );

      const matchesFilter =
        filter === 'All' ||
        job.progress_status === filter;

      return (
        matchesSearch &&
        matchesFilter &&
        job.progress_status !==
          'Delivered'
      );
    }
  );

  // ADD JOB
  const addJob = async () => {
    if (
      !customerName ||
      !itemType
    ) {
      Alert.alert(
        'Missing Fields',
        'Civilization survived thousands of years yet forms still confuse people.'
      );

      return;
    }

    await supabase
      .from('tailor_jobs')
      .insert([
        {
          merchant_id:
            profile?.id,
          customer_name:
            customerName,
          item_type: itemType,
          progress_status:
            'Fabric Cutting',
          details:
            details ||
            'Standard Fit',
          amount:
            parseFloat(amount) ||
            1000,
        },
      ]);

    Alert.alert(
      'Order Added',
      `${itemType} registered for ${customerName}. Threads and deadlines now legally intertwined.`
    );

    setCustomerName('');
    setItemType('');
    setDetails('');
    setAmount('1500');

    setShowJobModal(false);

    fetchData();
  };

  // UPDATE STATUS
  const updateStatus = async (
    id: string,
    current: string
  ) => {
    const flow = [
      'Fabric Cutting',
      'Under Stitching',
      'Ready for Dispatch',
      'Delivered',
    ];

    const next =
      flow[
        flow.indexOf(current) + 1
      ];

    if (!next) return;

    await supabase
      .from('tailor_jobs')
      .update({
        progress_status: next,
      })
      .eq('id', id);

    fetchData();
  };

  // ADD MEASUREMENT
  const addMeasurement =
    async () => {
      if (!measureName) {
        Alert.alert(
          'Missing Name',
          'The body measurements generally belong to a person.'
        );

        return;
      }

      await supabase
        .from(
          'tailor_measurements'
        )
        .insert([
          {
            merchant_id:
              profile?.id,
            student_name:
              measureName,
            chest:
              parseFloat(
                chest
              ) || 38,
            waist:
              parseFloat(
                waist
              ) || 32,
            sleeves:
              parseFloat(
                sleeves
              ) || 24,
            shoulder: 17,
            collar: 15,
            length: 28,
          },
        ]);

      Alert.alert(
        'Saved',
        `Measurement card stored for ${measureName}. Human geometry archived successfully.`
      );

      setMeasureName('');
      setShowMeasurementModal(
        false
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
            'Tailor Studio',
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
                ACTIVE STITCHING
              </Text>

              <Text
                style={
                  styles.analyticsValue
                }
              >
                {activeOrders}
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
                Revenue Generated
              </Text>

              <Text
                style={
                  styles.analyticsRevenue
                }
              >
                ₹{totalRevenue}
              </Text>
            </GlassCard>

            {/* STITCHING TAB */}
            {activeTab ===
              'stitching' && (
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
                      value={
                        searchQuery
                      }
                      onChangeText={
                        setSearchQuery
                      }
                      placeholder="Search tailoring jobs..."
                      placeholderTextColor={
                        colors.textMuted
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
                      setShowJobModal(
                        !showJobModal
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
                    'Fabric Cutting',
                    'Under Stitching',
                    'Ready for Dispatch',
                  ].map((item) => {
                    const active =
                      filter === item;

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
                          setFilter(
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

                {/* CREATE ORDER */}
                {showJobModal && (
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
                          New Stitching
                          Order
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() =>
                          setShowJobModal(
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
                        customerName,
                        setCustomerName,
                        'Customer Name',
                      ],
                      [
                        itemType,
                        setItemType,
                        'Garment Type',
                      ],
                      [
                        details,
                        setDetails,
                        'Styling Details',
                      ],
                      [
                        amount,
                        setAmount,
                        'Amount',
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
                            'Amount'
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
                      onPress={addJob}
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

                {/* JOBS */}
                {filteredJobs.map(
                  (job) => {
                    const ready =
                      job.progress_status ===
                      'Ready for Dispatch';

                    return (
                      <GlassCard
                        key={job.id}
                        style={
                          styles.jobCard
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
                                job.customer_name
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
                                job.item_type
                              }
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor:
                                  ready
                                    ? colors.success +
                                      '20'
                                    : colors.accent +
                                      '20',
                              },
                            ]}
                          >
                            <Scissors
                              size={
                                12
                              }
                              color={
                                ready
                                  ? colors.success
                                  : colors.accent
                              }
                            />

                            <Text
                              style={{
                                color:
                                  ready
                                    ? colors.success
                                    : colors.accent,
                                fontSize: 9,
                                fontWeight:
                                  '900',
                                marginLeft: 4,
                              }}
                            >
                              {
                                job.progress_status
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
                          <Shirt
                            size={16}
                            color={
                              colors.primary
                            }
                          />

                          <View
                            style={{
                              marginLeft: 8,
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
                                job.details
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
                              job.amount
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
                                message: `${job.customer_name}, your tailoring order is ${job.progress_status}`,
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
                                  colors.primary,
                              },
                            ]}
                            onPress={() =>
                              updateStatus(
                                job.id,
                                job.progress_status
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
                        </View>
                      </GlassCard>
                    );
                  }
                )}
              </>
            )}

            {/* MEASUREMENTS */}
            {activeTab ===
              'measurements' && (
              <>
                <TouchableOpacity
                  style={[
                    styles.addMeasureBtn,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                  onPress={() =>
                    setShowMeasurementModal(
                      !showMeasurementModal
                    )
                  }
                >
                  <Plus
                    size={14}
                    color="#FFF"
                  />

                  <Text
                    style={{
                      color: '#FFF',
                      fontWeight:
                        '800',
                      fontSize: 10,
                      marginLeft: 4,
                    }}
                  >
                    Add Size Card
                  </Text>
                </TouchableOpacity>

                {showMeasurementModal && (
                  <GlassCard
                    style={
                      styles.modalCard
                    }
                  >
                    <Text
                      style={[
                        styles.formTitle,
                        {
                          color:
                            colors.text,
                          marginBottom: 14,
                        },
                      ]}
                    >
                      Measurement
                      Card
                    </Text>

                    {[
                      [
                        measureName,
                        setMeasureName,
                        'Client Name',
                      ],
                      [
                        chest,
                        setChest,
                        'Chest',
                      ],
                      [
                        waist,
                        setWaist,
                        'Waist',
                      ],
                      [
                        sleeves,
                        setSleeves,
                        'Sleeves',
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
                            index === 0
                              ? 'default'
                              : 'numeric'
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
                        addMeasurement
                      }
                    >
                      <Text
                        style={
                          styles.submitText
                        }
                      >
                        Save Card
                      </Text>
                    </TouchableOpacity>
                  </GlassCard>
                )}

                {measurements.map(
                  (m) => (
                    <GlassCard
                      key={m.id}
                      style={
                        styles.measurementCard
                      }
                    >
                      <View
                        style={
                          styles.cardHeader
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
                            m.student_name
                          }
                        </Text>

                        <TouchableOpacity
                          onPress={() =>
                            Share.share({
                              message: `Chest: ${m.chest}, Waist: ${m.waist}, Sleeves: ${m.sleeves}`,
                            })
                          }
                        >
                          <Share2
                            size={14}
                            color={
                              colors.textMuted
                            }
                          />
                        </TouchableOpacity>
                      </View>

                      <View
                        style={[
                          styles.measureGrid,
                          {
                            borderTopColor:
                              colors.border,
                          },
                        ]}
                      >
                        {[
                          [
                            'CHEST',
                            m.chest,
                          ],
                          [
                            'WAIST',
                            m.waist,
                          ],
                          [
                            'SLEEVES',
                            m.sleeves,
                          ],
                        ].map(
                          (
                            item,
                            index
                          ) => (
                            <View
                              key={index}
                              style={{
                                alignItems:
                                  'center',
                              }}
                            >
                              <Text
                                style={{
                                  color:
                                    colors.textMuted,
                                  fontSize: 9,
                                }}
                              >
                                {
                                  item[0]
                                }
                              </Text>

                              <Text
                                style={{
                                  color:
                                    colors.text,
                                  fontWeight:
                                    '900',
                                  marginTop: 4,
                                }}
                              >
                                {
                                  item[1]
                                }
                                "
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

            {/* TRIALS */}
            {activeTab ===
              'trials' && (
              <>
                {[
                  {
                    id: '1',
                    name: 'Rahul',
                    apparel:
                      'Fest Blazer',
                    time: '12:30 PM',
                    status:
                      'Booked',
                  },
                  {
                    id: '2',
                    name: 'Sneha',
                    apparel:
                      'Kurta',
                    time: '4:00 PM',
                    status:
                      'Completed',
                  },
                ].map((trial) => (
                  <GlassCard
                    key={trial.id}
                    style={
                      styles.trialCard
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
                            trial.name
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
                            trial.apparel
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
                        <Clock
                          size={12}
                          color={
                            colors.primary
                          }
                        />

                        <Text
                          style={{
                            color:
                              colors.primary,
                            fontSize: 9,
                            fontWeight:
                              '900',
                            marginLeft: 4,
                          }}
                        >
                          {
                            trial.time
                          }
                        </Text>
                      </View>
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
            id: 'stitching',
            label: 'Stitching',
            icon: Scissors,
          },
          {
            id: 'measurements',
            label: 'Measurements',
            icon: Sliders,
          },
          {
            id: 'trials',
            label: 'Trials',
            icon: Clock,
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

  jobCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  measurementCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  trialCard: {
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

  addMeasureBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  measureGrid: {
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent:
      'space-between',
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