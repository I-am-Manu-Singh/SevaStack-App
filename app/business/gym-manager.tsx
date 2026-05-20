// GymManagerScreen.tsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
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
  Activity,
  Apple,
  Clock,
  Plus,
  Search,
  Share2,
  Sparkles,
  QrCode,
  HeartPulse,
  Trash2,
  Dumbbell,
  Trophy,
  Flame,
  TimerReset,
  CheckCircle2,
} from 'lucide-react-native';

import { Spacing } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { CustomerBusinessView } from '@/components/CustomerBusinessView';

interface GymMember {
  id: string;
  studentName: string;
  hostel: string;
  planType: string;
  slotTime: string;
  locker: string;
  status: 'Active' | 'Expired';
  daysLeft: number;
  amount: number;
  date: string;
}

interface DietPlan {
  id: string;
  studentName: string;
  planName: string;
  protein: number;
  carbs: number;
  fats: number;
  targetWeight: number;
  goal: string;
  progress: number;
}

export default function GymManagerScreen() {
  const { userRole, businessType } = useApp();

  if (
    userRole === 'customer' ||
    businessType !== 'Gym'
  ) {
    return <CustomerBusinessView type="Gym" />;
  }

  return <GymManagerMerchant />;
}

function GymManagerMerchant() {
  const { colors, profile } = useApp();

  const [activeTab, setActiveTab] = useState<
    'members' | 'diets' | 'slots'
  >('members');

  const [members, setMembers] = useState<
    GymMember[]
  >([]);

  const [diets, setDiets] = useState<
    DietPlan[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [memberFilter, setMemberFilter] =
    useState<'All' | 'Active' | 'Expired'>(
      'All'
    );

  // ADD MEMBER
  const [showMemberModal, setShowMemberModal] =
    useState(false);

  const [newMember, setNewMember] = useState({
    name: '',
    hostel: '',
    plan: '1-Month Standard',
    locker: '',
    slot: 'Evening (5PM - 7PM)',
    amount: '1000',
  });

  // ADD DIET
  const [showDietModal, setShowDietModal] =
    useState(false);

  const [dietForm, setDietForm] = useState({
    name: '',
    plan: 'High Protein Bulk',
    protein: '150',
    carbs: '250',
    fats: '70',
    goal: 'Muscle Gain',
  });

  // RENEW
  const [renewMember, setRenewMember] =
    useState<GymMember | null>(null);

  const [renewAmount, setRenewAmount] =
    useState('1000');

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const [membersRes, dietsRes] =
        await Promise.all([
          supabase
            .from('gym_members')
            .select('*')
            .eq('merchant_id', profile.id)
            .order('created_at', {
              ascending: false,
            }),

          supabase
            .from('gym_diets')
            .select('*')
            .eq('merchant_id', profile.id)
            .order('created_at', {
              ascending: false,
            }),
        ]);

      setMembers(
        (membersRes.data || []).map(
          (row: any) => ({
            id: row.id,
            studentName: row.student_name,
            hostel: row.hostel,
            planType: row.plan_type,
            slotTime: row.slot_time,
            locker: row.locker,
            status: row.status,
            daysLeft: row.days_left,
            amount: row.amount,
            date: row.date,
          })
        )
      );

      setDiets(
        (dietsRes.data || []).map(
          (row: any) => ({
            id: row.id,
            studentName: row.student_name,
            planName: row.plan_name,
            protein: row.protein,
            carbs: row.carbs,
            fats: row.fats,
            targetWeight:
              row.target_weight,
            goal: row.goal,
            progress: row.progress,
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
  const activeMembers = members.filter(
    (m) => m.status === 'Active'
  ).length;

  const expiredMembers = members.filter(
    (m) => m.status === 'Expired'
  ).length;

  const totalRevenue = members.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  // FILTER
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.studentName
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        m.hostel
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        m.locker
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          );

      const matchesFilter =
        memberFilter === 'All' ||
        m.status === memberFilter;

      return (
        matchesSearch && matchesFilter
      );
    });
  }, [
    members,
    searchQuery,
    memberFilter,
  ]);

  // ADD MEMBER
  const addMember = async () => {
    if (!newMember.name) {
      Alert.alert(
        'Missing Name',
        'Enter member name.'
      );
      return;
    }

    try {
      const isPremium =
        newMember.plan.includes(
          '3-Month'
        );

      const { error } = await supabase
        .from('gym_members')
        .insert([
          {
            merchant_id: profile?.id,
            student_name:
              newMember.name,
            hostel:
              newMember.hostel ||
              'Walk-in',
            plan_type: newMember.plan,
            slot_time: newMember.slot,
            locker:
              newMember.locker ||
              'Locker 01',
            status: 'Active',
            days_left: isPremium
              ? 90
              : 30,
            amount: parseInt(
              newMember.amount
            ),
            date: 'Today',
          },
        ]);

      if (error) throw error;

      Alert.alert(
        'Success',
        'Gym member enrolled.'
      );

      setShowMemberModal(false);

      setNewMember({
        name: '',
        hostel: '',
        plan: '1-Month Standard',
        locker: '',
        slot:
          'Evening (5PM - 7PM)',
        amount: '1000',
      });

      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  // DELETE MEMBER
  const deleteMember = async (
    memberId: string
  ) => {
    Alert.alert(
      'Delete Member',
      'Remove member permanently?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } =
                await supabase
                  .from(
                    'gym_members'
                  )
                  .delete()
                  .eq('id', memberId);

              if (error)
                throw error;

              fetchData();
            } catch (e: any) {
              Alert.alert(
                'Error',
                e.message
              );
            }
          },
        },
      ]
    );
  };

  // ADD DIET
  const addDiet = async () => {
    if (!dietForm.name) {
      Alert.alert(
        'Missing Name',
        'Enter student name.'
      );
      return;
    }

    try {
      const { error } = await supabase
        .from('gym_diets')
        .insert([
          {
            merchant_id: profile?.id,
            student_name:
              dietForm.name,
            plan_name: dietForm.plan,
            protein: parseInt(
              dietForm.protein
            ),
            carbs: parseInt(
              dietForm.carbs
            ),
            fats: parseInt(
              dietForm.fats
            ),
            target_weight: 75,
            goal: dietForm.goal,
            progress: 0,
          },
        ]);

      if (error) throw error;

      Alert.alert(
        'Saved',
        'Diet plan created.'
      );

      setShowDietModal(false);

      setDietForm({
        name: '',
        plan:
          'High Protein Bulk',
        protein: '150',
        carbs: '250',
        fats: '70',
        goal: 'Muscle Gain',
      });

      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  // RENEW
  const renewSubscription =
    async () => {
      if (!renewMember) return;

      try {
        const premium =
          renewAmount === '2400';

        const { error } =
          await supabase
            .from('gym_members')
            .update({
              status: 'Active',
              days_left: premium
                ? 90
                : 30,
              plan_type: premium
                ? '3-Month Premium'
                : '1-Month Standard',
              amount:
                parseInt(
                  renewAmount
                ),
              date: 'Renewed Today',
            })
            .eq('id', renewMember.id);

        if (error) throw error;

        Alert.alert(
          'Renewed',
          'Membership renewed successfully.'
        );

        setRenewMember(null);

        fetchData();
      } catch (e: any) {
        Alert.alert(
          'Error',
          e.message
        );
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
            'Gym & Fitness Hub',
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
              styles.hudTop
            }
          >
            <View>
              <Text
                style={
                  styles.hudMini
                }
              >
                MONTHLY REVENUE
              </Text>

              <Text
                style={
                  styles.hudAmount
                }
              >
                ₹
                {totalRevenue}
              </Text>
            </View>

            <Dumbbell
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
              styles.statsRow
            }
          >
            <View>
              <Text
                style={
                  styles.statsValue
                }
              >
                {
                  activeMembers
                }
              </Text>

              <Text
                style={
                  styles.statsLabel
                }
              >
                Active
              </Text>
            </View>

            <View>
              <Text
                style={
                  styles.statsValue
                }
              >
                {
                  expiredMembers
                }
              </Text>

              <Text
                style={
                  styles.statsLabel
                }
              >
                Expired
              </Text>
            </View>

            <View>
              <Text
                style={
                  styles.statsValue
                }
              >
                {diets.length}
              </Text>

              <Text
                style={
                  styles.statsLabel
                }
              >
                Diet Plans
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <>
            <View
              style={
                styles.headerRow
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
                  Gym Members
                </Text>

                <Text
                  style={{
                    color:
                      colors.textMuted,
                    marginTop: 2,
                    fontSize: 12,
                  }}
                >
                  Track plans,
                  lockers &
                  memberships
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
                  setShowMemberModal(
                    !showMemberModal
                  )
                }
              >
                <Plus
                  size={18}
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
                placeholder="Search member..."
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

            {/* FILTERS */}
            <View
              style={
                styles.filterRow
              }
            >
              {[
                'All',
                'Active',
                'Expired',
              ].map((f) => {
                const active =
                  memberFilter ===
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
                      setMemberFilter(
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

            {/* ADD MEMBER FORM */}
            {showMemberModal && (
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
                    Add Gym Member
                  </Text>
                </View>

                {[
                  {
                    key: 'name',
                    placeholder:
                      'Student Name',
                  },
                  {
                    key: 'hostel',
                    placeholder:
                      'Hostel',
                  },
                  {
                    key: 'locker',
                    placeholder:
                      'Locker No',
                  },
                  {
                    key: 'slot',
                    placeholder:
                      'Workout Slot',
                  },
                  {
                    key: 'amount',
                    placeholder:
                      'Membership Amount',
                  },
                ].map((field) => (
                  <TextInput
                    key={field.key}
                    placeholder={
                      field.placeholder
                    }
                    placeholderTextColor={
                      colors.textMuted
                    }
                    value={
                      newMember[
                        field.key as keyof typeof newMember
                      ]
                    }
                    onChangeText={(
                      val
                    ) =>
                      setNewMember({
                        ...newMember,
                        [field.key]:
                          val,
                      })
                    }
                    style={[
                      styles.formInput,
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
                ))}

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                  onPress={
                    addMember
                  }
                >
                  <Text
                    style={
                      styles.submitTxt
                    }
                  >
                    Save Member
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* MEMBER LIST */}
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
              filteredMembers.map(
                (member) => (
                  <GlassCard
                    key={member.id}
                    style={
                      styles.memberCard
                    }
                  >
                    <View
                      style={
                        styles.memberTop
                      }
                    >
                      <View
                        style={{
                          flex: 1,
                        }}
                      >
                        <Text
                          style={[
                            styles.memberName,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {
                            member.studentName
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
                            member.hostel
                          }
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              member.status ===
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
                              member.status ===
                              'Active'
                                ? colors.success
                                : colors.error,
                            fontWeight:
                              '900',
                          }}
                        >
                          {
                            member.status
                          }
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.memberInfo,
                        {
                          borderTopColor:
                            colors.border,
                        },
                      ]}
                    >
                      <HeartPulse
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
                            member.planType
                          }
                        </Text>

                        <Text
                          style={{
                            color:
                              colors.textMuted,
                            fontSize: 11,
                          }}
                        >
                          Slot:{' '}
                          {
                            member.slotTime
                          }
                        </Text>

                        <Text
                          style={{
                            color:
                              colors.textMuted,
                            fontSize: 11,
                          }}
                        >
                          Locker:{' '}
                          {
                            member.locker
                          }
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.validityRow,
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
                        Membership
                      </Text>

                      <Text
                        style={{
                          color:
                            member.status ===
                            'Active'
                              ? colors.success
                              : colors.error,
                          fontWeight:
                            '900',
                        }}
                      >
                        {member.status ===
                        'Active'
                          ? `${member.daysLeft} Days`
                          : `₹${member.amount} Due`}
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
                            message: `${member.studentName} membership status is ${member.status}`,
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
                          style={{
                            color:
                              colors.text,
                            marginLeft: 6,
                            fontWeight:
                              '700',
                          }}
                        >
                          Share
                        </Text>
                      </TouchableOpacity>

                      {member.status ===
                        'Expired' && (
                        <TouchableOpacity
                          style={[
                            styles.renewBtn,
                            {
                              backgroundColor:
                                colors.primary,
                            },
                          ]}
                          onPress={() =>
                            setRenewMember(
                              member
                            )
                          }
                        >
                          <TimerReset
                            size={14}
                            color="#FFF"
                          />

                          <Text
                            style={
                              styles.renewTxt
                            }
                          >
                            Renew
                          </Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={[
                          styles.deleteBtn,
                          {
                            backgroundColor:
                              colors.error +
                              '20',
                          },
                        ]}
                        onPress={() =>
                          deleteMember(
                            member.id
                          )
                        }
                      >
                        <Trash2
                          size={15}
                          color={
                            colors.error
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </GlassCard>
                )
              )
            )}
          </>
        )}

        {/* DIETS */}
        {activeTab === 'diets' && (
          <>
            <View
              style={
                styles.headerRow
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
                  Diet Plans
                </Text>

                <Text
                  style={{
                    color:
                      colors.textMuted,
                    fontSize: 12,
                  }}
                >
                  Nutrition &
                  macros tracking
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
                  setShowDietModal(
                    !showDietModal
                  )
                }
              >
                <Plus
                  size={18}
                  color="#FFF"
                />
              </TouchableOpacity>
            </View>

            {showDietModal && (
              <GlassCard
                style={
                  styles.formCard
                }
              >
                <Text
                  style={[
                    styles.formTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Create Diet Plan
                </Text>

                {[
                  {
                    key: 'name',
                    placeholder:
                      'Student Name',
                  },
                  {
                    key: 'plan',
                    placeholder:
                      'Diet Plan',
                  },
                  {
                    key: 'protein',
                    placeholder:
                      'Protein',
                  },
                  {
                    key: 'carbs',
                    placeholder:
                      'Carbs',
                  },
                  {
                    key: 'fats',
                    placeholder:
                      'Fats',
                  },
                  {
                    key: 'goal',
                    placeholder:
                      'Goal',
                  },
                ].map((field) => (
                  <TextInput
                    key={field.key}
                    placeholder={
                      field.placeholder
                    }
                    placeholderTextColor={
                      colors.textMuted
                    }
                    value={
                      dietForm[
                        field.key as keyof typeof dietForm
                      ]
                    }
                    onChangeText={(
                      val
                    ) =>
                      setDietForm({
                        ...dietForm,
                        [field.key]:
                          val,
                      })
                    }
                    style={[
                      styles.formInput,
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
                ))}

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                  onPress={
                    addDiet
                  }
                >
                  <Text
                    style={
                      styles.submitTxt
                    }
                  >
                    Save Diet Plan
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {diets.map((diet) => (
              <GlassCard
                key={diet.id}
                style={
                  styles.dietCard
                }
              >
                <View
                  style={
                    styles.dietTop
                  }
                >
                  <View
                    style={[
                      styles.dietIcon,
                      {
                        backgroundColor:
                          colors.primary +
                          '20',
                      },
                    ]}
                  >
                    <Apple
                      size={18}
                      color={
                        colors.primary
                      }
                    />
                  </View>

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
                          '900',
                      }}
                    >
                      {
                        diet.studentName
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
                        diet.planName
                      }
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.progressBadge,
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
                        fontWeight:
                          '900',
                        fontSize: 10,
                      }}
                    >
                      {
                        diet.progress
                      }
                      %
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.macroGrid
                  }
                >
                  {[
                    {
                      label:
                        'Protein',
                      value: `${diet.protein}g`,
                      icon: Trophy,
                    },
                    {
                      label:
                        'Carbs',
                      value: `${diet.carbs}g`,
                      icon: Flame,
                    },
                    {
                      label:
                        'Fats',
                      value: `${diet.fats}g`,
                      icon: Apple,
                    },
                  ].map(
                    (
                      item,
                      index
                    ) => {
                      const Icon =
                        item.icon;

                      return (
                        <View
                          key={
                            index
                          }
                          style={[
                            styles.macroBox,
                            {
                              backgroundColor:
                                colors.surface,
                            },
                          ]}
                        >
                          <Icon
                            size={
                              14
                            }
                            color={
                              colors.primary
                            }
                          />

                          <Text
                            style={{
                              color:
                                colors.textMuted,
                              fontSize: 10,
                              marginTop: 6,
                            }}
                          >
                            {
                              item.label
                            }
                          </Text>

                          <Text
                            style={{
                              color:
                                colors.text,
                              fontWeight:
                                '900',
                              marginTop: 2,
                            }}
                          >
                            {
                              item.value
                            }
                          </Text>
                        </View>
                      );
                    }
                  )}
                </View>
              </GlassCard>
            ))}
          </>
        )}

        {/* SLOTS */}
        {activeTab === 'slots' && (
          <>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  marginBottom: 16,
                },
              ]}
            >
              Workout Slots
            </Text>

            {[
              {
                id: '1',
                name: 'Morning Batch',
                time: '6AM - 8AM',
                occupancy:
                  '18 Members',
              },
              {
                id: '2',
                name: 'Evening Batch',
                time: '5PM - 8PM',
                occupancy:
                  '32 Members',
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
                    styles.slotTop
                  }
                >
                  <Clock
                    size={18}
                    color={
                      colors.primary
                    }
                  />

                  <View
                    style={{
                      marginLeft: 12,
                      flex: 1,
                    }}
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
                        slot.name
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
                        slot.time
                      }
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.slotBadge,
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
                        fontSize: 10,
                      }}
                    >
                      {
                        slot.occupancy
                      }
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.slotActionBtn,
                    {
                      backgroundColor:
                        colors.success,
                    },
                  ]}
                >
                  <CheckCircle2
                    size={14}
                    color="#FFF"
                  />

                  <Text
                    style={
                      styles.slotActionTxt
                    }
                  >
                    Mark Attendance
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
            id: 'members',
            label: 'Members',
            icon: Activity,
          },
          {
            id: 'diets',
            label: 'Diets',
            icon: Apple,
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
                  tab.id as any
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
                  fontWeight: '800',
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* RENEW MODAL */}
      {renewMember && (
        <View
          style={
            styles.renewOverlay
          }
        >
          <GlassCard
            style={
              styles.renewCard
            }
          >
            <View
              style={
                styles.renewHeader
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
                Renew Membership
              </Text>
            </View>

            <Text
              style={{
                color:
                  colors.textMuted,
                marginBottom: 12,
              }}
            >
              {
                renewMember.studentName
              }
            </Text>

            <TextInput
              value={
                renewAmount
              }
              onChangeText={
                setRenewAmount
              }
              keyboardType="numeric"
              style={[
                styles.formInput,
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
                    colors.primary,
                },
              ]}
              onPress={
                renewSubscription
              }
            >
              <Text
                style={
                  styles.submitTxt
                }
              >
                Confirm Renewal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                marginTop: 12,
                alignItems:
                  'center',
              }}
              onPress={() =>
                setRenewMember(
                  null
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
                Cancel
              </Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      )}
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

  hudTop: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  hudMini: {
    color:
      'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '800',
  },

  hudAmount: {
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

  statsRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
  },

  statsValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },

  statsLabel: {
    color:
      'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2,
  },

  headerRow: {
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

  addBtn: {
    width: 44,
    height: 44,
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
    marginBottom: 16,
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

  submitBtn: {
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  submitTxt: {
    color: '#FFF',
    fontWeight: '900',
  },

  memberCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  memberTop: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  memberName: {
    fontSize: 15,
    fontWeight: '900',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },

  memberInfo: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
    flexDirection: 'row',
  },

  validityRow: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent:
      'space-between',
  },

  actionRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },

  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 10,
    height: 38,
  },

  renewBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },

  renewTxt: {
    color: '#FFF',
    fontWeight: '900',
  },

  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dietCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  dietTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dietIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  progressBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },

  macroGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  macroBox: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },

  slotCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  slotTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  slotBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },

  slotActionBtn: {
    marginTop: 14,
    height: 40,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },

  slotActionTxt: {
    color: '#FFF',
    fontWeight: '900',
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

  renewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 20,
  },

  renewCard: {
    padding: 20,
    borderRadius: 24,
  },

  renewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
});