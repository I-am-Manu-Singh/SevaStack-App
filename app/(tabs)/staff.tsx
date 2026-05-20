
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Activity,
  Bell,
  Calendar,
  Clock,
  MessageSquare,
  MoreVertical,
  Phone,
  Search,
  User,
  Plus,
  UserCheck,
  UserX,
  Users,
  X,
} from 'lucide-react-native';

import { Tabs, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/GlassCard';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/AppContext';

// ======================================================
// SCREEN
// ======================================================

export default function StaffScreen() {
  const {
    colors,
    theme,
    profile,
    userRole,
  } = useApp();

  const router = useRouter();

  const [staff, setStaff] = useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState('');

  // ======================================================
  // CUSTOMER LOCK
  // ======================================================

  if (userRole === 'customer') {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <CenteredLockView
          colors={colors}
        />
      </SafeAreaView>
    );
  }

  // ======================================================
  // FETCH
  // ======================================================

  const fetchStaff = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const { data, error } =
        await supabase
          .from('staff')
          .select('*')
          .eq(
            'merchant_id',
            profile.id
          )
          .order('created_at', {
            ascending: false,
          });

      if (error) throw error;

      setStaff(data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStaff();
  };

  // ======================================================
  // METRICS
  // ======================================================

  const activeCount = useMemo(
    () =>
      staff.filter(
        (s) =>
          s.status === 'Active'
      ).length,
    [staff]
  );

  const coverage = useMemo(() => {
    if (!staff.length) return 0;

    return Math.round(
      (activeCount /
        staff.length) *
        100
    );
  }, [staff, activeCount]);

  // ======================================================
  // FILTER
  // ======================================================

  const filteredStaff = useMemo(() => {
    return staff.filter(
      (m) =>
        m.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        m.role
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );
  }, [staff, search]);

  // ======================================================
  // TOGGLE STATUS
  // ======================================================

  const toggleStaffStatus =
    async (
      id: string,
      currentStatus: string
    ) => {
      const newStatus =
        currentStatus ===
        'Active'
          ? 'Off-Duty'
          : 'Active';

      setStaff((prev) =>
        prev.map((member) =>
          member.id === id
            ? {
                ...member,
                status:
                  newStatus,
              }
            : member
        )
      );

      try {
        await supabase
          .from('staff')
          .update({
            status:
              newStatus,
          })
          .eq('id', id);
      } catch {
        fetchStaff();
      }
    };

  // ======================================================
  // MAIN
  // ======================================================

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            colors.background,
        },
      ]}
      edges={['left', 'right']}
    >
      <StatusBar
        style={
          theme === 'dark'
            ? 'light'
            : 'dark'
        }
      />

      <Tabs.Screen
        options={{
          title:
            'Staff Management',
          headerStyle: {
            backgroundColor:
              colors.background,
          },
          headerTitleStyle: {
            color: colors.text,
            fontWeight: '900',
          },
          headerTintColor:
            colors.primary,

          headerRight: () => (
            <View
              style={
                styles.headerActions
              }
            >
              <HeaderButton
                colors={colors}
                badge
                icon={
                  <Bell
                    size={18}
                    color={
                      colors.text
                    }
                  />
                }
                onPress={() =>
                  router.push(
                    '/notifications'
                  )
                }
              />

              <HeaderButton
                colors={colors}
                icon={
                  <User
                    size={18}
                    color={
                      colors.text
                    }
                  />
                }
                onPress={() =>
                  router.push(
                    '/profile' as any
                  )
                }
              />
            </View>
          ),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
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
        {/* ================================================= */}
        {/* SUMMARY */}
        {/* ================================================= */}

        {/* ============================================ */}
{/* SUMMARY */}
{/* ============================================ */}

<GlassCard
  style={[
    styles.summaryCard,
    {
      borderColor: colors.border,
    },
  ]}
>
  <View style={styles.summaryRow}>
    
    <View style={styles.summaryItem}>
      <SummaryMetric
        colors={colors}
        icon={Clock}
        value={activeCount}
        label="On Duty"
        iconColor={colors.primary}
        bg={`${colors.primary}12`}
      />
    </View>

    <View
      style={[
        styles.metricDivider,
        {
          backgroundColor: colors.border,
        },
      ]}
    />

    <View style={styles.summaryItem}>
      <SummaryMetric
        colors={colors}
        icon={Activity}
        value={`${coverage}%`}
        label="Coverage"
        iconColor={colors.success}
        bg={`${colors.success}12`}
      />
    </View>

    <View
      style={[
        styles.metricDivider,
        {
          backgroundColor: colors.border,
        },
      ]}
    />

    <View style={styles.summaryItem}>
      <SummaryMetric
        colors={colors}
        icon={UserCheck}
        value={staff.length}
        label="Total"
        iconColor={colors.accent}
        bg={`${colors.accent}12`}
      />
    </View>

  </View>
</GlassCard>

        {/* ================================================= */}
        {/* SEARCH */}
        {/* ================================================= */}

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
              placeholder="Search staff..."
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

            {search ? (
              <TouchableOpacity
                onPress={() =>
                  setSearch('')
                }
              >
                <X
                  size={18}
                  color={
                    colors.textMuted
                  }
                />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.calendarBtn,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <Calendar
              size={18}
              color={
                colors.text
              }
            />
          </TouchableOpacity>
        </View>

        {/* ================================================= */}
        {/* STAFF */}
        {/* ================================================= */}

        {loading ? (
          <>
            {[1, 2, 3].map(
              (item) => (
                <SkeletonCard
                  key={item}
                  colors={
                    colors
                  }
                />
              )
            )}
          </>
        ) : filteredStaff.length ===
          0 ? (
          <EmptyState
            colors={colors}
          />
        ) : (
          filteredStaff.map(
            (member) => {
              const active =
                member.status ===
                'Active';

              return (
                <GlassCard
                  key={
                    member.id
                  }
                  style={[
                    styles.staffCard,
                    {
                      borderColor:
                        colors.border,
                    },
                  ]}
                >
                  {/* TOP */}

                  <View
                    style={
                      styles.staffTop
                    }
                  >
                    <View
                      style={
                        styles.staffLeft
                      }
                    >
                      <View
                        style={
                          styles.avatarWrap
                        }
                      >
                        <View
                          style={[
                            styles.avatarBorder,
                            {
                              borderColor:
                                active
                                  ? '#10B981'
                                  : '#EF4444',
                            },
                          ]}
                        >
                          {member.avatar_url ? (
                            <Image
                              source={{
                                uri: member.avatar_url,
                              }}
                              style={
                                styles.avatar
                              }
                            />
                          ) : (
                            <Text
                              style={[
                                styles.avatarText,
                                {
                                  color:
                                    colors.textMuted,
                                },
                              ]}
                            >
                              {member.name
                                ?.charAt(
                                  0
                                )
                                ?.toUpperCase()}
                            </Text>
                          )}
                        </View>

                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor:
                                active
                                  ? '#10B981'
                                  : '#EF4444',
                              borderColor:
                                colors.surface,
                            },
                          ]}
                        />
                      </View>

                      <View
                        style={{
                          flex: 1,
                        }}
                      >
                        <Text
                          style={[
                            styles.staffName,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {
                            member.name
                          }
                        </Text>

                        <Text
                          style={[
                            styles.staffRole,
                            {
                              color:
                                colors.textMuted,
                            },
                          ]}
                        >
                          {
                            member.role
                          }
                        </Text>

                        <View
                          style={[
                            styles.inlineStatus,
                            {
                              backgroundColor:
                                active
                                  ? 'rgba(16,185,129,0.12)'
                                  : 'rgba(239,68,68,0.12)',
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color:
                                active
                                  ? '#10B981'
                                  : '#EF4444',
                              fontSize: 10,
                              fontWeight:
                                '800',
                            }}
                          >
                            {active
                              ? 'ON DUTY'
                              : 'OFF DUTY'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity>
                      <MoreVertical
                        size={18}
                        color={
                          colors.textMuted
                        }
                      />
                    </TouchableOpacity>
                  </View>

                  {/* ACTIONS */}

                  <View
                    style={
                      styles.bottomRow
                    }
                  >
                    <View
                      style={
                        styles.actionGroup
                      }
                    >
                      <MiniAction
                        icon={Phone}
                        bg={`${colors.primary}12`}
                        color={
                          colors.primary
                        }
                      />

                      <MiniAction
                        icon={
                          MessageSquare
                        }
                        bg={`${colors.accent}12`}
                        color={
                          colors.accent
                        }
                      />
                    </View>

                    <TouchableOpacity
                      activeOpacity={
                        0.85
                      }
                      onPress={() =>
                        toggleStaffStatus(
                          member.id,
                          member.status
                        )
                      }
                      style={[
                        styles.statusBtn,
                        {
                          backgroundColor:
                            active
                              ? 'rgba(239,68,68,0.12)'
                              : 'rgba(16,185,129,0.12)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          {
                            color:
                              active
                                ? '#EF4444'
                                : '#10B981',
                          },
                        ]}
                      >
                        {active
                          ? 'Mark Off-Duty'
                          : 'Mark Active'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              );
            }
          )
        )}

        <View
          style={{
            height: 80,
          }}
        />
         
      </ScrollView>
    {/* ============================================ */}
{/* FAB */}
{/* ============================================ */}

<TouchableOpacity
  activeOpacity={0.85}
  style={[
    styles.fab,
    {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
    },
  ]}
  onPress={() => {
    Alert.alert(
      'Add Staff',
      'Connect your Add Staff modal or navigation here.'
    );
  }}
>
  <Plus size={24} color="#FFF" />
</TouchableOpacity>
    </SafeAreaView>
  );
}

// ======================================================
// SUMMARY METRIC
// ======================================================

function SummaryMetric({
  icon: Icon,
  value,
  label,
  bg,
  iconColor,
  colors,
}: any) {
  return (
    <View
      style={
        styles.metricWrap
      }
    >
      <View
        style={[
          styles.metricIcon,
          {
            backgroundColor:
              bg,
          },
        ]}
      >
        <Icon
          size={18}
          color={iconColor}
        />
      </View>

      <Text
        style={[
          styles.metricValue,
          {
            color:
              colors.text,
          },
        ]}
      >
        {value}
      </Text>

      <Text
        style={[
          styles.metricLabel,
          {
            color:
              colors.textMuted,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// ======================================================
// HEADER BTN
// ======================================================

function HeaderButton({
  icon,
  colors,
  badge,
  onPress,
}: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.headerBtn,
        {
          backgroundColor:
            colors.surface,
          borderColor:
            colors.border,
        },
      ]}
    >
      {icon}

      {badge && (
        <View
          style={
            styles.notificationDot
          }
        />
      )}
    </TouchableOpacity>
  );
}

// ======================================================
// MINI ACTION
// ======================================================

function MiniAction({
  icon: Icon,
  bg,
  color,
}: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      style={[
        styles.miniAction,
        {
          backgroundColor:
            bg,
        },
      ]}
    >
      <Icon
        size={14}
        color={color}
      />
    </TouchableOpacity>
  );
}

// ======================================================
// EMPTY
// ======================================================

function EmptyState({
  colors,
}: any) {
  return (
    <View
      style={
        styles.emptyWrap
      }
    >
      <View
        style={[
          styles.emptyIconWrap,
          {
            backgroundColor:
              `${colors.primary}12`,
          },
        ]}
      >
        <UserX
          size={34}
          color={
            colors.primary
          }
        />
      </View>

      <Text
        style={[
          styles.emptyTitle,
          {
            color:
              colors.text,
          },
        ]}
      >
        No Staff Found
      </Text>

      <Text
        style={[
          styles.emptySub,
          {
            color:
              colors.textMuted,
          },
        ]}
      >
        Add employees to manage
        schedules and operational
        coverage.
      </Text>
    </View>
  );
}

// ======================================================
// LOCK VIEW
// ======================================================

function CenteredLockView({
  colors,
}: any) {
  return (
    <View
      style={
        styles.restrictedWrap
      }
    >
      <View
        style={[
          styles.restrictedIcon,
          {
            backgroundColor:
              `${colors.primary}14`,
          },
        ]}
      >
        <Users
          size={38}
          color={
            colors.primary
          }
        />
      </View>

      <Text
        style={[
          styles.restrictedTitle,
          {
            color:
              colors.text,
          },
        ]}
      >
        Merchant Staff Directory
      </Text>

      <Text
        style={[
          styles.restrictedSub,
          {
            color:
              colors.textMuted,
          },
        ]}
      >
        Staff management tools are
        only available for merchant
        accounts.
      </Text>
    </View>
  );
}

// ======================================================
// SKELETON
// ======================================================

function SkeletonCard({
  colors,
}: any) {
  return (
    <GlassCard
      style={[
        styles.staffCard,
        {
          borderColor:
            colors.border,
          opacity: 0.35,
        },
      ]}
    >
      <View
        style={
          styles.skeletonRow
        }
      >
        <View
          style={[
            styles.skeletonAvatar,
            {
              backgroundColor:
                colors.border,
            },
          ]}
        />

        <View
          style={{
            flex: 1,
          }}
        >
          <View
            style={[
              styles.skeletonLine,
              {
                width: '60%',
                backgroundColor:
                  colors.border,
              },
            ]}
          />

          <View
            style={[
              styles.skeletonLine,
              {
                width: '40%',
                marginTop: 10,
                backgroundColor:
                  colors.border,
              },
            ]}
          />
        </View>
      </View>
    </GlassCard>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 30,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 14,
  },

  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  notificationDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    top: 8,
    right: 8,
  },
summaryCard: {
  borderRadius: 26,
  borderWidth: 1,
  paddingVertical: 18,
  paddingHorizontal: 10,
  marginBottom: 20,
},
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

summaryItem: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
},

metricWrap: {
  width: '100%',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
},

metricDivider: {
  width: 1,
  height: 54,
  opacity: 0.15,
},

  metricIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  metricValue: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },

  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },


  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  searchBar: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },

  calendarBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  staffCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },

  staffTop: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  staffLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  avatarWrap: {
    marginRight: 14,
    position: 'relative',
  },
fab: {
  position: 'absolute',
  right: 15,
  bottom: 85,
  width: 58,
  height: 58,
  borderRadius: 30,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 8,
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.28,
  shadowRadius: 8,
},
  avatarBorder: {
    width: 60,
    height: 60,
    borderRadius: 20,
    borderWidth: 2.5,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatar: {
    width: '100%',
    height: '100%',
  },

  avatarText: {
    fontSize: 22,
    fontWeight: '900',
  },

  statusDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 10,
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },

  staffName: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },

  staffRole: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },

  inlineStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  actionGroup: {
    flexDirection: 'row',
    gap: 8,
  },

  miniAction: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statusBtn: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statusBtnText: {
    fontSize: 11,
    fontWeight: '900',
  },

  restrictedWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  restrictedIcon: {
    width: 84,
    height: 84,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },

  restrictedTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
  },

  restrictedSub: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '600',
  },

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },

  emptyIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
  },

  emptySub: {
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 280,
    fontWeight: '600',
  },

  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  skeletonAvatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    marginRight: 14,
  },

  skeletonLine: {
    height: 14,
    borderRadius: 8,
  },
});