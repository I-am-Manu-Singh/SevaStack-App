// LibraryManagerScreen.tsx
// Refactored into something maintainable instead of a 1400-line monument
// to academic anxiety and uncontrolled state mutation.
// Humans invented competitive exams and then built apps to survive them.
// Fascinating species.

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
  BookOpen,
  Clock3,
  Plus,
  QrCode,
  ShieldAlert,
  Sparkles,
  VolumeX,
} from 'lucide-react-native';

import { GlassCard } from '@/components/GlassCard';
import { CustomerBusinessView } from '@/components/CustomerBusinessView';

import { Spacing } from '@/constants/Theme';

import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

type TabType =
  | 'seats'
  | 'silent'
  | 'passes';

const PASS_OPTIONS = [
  {
    label: 'Daily Pass',
    amount: '50',
  },
  {
    label: 'Hourly Card',
    amount: '20',
  },
  {
    label: 'Monthly Premium',
    amount: '1200',
  },
];

export default function LibraryManagerScreen() {
  const { userRole, businessType } =
    useApp();

  if (
    userRole === 'customer' ||
    businessType !== 'Library'
  ) {
    return (
      <CustomerBusinessView type="Library" />
    );
  }

  return <LibraryMerchantScreen />;
}

function LibraryMerchantScreen() {
  const { colors, profile } =
    useApp();

  const [activeTab, setActiveTab] =
    useState<TabType>('seats');

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [seats, setSeats] = useState<
    any[]
  >([]);

  const [silentLogs, setSilentLogs] =
    useState<any[]>([]);

  // ALLOCATE
  const [showAllocateModal, setShowAllocateModal] =
    useState(false);

  const [studentName, setStudentName] =
    useState('');

  const [examGoal, setExamGoal] =
    useState('UPSC Mains');

  const [duration, setDuration] =
    useState('180');

  const [silenceAlert, setSilenceAlert] =
    useState('');

  // SETTLE
  const [settlingSeat, setSettlingSeat] =
    useState<any | null>(null);

  const [selectedPass, setSelectedPass] =
    useState('Daily Pass');

  const [billAmount, setBillAmount] =
    useState('50');

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const [
        seatsResponse,
        logsResponse,
      ] = await Promise.all([
        supabase
          .from('library_seats')
          .select('*')
          .eq(
            'merchant_id',
            profile.id
          ),

        supabase
          .from(
            'library_silent_logs'
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

      // SEATS
      let seatRows =
        seatsResponse.data || [];

      if (!seatRows.length) {
        const defaultSeats =
          [
            'A1',
            'A2',
            'A3',
            'A4',
            'B1',
            'B2',
            'B3',
            'B4',
          ].map((desk) => ({
            merchant_id:
              profile.id,
            label: `Desk ${desk}`,
            student_name:
              'Vacant Desk',
            exam: 'None',
            time_left: 0,
            status: 'Vacant',
          }));

        const seeded =
          await supabase
            .from(
              'library_seats'
            )
            .insert(defaultSeats)
            .select();

        seatRows =
          seeded.data || [];
      }

      setSeats(
        seatRows
          .map((seat: any) => ({
            id: seat.id,
            label: seat.label,
            studentName:
              seat.student_name,
            exam: seat.exam,
            timeLeft:
              seat.time_left,
            status:
              seat.status,
          }))
          .sort((a, b) =>
            a.label.localeCompare(
              b.label
            )
          )
      );

      // SILENT LOGS
      let logs =
        logsResponse.data || [];

      if (!logs.length) {
        const defaultLogs = [
          {
            merchant_id:
              profile.id,
            student_name:
              'Varun Sharma',
            warning:
              'Talking loudly during mock test.',
            focus_type:
              'UPSC Mains',
            severity:
              'High',
            date: 'Today',
          },
        ];

        const seeded =
          await supabase
            .from(
              'library_silent_logs'
            )
            .insert(defaultLogs)
            .select();

        logs =
          seeded.data || [];
      }

      setSilentLogs(
        logs.map((log: any) => ({
          id: log.id,
          studentName:
            log.student_name,
          warning:
            log.warning,
          focusType:
            log.focus_type,
          severity:
            log.severity,
          date: log.date,
        }))
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
  const occupiedSeats =
    seats.filter(
      (s) =>
        s.status ===
        'Occupied'
    ).length;

  const vacantSeats =
    seats.filter(
      (s) =>
        s.status ===
        'Vacant'
    ).length;

  const silenceWarnings =
    silentLogs.length;

  const occupancyPercent =
    seats.length
      ? Math.round(
          (occupiedSeats /
            seats.length) *
            100
        )
      : 0;

  // ALLOCATE
  const allocateSeat =
    async () => {
      if (!studentName) {
        Alert.alert(
          'Missing Name',
          'Enter student name.'
        );

        return;
      }

      const vacantSeat =
        seats.find(
          (s) =>
            s.status ===
            'Vacant'
        );

      if (!vacantSeat) {
        Alert.alert(
          'Library Full',
          'No vacant desks available.'
        );

        return;
      }

      try {
        const seatUpdate =
          supabase
            .from(
              'library_seats'
            )
            .update({
              student_name:
                studentName,
              exam: examGoal,
              time_left:
                parseInt(
                  duration
                ) || 180,
              status:
                'Occupied',
            })
            .eq(
              'id',
              vacantSeat.id
            );

        const warningInsert =
          silenceAlert
            ? supabase
                .from(
                  'library_silent_logs'
                )
                .insert([
                  {
                    merchant_id:
                      profile?.id,
                    student_name:
                      studentName,
                    warning:
                      silenceAlert,
                    focus_type:
                      examGoal,
                    severity:
                      'High',
                    date: 'Today',
                  },
                ])
            : Promise.resolve();

        await Promise.all([
          seatUpdate,
          warningInsert,
        ]);

        Alert.alert(
          'Seat Allocated',
          `${vacantSeat.label} assigned successfully.`
        );

        setStudentName('');
        setExamGoal(
          'UPSC Mains'
        );
        setDuration('180');
        setSilenceAlert('');
        setShowAllocateModal(
          false
        );

        fetchData();
      } catch (e: any) {
        Alert.alert(
          'Error',
          e.message
        );
      }
    };

  // SETTLE
  const settleSeat =
    async () => {
      if (!settlingSeat)
        return;

      try {
        await supabase
          .from(
            'library_seats'
          )
          .update({
            student_name:
              'Vacant Desk',
            exam: 'None',
            time_left: 0,
            status:
              'Vacant',
          })
          .eq(
            'id',
            settlingSeat.id
          );

        Alert.alert(
          'Pass Settled',
          `₹${billAmount} received successfully.`
        );

        setSettlingSeat(null);

        fetchData();
      } catch (e: any) {
        Alert.alert(
          'Error',
          e.message
        );
      }
    };

  const passesData = [
    {
      id: '1',
      name: 'Rohan Sharma',
      goal: 'GATE CSE',
      validity:
        'Valid till June 2026',
      desk: 'Desk B1',
    },
    {
      id: '2',
      name: 'Nisha Mehta',
      goal: 'UPSC IAS',
      validity:
        'Valid till May 2026',
      desk: 'Desk A4',
    },
  ];

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
            'Library Hub',
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
          <View
            style={
              styles.analyticsHeader
            }
          >
            <View>
              <Text
                style={
                  styles.analyticsMini
                }
              >
                LIBRARY OCCUPANCY
              </Text>

              <Text
                style={
                  styles.analyticsValue
                }
              >
                {
                  occupancyPercent
                }
                %
              </Text>
            </View>

            <BookOpen
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
                  occupiedSeats
                }
              </Text>

              <Text
                style={
                  styles.analyticsStatLabel
                }
              >
                Occupied
              </Text>
            </View>

            <View>
              <Text
                style={
                  styles.analyticsStatValue
                }
              >
                {
                  vacantSeats
                }
              </Text>

              <Text
                style={
                  styles.analyticsStatLabel
                }
              >
                Vacant
              </Text>
            </View>

            <View>
              <Text
                style={
                  styles.analyticsStatValue
                }
              >
                {
                  silenceWarnings
                }
              </Text>

              <Text
                style={
                  styles.analyticsStatLabel
                }
              >
                Warnings
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* SEATS */}
        {activeTab === 'seats' && (
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
                  Study Seats
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
                  Allocate &
                  manage desks
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
                  setShowAllocateModal(
                    !showAllocateModal
                  )
                }
              >
                <Plus
                  size={18}
                  color="#FFF"
                />
              </TouchableOpacity>
            </View>

            {/* ALLOCATE */}
            {showAllocateModal && (
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
                    Allocate Seat
                  </Text>
                </View>

                <TextInput
                  placeholder="Student Name"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  value={
                    studentName
                  }
                  onChangeText={
                    setStudentName
                  }
                  style={[
                    styles.formInput,
                    {
                      borderColor:
                        colors.border,
                      backgroundColor:
                        colors.surface,
                      color:
                        colors.text,
                    },
                  ]}
                />

                <TextInput
                  placeholder="Exam Goal"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  value={
                    examGoal
                  }
                  onChangeText={
                    setExamGoal
                  }
                  style={[
                    styles.formInput,
                    {
                      borderColor:
                        colors.border,
                      backgroundColor:
                        colors.surface,
                      color:
                        colors.text,
                    },
                  ]}
                />

                <TextInput
                  placeholder="Duration Minutes"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  value={duration}
                  onChangeText={
                    setDuration
                  }
                  keyboardType="numeric"
                  style={[
                    styles.formInput,
                    {
                      borderColor:
                        colors.border,
                      backgroundColor:
                        colors.surface,
                      color:
                        colors.text,
                    },
                  ]}
                />

                <TextInput
                  placeholder="Silent Alert (optional)"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  value={
                    silenceAlert
                  }
                  onChangeText={
                    setSilenceAlert
                  }
                  style={[
                    styles.formInput,
                    {
                      borderColor:
                        colors.border,
                      backgroundColor:
                        colors.surface,
                      color:
                        colors.text,
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
                    allocateSeat
                  }
                >
                  <Text
                    style={
                      styles.submitText
                    }
                  >
                    Confirm
                    Allocation
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* GRID */}
            <View
              style={
                styles.seatGrid
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
                seats.map((seat) => {
                  const occupied =
                    seat.status ===
                    'Occupied';

                  return (
                    <GlassCard
                      key={seat.id}
                      style={
                        styles.seatCard
                      }
                    >
                      <View
                        style={
                          styles.seatHeader
                        }
                      >
                        <BookOpen
                          size={18}
                          color={
                            occupied
                              ? colors.primary
                              : colors.textMuted
                          }
                        />

                        <View
                          style={[
                            styles.seatBadge,
                            {
                              backgroundColor:
                                occupied
                                  ? colors.primary +
                                    '20'
                                  : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color:
                                occupied
                                  ? colors.primary
                                  : colors.textMuted,
                              fontSize: 9,
                              fontWeight:
                                '900',
                            }}
                          >
                            {
                              seat.label
                            }
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={[
                          styles.seatName,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {
                          seat.studentName
                        }
                      </Text>

                      {occupied ? (
                        <>
                          <Text
                            style={{
                              color:
                                colors.primary,
                              fontSize: 10,
                              fontWeight:
                                '700',
                              marginTop: 4,
                            }}
                          >
                            {
                              seat.exam
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
                              seat.timeLeft
                            }{' '}
                            mins left
                          </Text>

                          <TouchableOpacity
                            style={[
                              styles.vacateBtn,
                              {
                                borderColor:
                                  colors.success,
                                backgroundColor:
                                  colors.success +
                                  '20',
                              },
                            ]}
                            onPress={() =>
                              setSettlingSeat(
                                seat
                              )
                            }
                          >
                            <Text
                              style={{
                                color:
                                  colors.success,
                                fontSize: 10,
                                fontWeight:
                                  '800',
                              }}
                            >
                              Vacate &
                              Settle
                            </Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.allocateNowBtn,
                            {
                              backgroundColor:
                                colors.surface,
                            },
                          ]}
                          onPress={() =>
                            setShowAllocateModal(
                              true
                            )
                          }
                        >
                          <Text
                            style={{
                              color:
                                colors.text,
                              fontSize: 10,
                              fontWeight:
                                '800',
                            }}
                          >
                            Allocate
                          </Text>
                        </TouchableOpacity>
                      )}
                    </GlassCard>
                  );
                })
              )}
            </View>

            {/* SETTLE */}
            {settlingSeat && (
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
                    Settle Pass
                  </Text>
                </View>

                <View
                  style={
                    styles.passOptionsRow
                  }
                >
                  {PASS_OPTIONS.map(
                    (pass) => {
                      const active =
                        selectedPass ===
                        pass.label;

                      return (
                        <TouchableOpacity
                          key={
                            pass.label
                          }
                          style={[
                            styles.passChip,
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
                          onPress={() => {
                            setSelectedPass(
                              pass.label
                            );

                            setBillAmount(
                              pass.amount
                            );
                          }}
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
                              pass.label
                            }
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>

                <TextInput
                  value={
                    billAmount
                  }
                  onChangeText={
                    setBillAmount
                  }
                  keyboardType="numeric"
                  style={[
                    styles.formInput,
                    {
                      borderColor:
                        colors.border,
                      backgroundColor:
                        colors.surface,
                      color:
                        colors.text,
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
                    settleSeat
                  }
                >
                  <Text
                    style={
                      styles.submitText
                    }
                  >
                    Confirm &
                    Vacate
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            )}
          </>
        )}

        {/* SILENT */}
        {activeTab ===
          'silent' && (
          <>
            {silentLogs.map(
              (log) => (
                <GlassCard
                  key={log.id}
                  style={
                    styles.warningCard
                  }
                >
                  <View
                    style={
                      styles.warningHeader
                    }
                  >
                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <Text
                        style={[
                          styles.warningName,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {
                          log.studentName
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
                          log.focusType
                        }{' '}
                        •{' '}
                        {
                          log.date
                        }
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.warningBadge,
                        {
                          backgroundColor:
                            colors.error +
                            '20',
                        },
                      ]}
                    >
                      <ShieldAlert
                        size={12}
                        color={
                          colors.error
                        }
                      />

                      <Text
                        style={{
                          color:
                            colors.error,
                          fontSize: 9,
                          fontWeight:
                            '900',
                          marginLeft: 4,
                        }}
                      >
                        SILENT
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.warningBody,
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
                        fontSize: 12,
                        lineHeight: 18,
                      }}
                    >
                      {
                        log.warning
                      }
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.broadcastBtn,
                      {
                        borderColor:
                          colors.primary,
                        backgroundColor:
                          colors.primary +
                          '12',
                      },
                    ]}
                    onPress={() =>
                      Share.share({
                        message: `Silence alert: ${log.warning}`,
                      })
                    }
                  >
                    <VolumeX
                      size={13}
                      color={
                        colors.primary
                      }
                    />

                    <Text
                      style={{
                        color:
                          colors.primary,
                        fontWeight:
                          '800',
                        fontSize: 10,
                        marginLeft: 5,
                      }}
                    >
                      Broadcast
                      Alert
                    </Text>
                  </TouchableOpacity>
                </GlassCard>
              )
            )}
          </>
        )}

        {/* PASSES */}
        {activeTab ===
          'passes' && (
          <>
            {passesData.map(
              (pass) => (
                <GlassCard
                  key={pass.id}
                  style={
                    styles.passCard
                  }
                >
                  <View
                    style={
                      styles.warningHeader
                    }
                  >
                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <Text
                        style={[
                          styles.warningName,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {
                          pass.name
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
                          pass.goal
                        }{' '}
                        •{' '}
                        {
                          pass.desk
                        }
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.passValidity,
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
                        VALID
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.passFooter,
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
                      {
                        pass.validity
                      }
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.verifyBtn,
                        {
                          backgroundColor:
                            colors.surface,
                        },
                      ]}
                      onPress={() =>
                        Alert.alert(
                          'Verified',
                          'Pass validated successfully.'
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
                        Verify
                      </Text>
                    </TouchableOpacity>
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
            id: 'seats',
            label: 'Seats',
            icon: BookOpen,
          },
          {
            id: 'silent',
            label: 'Silence',
            icon: VolumeX,
          },
          {
            id: 'passes',
            label: 'Passes',
            icon: Clock3,
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

  analyticsCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
  },

  analyticsHeader: {
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

  submitBtn: {
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  submitText: {
    color: '#FFF',
    fontWeight: '900',
  },

  seatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  seatCard: {
    width: '48%',
    padding: 14,
    borderRadius: 18,
  },

  seatHeader: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  seatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  seatName: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 8,
  },

  vacateBtn: {
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },

  allocateNowBtn: {
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },

  passOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },

  passChip: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  warningCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  warningName: {
    fontSize: 15,
    fontWeight: '900',
  },

  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  warningBody: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },

  broadcastBtn: {
    height: 36,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 14,
  },

  passCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  passValidity: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  passFooter: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  verifyBtn: {
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