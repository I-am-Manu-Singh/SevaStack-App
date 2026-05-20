// HostelManagerScreen.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';

import {
  Building,
  Users,
  CreditCard,
  AlertTriangle,
  Plus,
  Home,
  CheckCircle,
  Key,
  Shield,
  Lock,
  ArrowUpRight,
  Search,
  Phone,
  Trash2,
  UserPlus,
  Clock3,
} from 'lucide-react-native';

import { Spacing } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { CustomerBusinessView } from '@/components/CustomerBusinessView';

interface Resident {
  id: string;
  name: string;
  room: string;
  due: number;
  status: 'Paid' | 'Overdue' | 'Vacating';
  image: string;
  college: string;
  phone?: string;
}

interface GatePass {
  id: string;
  studentName: string;
  room: string;
  reason: string;
  outTime: string;
  status: 'Pending' | 'Approved' | 'Returned';
}

export default function HostelManagerScreen() {
  const { userRole, businessType } = useApp();

  if (userRole === 'customer' || businessType !== 'Hostel') {
    return <CustomerBusinessView type="Hostel" />;
  }

  return <HostelManagerMerchant />;
}

function HostelManagerMerchant() {
  const { colors, theme, profile } = useApp();

  const [activeTab, setActiveTab] = useState<
    'residents' | 'gatepass' | 'maintenance'
  >('residents');

  const [residents, setResidents] = useState<Resident[]>([]);
  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [residentFilter, setResidentFilter] = useState<
    'All' | 'Paid' | 'Overdue'
  >('All');

  const [showAddResident, setShowAddResident] = useState(false);

  const [newResident, setNewResident] = useState({
    name: '',
    room: '',
    due: '',
    college: '',
    phone: '',
  });

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const [residentRes, passRes] = await Promise.all([
        supabase
          .from('hostel_residents')
          .select('*')
          .eq('merchant_id', profile.id)
          .order('created_at', { ascending: false }),

        supabase
          .from('hostel_gate_passes')
          .select(
            `
            *,
            resident:hostel_residents(
              student_name,
              room_number
            )
          `
          )
          .eq('merchant_id', profile.id)
          .order('created_at', { ascending: false }),
      ]);

      const mappedResidents =
        residentRes.data?.map((r: any) => ({
          id: r.id,
          name: r.student_name,
          room: r.room_number,
          due: Number(r.rent_due || 0),
          status: r.status,
          image:
            r.avatar_url ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
          college: r.college_affiliation,
          phone: r.phone_number || '',
        })) || [];

      const mappedPasses =
        passRes.data?.map((p: any) => ({
          id: p.id,
          studentName:
            p.resident?.student_name || 'Resident',
          room: p.resident?.room_number || 'N/A',
          reason: p.reason,
          outTime: p.out_time,
          status: p.status,
        })) || [];

      setResidents(mappedResidents);
      setGatePasses(mappedPasses);
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

  const totalCapacity = 45;
  const occupiedRooms = residents.length;

  const occupancyPercent =
    (occupiedRooms / totalCapacity) * 100;

  const totalPendingRent = residents.reduce(
    (sum, item) => sum + item.due,
    0
  );

  const overdueCount = residents.filter(
    (r) => r.status === 'Overdue'
  ).length;

  const filteredResidents = useMemo(() => {
    return residents.filter((resident) => {
      const matchesSearch =
        resident.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        resident.room
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        residentFilter === 'All' ||
        resident.status === residentFilter;

      return matchesSearch && matchesFilter;
    });
  }, [residents, search, residentFilter]);

  const addResident = async () => {
    if (!newResident.name || !newResident.room) {
      Alert.alert(
        'Missing Info',
        'Student name and room required.'
      );
      return;
    }

    try {
      const dueAmount =
        parseFloat(newResident.due) || 0;

      const { error } = await supabase
        .from('hostel_residents')
        .insert([
          {
            merchant_id: profile?.id,
            student_name: newResident.name,
            room_number: newResident.room,
            rent_due: dueAmount,
            college_affiliation:
              newResident.college || 'Unknown',
            phone_number: newResident.phone,
            status:
              dueAmount > 0 ? 'Overdue' : 'Paid',
            avatar_url:
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
          },
        ]);

      if (error) throw error;

      Alert.alert(
        'Resident Added',
        `${newResident.name} added successfully`
      );

      setNewResident({
        name: '',
        room: '',
        due: '',
        college: '',
        phone: '',
      });

      setShowAddResident(false);

      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const settleRent = async (
    residentId: string
  ) => {
    try {
      const { error } = await supabase
        .from('hostel_residents')
        .update({
          rent_due: 0,
          status: 'Paid',
        })
        .eq('id', residentId);

      if (error) throw error;

      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const deleteResident = async (
    residentId: string
  ) => {
    Alert.alert(
      'Delete Resident',
      'Remove resident permanently?',
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
              const { error } = await supabase
                .from('hostel_residents')
                .delete()
                .eq('id', residentId);

              if (error) throw error;

              fetchData();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  const updateGatePass = async (
    passId: string,
    status: 'Approved' | 'Returned'
  ) => {
    try {
      const { error } = await supabase
        .from('hostel_gate_passes')
        .update({ status })
        .eq('id', passId);

      if (error) throw error;

      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <StatusBar
        style={theme === 'dark' ? 'light' : 'dark'}
      />

      <Stack.Screen
        options={{
          title: 'Hostel Manager',
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* TOP HUD */}
        <GlassCard style={styles.hudCard}>
          <View style={styles.hudTop}>
            <View>
              <Text style={styles.hudMini}>
                TOTAL PENDING RENT
              </Text>

              <Text style={styles.hudAmount}>
                ₹{totalPendingRent}
              </Text>
            </View>

            <Building size={30} color="#FFF" />
          </View>

          <View style={styles.hudDivider} />

          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statsValue}>
                {occupiedRooms}/{totalCapacity}
              </Text>
              <Text style={styles.statsLabel}>
                Occupied
              </Text>
            </View>

            <View>
              <Text style={styles.statsValue}>
                {overdueCount}
              </Text>
              <Text style={styles.statsLabel}>
                Overdue
              </Text>
            </View>

            <View>
              <Text style={styles.statsValue}>
                {Math.round(occupancyPercent)}%
              </Text>
              <Text style={styles.statsLabel}>
                Capacity
              </Text>
            </View>
          </View>

          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${occupancyPercent}%`,
                },
              ]}
            />
          </View>
        </GlassCard>

        {/* RESIDENTS */}
        {activeTab === 'residents' && (
          <>
            <View style={styles.headerRow}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text },
                ]}
              >
                Residents
              </Text>

              <TouchableOpacity
                style={[
                  styles.addBtn,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
                onPress={() =>
                  setShowAddResident(
                    !showAddResident
                  )
                }
              >
                <UserPlus
                  size={14}
                  color="#FFF"
                />

                <Text style={styles.addBtnTxt}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>

            {/* SEARCH */}
            <View
              style={[
                styles.searchBox,
                {
                  borderColor: colors.border,
                  backgroundColor:
                    colors.surface,
                },
              ]}
            >
              <Search
                size={16}
                color={colors.textMuted}
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search resident..."
                placeholderTextColor={
                  colors.textMuted
                }
                style={[
                  styles.searchInput,
                  { color: colors.text },
                ]}
              />
            </View>

            {/* FILTERS */}
            <View style={styles.filterRow}>
              {['All', 'Paid', 'Overdue'].map(
                (item) => {
                  const active =
                    residentFilter === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.filterChip,
                        {
                          borderColor:
                            colors.border,
                          backgroundColor:
                            active
                              ? colors.primary +
                                '20'
                              : colors.surface,
                        },
                      ]}
                      onPress={() =>
                        setResidentFilter(
                          item as any
                        )
                      }
                    >
                      <Text
                        style={{
                          color: active
                            ? colors.primary
                            : colors.textMuted,
                          fontWeight: '700',
                        }}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>

            {/* ADD FORM */}
            {showAddResident && (
              <GlassCard style={styles.formCard}>
                <Text
                  style={[
                    styles.formTitle,
                    { color: colors.text },
                  ]}
                >
                  Register Resident
                </Text>

                {[
                  {
                    key: 'name',
                    placeholder:
                      'Student Name',
                  },
                  {
                    key: 'room',
                    placeholder: 'Room No',
                  },
                  {
                    key: 'phone',
                    placeholder:
                      'Phone Number',
                  },
                  {
                    key: 'college',
                    placeholder:
                      'College / Coaching',
                  },
                  {
                    key: 'due',
                    placeholder:
                      'Pending Rent',
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
                      newResident[
                        field.key as keyof typeof newResident
                      ]
                    }
                    onChangeText={(val) =>
                      setNewResident({
                        ...newResident,
                        [field.key]: val,
                      })
                    }
                    style={[
                      styles.formInput,
                      {
                        color: colors.text,
                        borderColor:
                          colors.border,
                        backgroundColor:
                          colors.surfaceLight,
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
                  onPress={addResident}
                >
                  <Text style={styles.submitTxt}>
                    Save Resident
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {loading ? (
              <ActivityIndicator
                color={colors.primary}
                size="large"
                style={{ marginTop: 40 }}
              />
            ) : (
              filteredResidents.map(
                (resident) => (
                  <GlassCard
                    key={resident.id}
                    style={styles.residentCard}
                  >
                    <View
                      style={
                        styles.residentTop
                      }
                    >
                      <Image
                        source={{
                          uri: resident.image,
                        }}
                        style={
                          styles.avatar
                        }
                      />

                      <View
                        style={{
                          flex: 1,
                        }}
                      >
                        <Text
                          style={[
                            styles.name,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {resident.name}
                        </Text>

                        <Text
                          style={{
                            color:
                              colors.textMuted,
                            fontSize: 11,
                          }}
                        >
                          {
                            resident.college
                          }
                        </Text>

                        <View
                          style={[
                            styles.roomBadge,
                            {
                              backgroundColor:
                                colors.surface,
                            },
                          ]}
                        >
                          <Key
                            size={10}
                            color={
                              colors.primary
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
                            Room{' '}
                            {
                              resident.room
                            }
                          </Text>
                        </View>
                      </View>

                      <View
                        style={{
                          alignItems:
                            'flex-end',
                        }}
                      >
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                resident.status ===
                                'Paid'
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
                                resident.status ===
                                'Paid'
                                  ? colors.success
                                  : colors.error,
                              fontWeight:
                                '900',
                              fontSize: 9,
                            }}
                          >
                            {
                              resident.status
                            }
                          </Text>
                        </View>

                        {resident.due >
                          0 && (
                          <Text
                            style={{
                              marginTop: 6,
                              fontWeight:
                                '900',
                              color:
                                colors.text,
                            }}
                          >
                            ₹
                            {
                              resident.due
                            }
                          </Text>
                        )}
                      </View>
                    </View>

                    <View
                      style={
                        styles.actionRow
                      }
                    >
                      {resident.phone ? (
                        <View
                          style={[
                            styles.phoneBadge,
                            {
                              backgroundColor:
                                colors.surface,
                            },
                          ]}
                        >
                          <Phone
                            size={12}
                            color={
                              colors.primary
                            }
                          />

                          <Text
                            style={{
                              color:
                                colors.text,
                              fontSize: 10,
                            }}
                          >
                            {
                              resident.phone
                            }
                          </Text>
                        </View>
                      ) : null}

                      <View
                        style={{
                          flexDirection:
                            'row',
                          gap: 8,
                        }}
                      >
                        {resident.due >
                          0 && (
                          <TouchableOpacity
                            style={[
                              styles.payBtn,
                              {
                                backgroundColor:
                                  colors.primary,
                              },
                            ]}
                            onPress={() =>
                              settleRent(
                                resident.id
                              )
                            }
                          >
                            <CreditCard
                              size={13}
                              color="#FFF"
                            />

                            <Text
                              style={
                                styles.payBtnTxt
                              }
                            >
                              Settle
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
                            deleteResident(
                              resident.id
                            )
                          }
                        >
                          <Trash2
                            size={14}
                            color={
                              colors.error
                            }
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </GlassCard>
                )
              )
            )}
          </>
        )}

        {/* GATE PASS */}
        {activeTab === 'gatepass' && (
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
              Gate Pass Monitor
            </Text>

            {gatePasses.map((pass) => (
              <GlassCard
                key={pass.id}
                style={styles.passCard}
              >
                <View
                  style={styles.passTop}
                >
                  <View>
                    <Text
                      style={{
                        color: colors.text,
                        fontWeight: '800',
                      }}
                    >
                      {
                        pass.studentName
                      }
                    </Text>

                    <Text
                      style={{
                        color:
                          colors.textMuted,
                        fontSize: 11,
                      }}
                    >
                      Room {pass.room}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.passStatus,
                      {
                        backgroundColor:
                          pass.status ===
                          'Approved'
                            ? colors.success +
                              '20'
                            : pass.status ===
                              'Returned'
                            ? colors.primary +
                              '20'
                            : '#F59E0B20',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          pass.status ===
                          'Approved'
                            ? colors.success
                            : pass.status ===
                              'Returned'
                            ? colors.primary
                            : '#F59E0B',
                        fontWeight:
                          '900',
                        fontSize: 9,
                      }}
                    >
                      {pass.status}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.reasonBox,
                    {
                      backgroundColor:
                        colors.surface,
                    },
                  ]}
                >
                  <Clock3
                    size={14}
                    color={
                      colors.primary
                    }
                  />

                  <Text
                    style={{
                      color:
                        colors.text,
                      flex: 1,
                      fontSize: 12,
                    }}
                  >
                    {pass.reason}
                  </Text>
                </View>

                <Text
                  style={{
                    marginTop: 8,
                    color:
                      colors.textMuted,
                    fontSize: 11,
                  }}
                >
                  Out Time: {pass.outTime}
                </Text>

                {pass.status ===
                  'Pending' && (
                  <TouchableOpacity
                    style={[
                      styles.approveBtn,
                      {
                        backgroundColor:
                          colors.success,
                      },
                    ]}
                    onPress={() =>
                      updateGatePass(
                        pass.id,
                        'Approved'
                      )
                    }
                  >
                    <CheckCircle
                      size={14}
                      color="#FFF"
                    />

                    <Text
                      style={
                        styles.approveTxt
                      }
                    >
                      Approve Pass
                    </Text>
                  </TouchableOpacity>
                )}

                {pass.status ===
                  'Approved' && (
                  <TouchableOpacity
                    style={[
                      styles.returnBtn,
                      {
                        backgroundColor:
                          colors.primary,
                      },
                    ]}
                    onPress={() =>
                      updateGatePass(
                        pass.id,
                        'Returned'
                      )
                    }
                  >
                    <ArrowUpRight
                      size={14}
                      color="#FFF"
                    />

                    <Text
                      style={
                        styles.approveTxt
                      }
                    >
                      Mark Returned
                    </Text>
                  </TouchableOpacity>
                )}
              </GlassCard>
            ))}
          </>
        )}

        {/* MAINTENANCE */}
        {activeTab === 'maintenance' && (
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
              Hostel Maintenance
            </Text>

            {[
              {
                icon: Home,
                title: 'WiFi Network',
                desc: 'All routers stable',
                status: 'WORKING',
                type: 'success',
              },
              {
                icon: AlertTriangle,
                title: 'Water Filter',
                desc: '2nd floor service due',
                status: 'CHECK',
                type: 'warning',
              },
              {
                icon: Lock,
                title: 'Biometric Gate',
                desc: 'Fingerprint sync offline',
                status: 'ERROR',
                type: 'error',
              },
            ].map((item, idx) => {
              const Icon = item.icon;

              return (
                <GlassCard
                  key={idx}
                  style={
                    styles.maintenanceCard
                  }
                >
                  <View
                    style={
                      styles.maintenanceRow
                    }
                  >
                    <View
                      style={[
                        styles.maintenanceIcon,
                        {
                          backgroundColor:
                            item.type ===
                            'success'
                              ? colors.success +
                                '20'
                              : item.type ===
                                'warning'
                              ? '#F59E0B20'
                              : colors.error +
                                '20',
                        },
                      ]}
                    >
                      <Icon
                        size={20}
                        color={
                          item.type ===
                          'success'
                            ? colors.success
                            : item.type ===
                              'warning'
                            ? '#F59E0B'
                            : colors.error
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
                            '800',
                        }}
                      >
                        {item.title}
                      </Text>

                      <Text
                        style={{
                          color:
                            colors.textMuted,
                          fontSize: 11,
                        }}
                      >
                        {item.desc}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor:
                            item.type ===
                            'success'
                              ? colors.success +
                                '20'
                              : item.type ===
                                'warning'
                              ? '#F59E0B20'
                              : colors.error +
                                '20',
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 9,
                          fontWeight:
                            '900',
                          color:
                            item.type ===
                            'success'
                              ? colors.success
                              : item.type ===
                                'warning'
                              ? '#F59E0B'
                              : colors.error,
                        }}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              );
            })}
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* BOTTOM NAV */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor:
              colors.surface + 'E8',
            borderColor: colors.border,
          },
        ]}
      >
        {[
          {
            id: 'residents',
            label: 'Residents',
            icon: Users,
          },
          {
            id: 'gatepass',
            label: 'Gate Pass',
            icon: Key,
          },
          {
            id: 'maintenance',
            label: 'Maintenance',
            icon: Shield,
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
    backgroundColor: '#6366F1',
  },

  hudTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  hudMini: {
    color: 'rgba(255,255,255,0.7)',
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 16,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statsValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },

  statsLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2,
  },

  progressBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    marginTop: 14,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 10,
  },

  addBtnTxt: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 11,
  },

  searchBox: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 12,
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

  formTitle: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 12,
  },

  formInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 10,
  },

  submitBtn: {
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },

  submitTxt: {
    color: '#FFF',
    fontWeight: '900',
  },

  residentCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  residentTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginRight: 12,
  },

  name: {
    fontSize: 15,
    fontWeight: '900',
  },

  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  actionRow: {
    marginTop: 14,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 10,
  },

  payBtnTxt: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 11,
  },

  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  passCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  passTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  passStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  reasonBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },

  approveBtn: {
    marginTop: 14,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  returnBtn: {
    marginTop: 14,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  approveTxt: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 12,
  },

  maintenanceCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  maintenanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  maintenanceIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
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
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
});