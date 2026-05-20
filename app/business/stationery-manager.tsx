// StationeryManagerScreen.tsx
// Refactored because apparently every business dashboard
// must begin life as a 1700-line monument to human suffering.

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
  FileText,
  Flame,
  Plus,
  Printer,
  Search,
  Share2,
  Sparkles,
  AlertTriangle,
} from 'lucide-react-native';

import { GlassCard } from '@/components/GlassCard';
import { CustomerBusinessView } from '@/components/CustomerBusinessView';

import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

import { Spacing } from '@/constants/Theme';

type ActiveTab =
  | 'print'
  | 'packs'
  | 'slots';

export default function StationeryManagerScreen() {
  const { userRole, businessType } =
    useApp();

  if (
    userRole === 'customer' ||
    businessType !== 'Stationery'
  ) {
    return (
      <CustomerBusinessView type="Stationery" />
    );
  }

  return <StationeryMerchantScreen />;
}

function StationeryMerchantScreen() {
  const { colors, profile } =
    useApp();

  const [activeTab, setActiveTab] =
    useState<ActiveTab>('print');

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [printJobs, setPrintJobs] =
    useState<any[]>([]);

  const [coursePacks, setCoursePacks] =
    useState<any[]>([]);

  // SEARCH
  const [searchQuery, setSearchQuery] =
    useState('');

  const [filter, setFilter] =
    useState<
      | 'All'
      | 'Pending'
      | 'Printing'
      | 'Ready for Pick'
    >('All');

  // CREATE JOB
  const [showCreate, setShowCreate] =
    useState(false);

  const [studentName, setStudentName] =
    useState('');

  const [hostel, setHostel] =
    useState('');

  const [pdfName, setPdfName] =
    useState('');

  const [pages, setPages] =
    useState('20');

  const [colorType, setColorType] =
    useState<'B/W' | 'Color'>(
      'B/W'
    );

  const [binding, setBinding] =
    useState(
      'None'
    );

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const [
        jobsRes,
        packsRes,
      ] = await Promise.all([
        supabase
          .from(
            'stationery_print_jobs'
          )
          .select('*')
          .eq(
            'merchant_id',
            profile.id
          ),

        supabase
          .from(
            'stationery_course_packs'
          )
          .select('*')
          .eq(
            'merchant_id',
            profile.id
          ),
      ]);

      setPrintJobs(
        jobsRes.data || []
      );

      setCoursePacks(
        packsRes.data || []
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
  const pendingJobs = useMemo(
    () =>
      printJobs.filter(
        (j) =>
          j.status !==
          'Completed'
      ).length,
    [printJobs]
  );

  const revenue = useMemo(
    () =>
      printJobs.reduce(
        (acc, item) =>
          acc + (item.amount || 0),
        0
      ),
    [printJobs]
  );

  // FILTER
  const filteredJobs =
    printJobs.filter((job) => {
      const matchesSearch =
        job.student_name
          ?.toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        job.pdf_name
          ?.toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        job.hostel
          ?.toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          );

      const matchesFilter =
        filter === 'All' ||
        job.status === filter;

      return (
        matchesSearch &&
        matchesFilter &&
        job.status !==
          'Completed'
      );
    });

  // CREATE
  const createPrintJob =
    async () => {
      if (
        !studentName ||
        !pdfName
      ) {
        Alert.alert(
          'Missing Fields',
          'Humans continue their brave resistance against filling forms properly.'
        );

        return;
      }

      const pageCount =
        parseInt(pages) || 1;

      const pageRate =
        colorType === 'Color'
          ? 10
          : 3;

      let bindingCost = 0;

      if (
        binding ===
        'Spiral Binding'
      ) {
        bindingCost = 42;
      }

      if (
        binding ===
        'Hard Bound Cover'
      ) {
        bindingCost = 120;
      }

      const total =
        pageCount *
          pageRate +
        bindingCost;

      await supabase
        .from(
          'stationery_print_jobs'
        )
        .insert([
          {
            merchant_id:
              profile?.id,
            student_name:
              studentName,
            hostel:
              hostel ||
              'Walk-in',
            pdf_name: pdfName,
            pages: pageCount,
            color: colorType,
            layout:
              'Single-sided',
            binding,
            amount: total,
            status:
              'Pending',
            date: 'Today',
          },
        ]);

      Alert.alert(
        'Print Queued',
        `₹${total} estimated. Trees everywhere are trembling.`
      );

      setShowCreate(false);

      setStudentName('');
      setHostel('');
      setPdfName('');
      setPages('20');

      fetchData();
    };

  // STATUS
  const updateJobStatus =
    async (
      id: string,
      current: string
    ) => {
      const flow = [
        'Pending',
        'Printing',
        'Ready for Pick',
        'Completed',
      ];

      const next =
        flow[
          flow.indexOf(
            current
          ) + 1
        ];

      if (!next) return;

      await supabase
        .from(
          'stationery_print_jobs'
        )
        .update({
          status: next,
        })
        .eq('id', id);

      fetchData();
    };

  // RESTOCK
  const restockPack =
    async (
      id: string,
      qty: number
    ) => {
      const match =
        coursePacks.find(
          (c) => c.id === id
        );

      if (!match) return;

      const nextStock =
        match.stock_remaining +
        qty;

      await supabase
        .from(
          'stationery_course_packs'
        )
        .update({
          stock_remaining:
            nextStock,
          status:
            nextStock <= 3
              ? 'Critical Low'
              : 'In-Stock',
        })
        .eq('id', id);

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
            'Stationery Hub',
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
                ACTIVE PRINT JOBS
              </Text>

              <Text
                style={
                  styles.analyticsValue
                }
              >
                {pendingJobs}
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
                ₹{revenue}
              </Text>
            </GlassCard>

            {/* PRINT TAB */}
            {activeTab ===
              'print' && (
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
                      placeholder="Search print jobs..."
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
                    'Pending',
                    'Printing',
                    'Ready for Pick',
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
                              '900',
                          }}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* CREATE */}
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
                          New Print Job
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
                        studentName,
                        setStudentName,
                        'Student Name',
                      ],
                      [
                        hostel,
                        setHostel,
                        'Hostel / Room',
                      ],
                      [
                        pdfName,
                        setPdfName,
                        'PDF File Name',
                      ],
                      [
                        pages,
                        setPages,
                        'Pages',
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
                            'Pages'
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

                    {/* COLOR */}
                    <Text
                      style={[
                        styles.sectionLabel,
                        {
                          color:
                            colors.textMuted,
                        },
                      ]}
                    >
                      Color Type
                    </Text>

                    <View
                      style={
                        styles.selectionRow
                      }
                    >
                      {[
                        'B/W',
                        'Color',
                      ].map((item) => {
                        const active =
                          colorType ===
                          item;

                        return (
                          <TouchableOpacity
                            key={item}
                            style={[
                              styles.selectChip,
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
                              setColorType(
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

                    {/* BINDING */}
                    <Text
                      style={[
                        styles.sectionLabel,
                        {
                          color:
                            colors.textMuted,
                        },
                      ]}
                    >
                      Binding
                    </Text>

                    <View
                      style={
                        styles.selectionRow
                      }
                    >
                      {[
                        'None',
                        'Spiral Binding',
                        'Hard Bound Cover',
                      ].map((item) => {
                        const active =
                          binding === item;

                        return (
                          <TouchableOpacity
                            key={item}
                            style={[
                              styles.selectChip,
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
                              setBinding(
                                item
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
                                  '800',
                              }}
                            >
                              {item}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
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
                        createPrintJob
                      }
                    >
                      <Text
                        style={
                          styles.submitText
                        }
                      >
                        Queue Print Job
                      </Text>
                    </TouchableOpacity>
                  </GlassCard>
                )}

                {/* JOBS */}
                {filteredJobs.map(
                  (job) => {
                    const ready =
                      job.status ===
                      'Ready for Pick';

                    return (
                      <GlassCard
                        key={job.id}
                        style={
                          styles.printCard
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
                                job.student_name
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
                                job.hostel
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
                            <Printer
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
                                job.status
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
                          <FileText
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
                                styles.fileName,
                                {
                                  color:
                                    colors.text,
                                },
                              ]}
                            >
                              {
                                job.pdf_name
                              }
                            </Text>

                            <Text
                              style={{
                                color:
                                  colors.textMuted,
                                fontSize: 10,
                                marginTop: 4,
                              }}
                            >
                              {
                                job.pages
                              }{' '}
                              pages •{' '}
                              {
                                job.color
                              }{' '}
                              •{' '}
                              {
                                job.binding
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
                            Amount
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
                                message: `${job.student_name}, your print job is ${job.status}`,
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
                              updateJobStatus(
                                job.id,
                                job.status
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

            {/* PACKS */}
            {activeTab ===
              'packs' && (
              <>
                {coursePacks.map(
                  (pack) => {
                    const critical =
                      pack.status ===
                      'Critical Low';

                    return (
                      <GlassCard
                        key={pack.id}
                        style={
                          styles.packCard
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
                                pack.course_name
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
                                pack.price
                              }{' '}
                              per pack
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor:
                                  critical
                                    ? colors.error +
                                      '20'
                                    : colors.success +
                                      '20',
                              },
                            ]}
                          >
                            <AlertTriangle
                              size={
                                12
                              }
                              color={
                                critical
                                  ? colors.error
                                  : colors.success
                              }
                            />

                            <Text
                              style={{
                                color:
                                  critical
                                    ? colors.error
                                    : colors.success,
                                fontSize: 9,
                                fontWeight:
                                  '900',
                                marginLeft: 4,
                              }}
                            >
                              {
                                pack.status
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
                              marginTop: 14,
                            },
                          ]}
                        >
                          <View>
                            <Text
                              style={{
                                color:
                                  colors.textMuted,
                                fontSize: 10,
                              }}
                            >
                              STOCK
                            </Text>

                            <Text
                              style={{
                                color:
                                  critical
                                    ? colors.error
                                    : colors.text,
                                fontWeight:
                                  '900',
                              }}
                            >
                              {
                                pack.stock_remaining
                              }{' '}
                              copies
                            </Text>
                          </View>

                          <View>
                            <Text
                              style={{
                                color:
                                  colors.textMuted,
                                fontSize: 10,
                              }}
                            >
                              EXAM
                            </Text>

                            <Text
                              style={{
                                color:
                                  colors.text,
                                fontWeight:
                                  '900',
                              }}
                            >
                              {
                                pack.exam_date
                              }
                            </Text>
                          </View>
                        </View>

                        <View
                          style={
                            styles.restockRow
                          }
                        >
                          {[5, 10, 20].map(
                            (qty) => (
                              <TouchableOpacity
                                key={qty}
                                style={[
                                  styles.restockBtn,
                                  {
                                    backgroundColor:
                                      colors.primary,
                                  },
                                ]}
                                onPress={() =>
                                  restockPack(
                                    pack.id,
                                    qty
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
                                  +
                                  {
                                    qty
                                  }
                                </Text>
                              </TouchableOpacity>
                            )
                          )}
                        </View>
                      </GlassCard>
                    );
                  }
                )}
              </>
            )}

            {/* SLOTS */}
            {activeTab ===
              'slots' && (
              <>
                {[
                  {
                    id: '1',
                    name: 'Aman',
                    file: 'thesis.pdf',
                    time: '11:00 AM',
                  },
                  {
                    id: '2',
                    name: 'Riya',
                    file: 'notes.pdf',
                    time: '3:30 PM',
                  },
                ].map((slot) => (
                  <GlassCard
                    key={slot.id}
                    style={
                      styles.slotCard
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
                          {slot.name}
                        </Text>

                        <Text
                          style={{
                            color:
                              colors.textMuted,
                            fontSize: 11,
                          }}
                        >
                          {
                            slot.file
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
                            slot.time
                          }
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.submitBtn,
                        {
                          backgroundColor:
                            colors.surface,
                          marginTop: 16,
                        },
                      ]}
                      onPress={() =>
                        Alert.alert(
                          'Handover Logged',
                          `${slot.name} collected the documents. Humanity survives another academic cycle.`
                        )
                      }
                    >
                      <Text
                        style={{
                          color:
                            colors.text,
                          fontWeight:
                            '800',
                        }}
                      >
                        Confirm Pickup
                      </Text>
                    </TouchableOpacity>
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
            id: 'print',
            label: 'Print',
            icon: Printer,
          },
          {
            id: 'packs',
            label: 'Packs',
            icon: Flame,
          },
          {
            id: 'slots',
            label: 'Slots',
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

  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 8,
  },

  selectionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },

  selectChip: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

  printCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  packCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  slotCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  studentName: {
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

  fileName: {
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

  restockRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  restockBtn: {
    width: 46,
    height: 32,
    borderRadius: 10,
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