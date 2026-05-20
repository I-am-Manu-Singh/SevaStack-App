// Refactored TuitionManagerScreen
// Cleaner structure, reusable UI, better derived state handling.
// Humanity really did build an entire coaching-industrial complex
// around rotational dynamics and percentile trauma. Spectacular.

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
  Award,
  BookOpen,
  FileText,
  GraduationCap,
  Plus,
  Search,
  Share2,
  Sparkles,
} from 'lucide-react-native';

import { GlassCard } from '@/components/GlassCard';
import { CustomerBusinessView } from '@/components/CustomerBusinessView';

import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

import { Spacing } from '@/constants/Theme';

type TabType =
  | 'slots'
  | 'tests'
  | 'resources';

export default function TuitionManagerScreen() {
  const { userRole, businessType } =
    useApp();

  if (
    userRole === 'customer' ||
    businessType !== 'Tuition'
  ) {
    return (
      <CustomerBusinessView type="Tuition" />
    );
  }

  return <MerchantScreen />;
}

function MerchantScreen() {
  const { colors, profile } =
    useApp();

  const [activeTab, setActiveTab] =
    useState<TabType>('slots');

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [slots, setSlots] =
    useState<any[]>([]);

  const [tests, setTests] =
    useState<any[]>([]);

  const [resources, setResources] =
    useState<any[]>([]);

  // SEARCH + FILTER
  const [search, setSearch] =
    useState('');

  const [slotFilter, setSlotFilter] =
    useState<
      | 'All'
      | 'Booked'
      | 'In Session'
      | 'Doubt Cleared'
    >('All');

  // MODALS
  const [showSlotForm, setShowSlotForm] =
    useState(false);

  const [showTestForm, setShowTestForm] =
    useState(false);

  const [
    showResourceForm,
    setShowResourceForm,
  ] = useState(false);

  // SLOT FORM
  const [slotName, setSlotName] =
    useState('');

  const [slotSubject, setSlotSubject] =
    useState('Physics Clinic');

  const [slotTopic, setSlotTopic] =
    useState('');

  const [slotTime, setSlotTime] =
    useState(
      '05:00 PM - 05:15 PM'
    );

  // TEST FORM
  const [testStudent, setTestStudent] =
    useState('');

  const [testTitle, setTestTitle] =
    useState('JEE Mock Test #09');

  const [phy, setPhy] =
    useState('80');

  const [chem, setChem] =
    useState('85');

  const [math, setMath] =
    useState('90');

  // RESOURCE FORM
  const [resourceTitle, setResourceTitle] =
    useState('');

  const [resourceCategory, setResourceCategory] =
    useState('Physics Notes');

  const [resourceUrl, setResourceUrl] =
    useState('');

  // DASHBOARD METRICS
  const totalStudents = useMemo(
    () =>
      new Set(
        tests.map(
          (t) => t.studentName
        )
      ).size,
    [tests]
  );

  const activeSlots = useMemo(
    () =>
      slots.filter(
        (s) =>
          s.status !==
          'Doubt Cleared'
      ).length,
    [slots]
  );

  const totalResources = useMemo(
    () => resources.length,
    [resources]
  );

  // FETCH
  const fetchData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const [
        slotsRes,
        testsRes,
        resourcesRes,
      ] = await Promise.all([
        supabase
          .from('tuition_slots')
          .select('*')
          .eq(
            'merchant_id',
            profile.id
          )
          .order('created_at', {
            ascending: false,
          }),

        supabase
          .from('tuition_tests')
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
            'tuition_resources'
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

      setSlots(
        (slotsRes.data || []).map(
          (s: any) => ({
            id: s.id,
            studentName:
              s.student_name,
            subject: s.subject,
            topic: s.topic,
            timeSlot:
              s.time_slot,
            status: s.status,
            date:
              s.date ||
              'Today',
          })
        )
      );

      setTests(
        (testsRes.data || []).map(
          (t: any) => ({
            id: t.id,
            studentName:
              t.student_name,
            testName:
              t.test_name,
            physics:
              t.physics_score,
            chemistry:
              t.chemistry_score,
            maths:
              t.math_score,
            rank: t.rank,
          })
        )
      );

      setResources(
        (resourcesRes.data || []).map(
          (r: any) => ({
            id: r.id,
            title: r.title,
            category:
              r.category,
            url:
              r.download_url,
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

  // FILTERED SLOTS
  const filteredSlots =
    slots.filter((s) => {
      const q =
        search.toLowerCase();

      const matchesSearch =
        s.studentName
          .toLowerCase()
          .includes(q) ||
        s.topic
          .toLowerCase()
          .includes(q) ||
        s.subject
          .toLowerCase()
          .includes(q);

      const matchesFilter =
        slotFilter === 'All' ||
        s.status ===
          slotFilter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });

  // CREATE SLOT
  const createSlot =
    async () => {
      if (
        !slotName ||
        !slotTopic
      ) {
        Alert.alert(
          'Missing Fields',
          'The educational machine demands complete suffering documentation.'
        );

        return;
      }

      await supabase
        .from('tuition_slots')
        .insert([
          {
            merchant_id:
              profile?.id,
            student_name:
              slotName,
            subject:
              slotSubject,
            topic:
              slotTopic,
            time_slot:
              slotTime,
            status: 'Booked',
            date: 'Today',
          },
        ]);

      Alert.alert(
        'Slot Created',
        `${slotName} now has a scheduled academic panic session.`
      );

      setSlotName('');
      setSlotTopic('');
      setShowSlotForm(false);

      fetchData();
    };

  // UPDATE SLOT STATUS
  const updateSlotStatus =
    async (
      id: string,
      status: string
    ) => {
      const flow = [
        'Booked',
        'In Session',
        'Doubt Cleared',
      ];

      const next =
        flow[
          flow.indexOf(
            status
          ) + 1
        ];

      if (!next) return;

      await supabase
        .from('tuition_slots')
        .update({
          status: next,
        })
        .eq('id', id);

      fetchData();
    };

  // ADD TEST
  const addTest =
    async () => {
      if (!testStudent) {
        Alert.alert(
          'Missing Student',
          'Even standardized misery requires a name.'
        );

        return;
      }

      await supabase
        .from('tuition_tests')
        .insert([
          {
            merchant_id:
              profile?.id,
            student_name:
              testStudent,
            test_name:
              testTitle,
            physics_score:
              Number(phy),
            chemistry_score:
              Number(chem),
            math_score:
              Number(math),
            rank:
              'AIR Mock Rank',
          },
        ]);

      setShowTestForm(false);
      setTestStudent('');

      fetchData();
    };

  // ADD RESOURCE
  const addResource =
    async () => {
      if (!resourceTitle)
        return;

      await supabase
        .from(
          'tuition_resources'
        )
        .insert([
          {
            merchant_id:
              profile?.id,
            title:
              resourceTitle,
            category:
              resourceCategory,
            download_url:
              resourceUrl,
            active: true,
          },
        ]);

      setShowResourceForm(
        false
      );

      setResourceTitle('');

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
            'Tuition Manager',
          headerTintColor:
            colors.primary,
          headerStyle: {
            backgroundColor:
              colors.background,
          },
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
        showsVerticalScrollIndicator={
          false
        }
      >
        {loading ? (
          <View
            style={{
              padding: 50,
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
                styles.heroCard,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >
              <Text
                style={
                  styles.heroLabel
                }
              >
                COACHING OPERATIONS
              </Text>

              <View
                style={
                  styles.heroMetrics
                }
              >
                <Metric
                  value={
                    totalStudents
                  }
                  label="Students"
                />

                <Metric
                  value={
                    activeSlots
                  }
                  label="Active Slots"
                />

                <Metric
                  value={
                    totalResources
                  }
                  label="Resources"
                />
              </View>
            </GlassCard>

            {/* SLOTS */}
            {activeTab ===
              'slots' && (
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
                      value={search}
                      onChangeText={
                        setSearch
                      }
                      placeholder="Search student/topic..."
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
                      setShowSlotForm(
                        !showSlotForm
                      )
                    }
                  >
                    <Plus
                      size={20}
                      color="#FFF"
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={
                    styles.filterRow
                  }
                >
                  {[
                    'All',
                    'Booked',
                    'In Session',
                    'Doubt Cleared',
                  ].map((f) => {
                    const active =
                      slotFilter ===
                      f;

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
                          setSlotFilter(
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

                {/* SLOT FORM */}
                {showSlotForm && (
                  <GlassCard
                    style={
                      styles.formCard
                    }
                  >
                    <FormHeader
                      title="Book Doubt Slot"
                      icon={
                        Sparkles
                      }
                      colors={
                        colors
                      }
                      onClose={() =>
                        setShowSlotForm(
                          false
                        )
                      }
                    />

                    <Input
                      value={
                        slotName
                      }
                      onChangeText={
                        setSlotName
                      }
                      placeholder="Student Name"
                      colors={
                        colors
                      }
                    />

                    <Input
                      value={
                        slotSubject
                      }
                      onChangeText={
                        setSlotSubject
                      }
                      placeholder="Subject"
                      colors={
                        colors
                      }
                    />

                    <Input
                      value={
                        slotTopic
                      }
                      onChangeText={
                        setSlotTopic
                      }
                      placeholder="Doubt Topic"
                      colors={
                        colors
                      }
                    />

                    <Input
                      value={
                        slotTime
                      }
                      onChangeText={
                        setSlotTime
                      }
                      placeholder="Time Slot"
                      colors={
                        colors
                      }
                    />

                    <PrimaryButton
                      text="Create Slot"
                      colors={
                        colors
                      }
                      onPress={
                        createSlot
                      }
                    />
                  </GlassCard>
                )}

                {/* SLOT LIST */}
                {filteredSlots.map(
                  (slot) => (
                    <GlassCard
                      key={slot.id}
                      style={
                        styles.card
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
                              styles.title,
                              {
                                color:
                                  colors.text,
                              },
                            ]}
                          >
                            {
                              slot.studentName
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
                              slot.timeSlot
                            }
                          </Text>
                        </View>

                        <Badge
                          text={
                            slot.status
                          }
                          color={
                            slot.status ===
                            'Doubt Cleared'
                              ? colors.success
                              : colors.accent
                          }
                        />
                      </View>

                      <View
                        style={[
                          styles.dividerBox,
                          {
                            borderTopColor:
                              colors.border,
                          },
                        ]}
                      >
                        <BookOpen
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
                            style={{
                              color:
                                colors.text,
                              fontWeight:
                                '800',
                            }}
                          >
                            {
                              slot.subject
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
                              slot.topic
                            }
                          </Text>
                        </View>
                      </View>

                      <View
                        style={
                          styles.actionRow
                        }
                      >
                        <TouchableOpacity
                          style={[
                            styles.secondaryBtn,
                            {
                              backgroundColor:
                                colors.surfaceLight,
                            },
                          ]}
                          onPress={() =>
                            Share.share({
                              message: `Reminder for ${slot.studentName}: ${slot.subject} slot at ${slot.timeSlot}`,
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
                              fontSize: 10,
                              fontWeight:
                                '800',
                            }}
                          >
                            Share
                          </Text>
                        </TouchableOpacity>

                        {slot.status !==
                          'Doubt Cleared' && (
                          <PrimaryMiniButton
                            colors={
                              colors
                            }
                            text={
                              slot.status ===
                              'Booked'
                                ? 'Start Session'
                                : 'Mark Cleared'
                            }
                            onPress={() =>
                              updateSlotStatus(
                                slot.id,
                                slot.status
                              )
                            }
                          />
                        )}
                      </View>
                    </GlassCard>
                  )
                )}
              </>
            )}

            {/* TESTS */}
            {activeTab ===
              'tests' && (
              <>
                <TopAction
                  text="Add Mock Test"
                  colors={colors}
                  onPress={() =>
                    setShowTestForm(
                      !showTestForm
                    )
                  }
                />

                {showTestForm && (
                  <GlassCard
                    style={
                      styles.formCard
                    }
                  >
                    <FormHeader
                      title="Mock Score Card"
                      icon={
                        Award
                      }
                      colors={
                        colors
                      }
                      onClose={() =>
                        setShowTestForm(
                          false
                        )
                      }
                    />

                    <Input
                      value={
                        testStudent
                      }
                      onChangeText={
                        setTestStudent
                      }
                      placeholder="Student Name"
                      colors={
                        colors
                      }
                    />

                    <Input
                      value={
                        testTitle
                      }
                      onChangeText={
                        setTestTitle
                      }
                      placeholder="Mock Test"
                      colors={
                        colors
                      }
                    />

                    <View
                      style={
                        styles.scoreRow
                      }
                    >
                      <Input
                        value={phy}
                        onChangeText={
                          setPhy
                        }
                        placeholder="Physics"
                        colors={
                          colors
                        }
                        compact
                      />

                      <Input
                        value={chem}
                        onChangeText={
                          setChem
                        }
                        placeholder="Chem"
                        colors={
                          colors
                        }
                        compact
                      />

                      <Input
                        value={math}
                        onChangeText={
                          setMath
                        }
                        placeholder="Math"
                        colors={
                          colors
                        }
                        compact
                      />
                    </View>

                    <PrimaryButton
                      text="Save Test"
                      colors={
                        colors
                      }
                      onPress={
                        addTest
                      }
                    />
                  </GlassCard>
                )}

                {tests.map(
                  (test) => {
                    const avg =
                      Math.round(
                        (test.physics +
                          test.chemistry +
                          test.maths) /
                          3
                      );

                    return (
                      <GlassCard
                        key={test.id}
                        style={
                          styles.card
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
                                styles.title,
                                {
                                  color:
                                    colors.text,
                                },
                              ]}
                            >
                              {
                                test.studentName
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
                                test.testName
                              }
                            </Text>
                          </View>

                          <Badge
                            text={`${avg}%`}
                            color={
                              colors.success
                            }
                          />
                        </View>

                        <View
                          style={[
                            styles.scoreGrid,
                            {
                              borderTopColor:
                                colors.border,
                            },
                          ]}
                        >
                          {[
                            [
                              'PHY',
                              test.physics,
                            ],
                            [
                              'CHEM',
                              test.chemistry,
                            ],
                            [
                              'MATH',
                              test.maths,
                            ],
                          ].map(
                            (
                              item,
                              idx
                            ) => (
                              <View
                                key={idx}
                                style={
                                  styles.scoreCell
                                }
                              >
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

                                <Text
                                  style={{
                                    color:
                                      colors.text,
                                    fontWeight:
                                      '900',
                                  }}
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
                    );
                  }
                )}
              </>
            )}

            {/* RESOURCES */}
            {activeTab ===
              'resources' && (
              <>
                <TopAction
                  text="Publish Notes"
                  colors={colors}
                  onPress={() =>
                    setShowResourceForm(
                      !showResourceForm
                    )
                  }
                />

                {showResourceForm && (
                  <GlassCard
                    style={
                      styles.formCard
                    }
                  >
                    <FormHeader
                      title="Publish Resource"
                      icon={
                        FileText
                      }
                      colors={
                        colors
                      }
                      onClose={() =>
                        setShowResourceForm(
                          false
                        )
                      }
                    />

                    <Input
                      value={
                        resourceTitle
                      }
                      onChangeText={
                        setResourceTitle
                      }
                      placeholder="Title"
                      colors={
                        colors
                      }
                    />

                    <Input
                      value={
                        resourceCategory
                      }
                      onChangeText={
                        setResourceCategory
                      }
                      placeholder="Category"
                      colors={
                        colors
                      }
                    />

                    <Input
                      value={
                        resourceUrl
                      }
                      onChangeText={
                        setResourceUrl
                      }
                      placeholder="PDF URL"
                      colors={
                        colors
                      }
                    />

                    <PrimaryButton
                      text="Publish"
                      colors={
                        colors
                      }
                      onPress={
                        addResource
                      }
                    />
                  </GlassCard>
                )}

                {resources.map(
                  (
                    resource
                  ) => (
                    <GlassCard
                      key={
                        resource.id
                      }
                      style={
                        styles.card
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
                              styles.title,
                              {
                                color:
                                  colors.text,
                              },
                            ]}
                          >
                            {
                              resource.title
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
                              resource.category
                            }
                          </Text>
                        </View>

                        <Badge
                          text="LIVE"
                          color={
                            colors.success
                          }
                        />
                      </View>

                      <View
                        style={[
                          styles.dividerBox,
                          {
                            borderTopColor:
                              colors.border,
                          },
                        ]}
                      >
                        <Text
                          numberOfLines={
                            1
                          }
                          style={{
                            color:
                              colors.primary,
                            flex: 1,
                            fontWeight:
                              '700',
                          }}
                        >
                          {
                            resource.url
                          }
                        </Text>

                        <TouchableOpacity
                          style={[
                            styles.secondaryBtn,
                            {
                              backgroundColor:
                                colors.surfaceLight,
                            },
                          ]}
                          onPress={() =>
                            Share.share({
                              message: `${resource.title} - ${resource.url}`,
                            })
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
                            Share
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
            id: 'slots',
            label: 'Slots',
            icon:
              GraduationCap,
          },
          {
            id: 'tests',
            label: 'Tests',
            icon: Award,
          },
          {
            id: 'resources',
            label:
              'Resources',
            icon: FileText,
          },
        ].map((tab) => {
          const Icon = tab.icon;

          const active =
            activeTab ===
            tab.id;

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
                  fontSize: 10,
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

/* ---------- REUSABLES ---------- */

function Metric({
  value,
  label,
}: any) {
  return (
    <View>
      <Text
        style={{
          color: '#FFF',
          fontSize: 28,
          fontWeight: '900',
        }}
      >
        {value}
      </Text>

      <Text
        style={{
          color:
            'rgba(255,255,255,0.7)',
          fontSize: 10,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function Badge({
  text,
  color,
}: any) {
  return (
    <View
      style={{
        backgroundColor:
          color + '20',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
      }}
    >
      <Text
        style={{
          color,
          fontSize: 9,
          fontWeight: '900',
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function Input({
  colors,
  compact,
  ...props
}: any) {
  return (
    <TextInput
      placeholderTextColor={
        colors.textMuted
      }
      style={[
        styles.input,
        compact && {
          flex: 1,
          marginHorizontal: 4,
        },
        {
          color: colors.text,
          borderColor:
            colors.border,
          backgroundColor:
            colors.surface,
        },
      ]}
      {...props}
    />
  );
}

function FormHeader({
  title,
  icon: Icon,
  colors,
  onClose,
}: any) {
  return (
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
        <Icon
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
          {title}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onClose}
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
  );
}

function PrimaryButton({
  text,
  colors,
  onPress,
}: any) {
  return (
    <TouchableOpacity
      style={[
        styles.primaryBtn,
        {
          backgroundColor:
            colors.primary,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={{
          color: '#FFF',
          fontWeight: '900',
        }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

function PrimaryMiniButton({
  text,
  colors,
  onPress,
}: any) {
  return (
    <TouchableOpacity
      style={[
        styles.secondaryBtn,
        {
          backgroundColor:
            colors.primary,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={{
          color: '#FFF',
          fontSize: 10,
          fontWeight: '900',
        }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

function TopAction({
  text,
  colors,
  onPress,
}: any) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent:
          'flex-end',
        marginBottom: 12,
      }}
    >
      <TouchableOpacity
        style={[
          styles.topAction,
          {
            backgroundColor:
              colors.primary,
          },
        ]}
        onPress={onPress}
      >
        <Plus
          size={14}
          color="#FFF"
        />

        <Text
          style={{
            color: '#FFF',
            fontSize: 11,
            fontWeight: '900',
            marginLeft: 4,
          }}
        >
          {text}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    padding: Spacing.md,
  },

  heroCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
  },

  heroLabel: {
    color:
      'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 16,
  },

  heroMetrics: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
  },

  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  searchBar: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: 14,
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
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
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

  primaryBtn: {
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontSize: 15,
    fontWeight: '900',
  },

  dividerBox: {
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  secondaryBtn: {
    height: 36,
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  topAction: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    borderRadius: 10,
    paddingHorizontal: 12,
  },

  scoreRow: {
    flexDirection: 'row',
  },

  scoreGrid: {
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent:
      'space-between',
  },

  scoreCell: {
    alignItems: 'center',
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