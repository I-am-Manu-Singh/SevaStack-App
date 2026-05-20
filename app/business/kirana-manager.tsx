// KiranaManagerScreen.tsx

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
  RefreshControl,
  Share,
  ActivityIndicator,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';

import {
  ShoppingBag,
  Plus,
  Search,
  Share2,
  UserPlus,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
  ShieldAlert,
  CheckCircle2,
  Clock3,
  QrCode,
  Wallet,
  TrendingUp,
  PackageSearch,
  AlertTriangle,
  Trash2,
  Receipt,
} from 'lucide-react-native';

import { Spacing } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { CustomerBusinessView } from '@/components/CustomerBusinessView';

export default function KiranaManagerScreen() {
  const { userRole, businessType } =
    useApp();

  if (
    userRole === 'customer' ||
    businessType !== 'Kirana'
  ) {
    return (
      <CustomerBusinessView type="Kirana" />
    );
  }

  return <KiranaMerchantScreen />;
}

function KiranaMerchantScreen() {
  const { colors, profile } = useApp();

  const [activeTab, setActiveTab] =
    useState<
      'khata' | 'inventory' | 'expiry'
    >('khata');

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [khataFilter, setKhataFilter] =
    useState<
      'All' | 'Dues' | 'Exceeded'
    >('All');

  const [khataRecords, setKhataRecords] =
    useState<any[]>([]);

  const [inventory, setInventory] =
    useState<any[]>([]);

  const [expiryItems, setExpiryItems] =
    useState<any[]>([]);

  // MODALS
  const [showNewLedger, setShowNewLedger] =
    useState(false);

  const [settlingRecord, setSettlingRecord] =
    useState<any | null>(null);

  const [addDueCustomer, setAddDueCustomer] =
    useState<any | null>(null);

  // NEW LEDGER
  const [customerName, setCustomerName] =
    useState('');

  const [customerHostel, setCustomerHostel] =
    useState('');

  const [creditLimit, setCreditLimit] =
    useState('3000');

  // DUE
  const [dueAmount, setDueAmount] =
    useState('');

  const [dueRemarks, setDueRemarks] =
    useState('');

  // SETTLE
  const [settleAmount, setSettleAmount] =
    useState('');

  const [paymentMethod, setPaymentMethod] =
    useState<'UPI' | 'Cash'>('UPI');

  const [showQr, setShowQr] =
    useState(false);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const [khataRes, inventoryRes] =
        await Promise.all([
          supabase
            .from('khata_records')
            .select('*')
            .eq(
              'merchant_id',
              profile.id
            ),

          supabase
            .from('inventory')
            .select('*')
            .eq(
              'merchant_id',
              profile.id
            ),
        ]);

      const khataData =
        khataRes.data || [];

      const mappedKhata =
        khataData.map((rec: any) => {
          let meta = {
            studentName:
              'Customer',
            hostel:
              'Unknown',
            creditLimit: 3000,
          };

          try {
            meta = JSON.parse(
              rec.description
            );
          } catch {}

          return {
            id: rec.id,
            studentName:
              meta.studentName,
            hostel: meta.hostel,
            amountDue:
              parseFloat(
                rec.amount || 0
              ),
            creditLimit:
              meta.creditLimit,
            status:
              parseFloat(
                rec.amount || 0
              ) >=
              meta.creditLimit
                ? 'Exceeded'
                : 'Approved',
          };
        });

      setKhataRecords(mappedKhata);

      const inventoryData =
        inventoryRes.data || [];

      setInventory(
        inventoryData.map(
          (item: any) => ({
            id: item.id,
            itemName: item.name,
            stock: item.stock,
            threshold:
              item.threshold,
            category:
              item.category,
            unit:
              item.unit ||
              'pcs',
          })
        )
      );

      setExpiryItems([
        {
          id: '1',
          itemName:
            'Amul Milk 1L',
          originalPrice: 66,
          discount: 25,
          daysLeft: 1,
          activeSale: false,
        },
        {
          id: '2',
          itemName:
            'Bread Pack',
          originalPrice: 45,
          discount: 30,
          daysLeft: 2,
          activeSale: true,
        },
      ]);
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
  const totalOutstanding =
    khataRecords.reduce(
      (sum, item) =>
        sum + item.amountDue,
      0
    );

  const exceededAccounts =
    khataRecords.filter(
      (k) =>
        k.amountDue >=
        k.creditLimit
    ).length;

  const lowStockItems =
    inventory.filter(
      (i) =>
        i.stock <= i.threshold
    ).length;

  // FILTERS
  const filteredKhata =
    useMemo(() => {
      return khataRecords.filter(
        (rec) => {
          const matchesSearch =
            rec.studentName
              .toLowerCase()
              .includes(
                searchQuery.toLowerCase()
              ) ||
            rec.hostel
              .toLowerCase()
              .includes(
                searchQuery.toLowerCase()
              );

          const matchesFilter =
            khataFilter ===
              'All' ||
            (khataFilter ===
              'Dues' &&
              rec.amountDue > 0) ||
            (khataFilter ===
              'Exceeded' &&
              rec.amountDue >=
                rec.creditLimit);

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      khataRecords,
      searchQuery,
      khataFilter,
    ]);

  // ADD LEDGER
  const createLedger =
    async () => {
      if (
        !customerName ||
        !customerHostel
      ) {
        Alert.alert(
          'Missing Info',
          'Enter name and hostel.'
        );
        return;
      }

      try {
        const meta = {
          studentName:
            customerName,
          hostel:
            customerHostel,
          creditLimit:
            parseFloat(
              creditLimit
            ) || 3000,
        };

        const { error } =
          await supabase
            .from(
              'khata_records'
            )
            .insert([
              {
                merchant_id:
                  profile?.id,
                amount: 0,
                description:
                  JSON.stringify(
                    meta
                  ),
              },
            ]);

        if (error)
          throw error;

        Alert.alert(
          'Success',
          'Ledger account created.'
        );

        setCustomerName('');
        setCustomerHostel('');
        setCreditLimit(
          '3000'
        );

        setShowNewLedger(
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

  // ADD DUE
  const addDue = async () => {
    if (
      !dueAmount ||
      parseFloat(
        dueAmount
      ) <= 0
    ) {
      Alert.alert(
        'Invalid',
        'Enter valid amount.'
      );
      return;
    }

    try {
      const newDue =
        addDueCustomer.amountDue +
        parseFloat(
          dueAmount
        );

      const { error } =
        await supabase
          .from(
            'khata_records'
          )
          .update({
            amount: newDue,
          })
          .eq(
            'id',
            addDueCustomer.id
          );

      if (error)
        throw error;

      Alert.alert(
        'Logged',
        'Outstanding due added.'
      );

      setAddDueCustomer(
        null
      );

      setDueAmount('');
      setDueRemarks('');

      fetchData();
    } catch (e: any) {
      Alert.alert(
        'Error',
        e.message
      );
    }
  };

  // SETTLE
  const settlePayment =
    async () => {
      if (
        !settleAmount ||
        parseFloat(
          settleAmount
        ) <= 0
      ) {
        Alert.alert(
          'Invalid',
          'Enter valid repayment.'
        );
        return;
      }

      try {
        const newDue =
          Math.max(
            0,
            settlingRecord.amountDue -
              parseFloat(
                settleAmount
              )
          );

        const { error } =
          await supabase
            .from(
              'khata_records'
            )
            .update({
              amount: newDue,
            })
            .eq(
              'id',
              settlingRecord.id
            );

        if (error)
          throw error;

        Alert.alert(
          'Settled',
          `₹${settleAmount} received successfully.`
        );

        setSettlingRecord(
          null
        );

        setSettleAmount(
          ''
        );

        setShowQr(false);

        fetchData();
      } catch (e: any) {
        Alert.alert(
          'Error',
          e.message
        );
      }
    };

  // RESTOCK
  const restockItem =
    async (
      itemId: string,
      qty: number
    ) => {
      const item =
        inventory.find(
          (i) =>
            i.id === itemId
        );

      if (!item) return;

      try {
        const { error } =
          await supabase
            .from('inventory')
            .update({
              stock:
                item.stock +
                qty,
            })
            .eq(
              'id',
              itemId
            );

        if (error)
          throw error;

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
            'Kirana Manager',
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
                TOTAL KHATA
              </Text>

              <Text
                style={
                  styles.hudAmount
                }
              >
                ₹
                {
                  totalOutstanding
                }
              </Text>
            </View>

            <Wallet
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
              styles.analyticsRow
            }
          >
            <View>
              <Text
                style={
                  styles.analyticsValue
                }
              >
                {
                  exceededAccounts
                }
              </Text>

              <Text
                style={
                  styles.analyticsLabel
                }
              >
                Limit Exceeded
              </Text>
            </View>

            <View>
              <Text
                style={
                  styles.analyticsValue
                }
              >
                {
                  lowStockItems
                }
              </Text>

              <Text
                style={
                  styles.analyticsLabel
                }
              >
                Low Stock
              </Text>
            </View>

            <View>
              <Text
                style={
                  styles.analyticsValue
                }
              >
                {
                  expiryItems.length
                }
              </Text>

              <Text
                style={
                  styles.analyticsLabel
                }
              >
                Expiry
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* KHATA */}
        {activeTab === 'khata' && (
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
                  Khata Ledger
                </Text>

                <Text
                  style={{
                    color:
                      colors.textMuted,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  Track student
                  dues &
                  repayments
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
                  setShowNewLedger(
                    !showNewLedger
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
                placeholder="Search hostel/customer..."
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
                'Dues',
                'Exceeded',
              ].map((f) => {
                const active =
                  khataFilter ===
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
                      setKhataFilter(
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

            {/* CREATE LEDGER */}
            {showNewLedger && (
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
                    Create Ledger
                  </Text>
                </View>

                <TextInput
                  placeholder="Student Name"
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
                      color:
                        colors.text,
                      borderColor:
                        colors.border,
                      backgroundColor:
                        colors.surface,
                    },
                  ]}
                />

                <TextInput
                  placeholder="Hostel / PG"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  value={
                    customerHostel
                  }
                  onChangeText={
                    setCustomerHostel
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

                <TextInput
                  placeholder="Credit Limit"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  keyboardType="numeric"
                  value={
                    creditLimit
                  }
                  onChangeText={
                    setCreditLimit
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

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                  onPress={
                    createLedger
                  }
                >
                  <Text
                    style={
                      styles.submitTxt
                    }
                  >
                    Open Ledger
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* SETTLE */}
            {settlingRecord && (
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
                    Settle Due
                  </Text>
                </View>

                <Text
                  style={{
                    color:
                      colors.textMuted,
                    marginBottom: 12,
                  }}
                >
                  Pending:
                  ₹
                  {
                    settlingRecord.amountDue
                  }
                </Text>

                <TextInput
                  placeholder="Repayment Amount"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  keyboardType="numeric"
                  value={
                    settleAmount
                  }
                  onChangeText={
                    setSettleAmount
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

                <View
                  style={
                    styles.methodRow
                  }
                >
                  {[
                    'UPI',
                    'Cash',
                  ].map((m) => {
                    const active =
                      paymentMethod ===
                      m;

                    return (
                      <TouchableOpacity
                        key={m}
                        style={[
                          styles.methodChip,
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
                          setPaymentMethod(
                            m as any
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
                          {m}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {paymentMethod ===
                  'UPI' && (
                  <>
                    {!showQr ? (
                      <TouchableOpacity
                        style={[
                          styles.qrBtn,
                          {
                            backgroundColor:
                              colors.surface,
                          },
                        ]}
                        onPress={() =>
                          setShowQr(
                            true
                          )
                        }
                      >
                        <QrCode
                          size={
                            16
                          }
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
                          Generate QR
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View
                        style={
                          styles.qrBox
                        }
                      >
                        <QrCode
                          size={
                            72
                          }
                          color={
                            colors.text
                          }
                        />
                      </View>
                    )}
                  </>
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
                    settlePayment
                  }
                >
                  <Text
                    style={
                      styles.submitTxt
                    }
                  >
                    Finalize Payment
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* ADD DUE */}
            {addDueCustomer && (
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
                  <Receipt
                    size={18}
                    color={
                      colors.error
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
                    Add Due Entry
                  </Text>
                </View>

                <TextInput
                  placeholder="Due Amount"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  keyboardType="numeric"
                  value={dueAmount}
                  onChangeText={
                    setDueAmount
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

                <TextInput
                  placeholder="Remarks"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  value={
                    dueRemarks
                  }
                  onChangeText={
                    setDueRemarks
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

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    {
                      backgroundColor:
                        colors.error,
                    },
                  ]}
                  onPress={
                    addDue
                  }
                >
                  <Text
                    style={
                      styles.submitTxt
                    }
                  >
                    Log Due
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* KHATA LIST */}
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
              filteredKhata.map(
                (rec) => (
                  <GlassCard
                    key={rec.id}
                    style={
                      styles.khataCard
                    }
                  >
                    <View
                      style={
                        styles.khataTop
                      }
                    >
                      <View
                        style={[
                          styles.avatar,
                          {
                            backgroundColor:
                              colors.surface,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              colors.primary,
                            fontWeight:
                              '900',
                          }}
                        >
                          {rec.studentName[0]}
                        </Text>
                      </View>

                      <View
                        style={{
                          flex: 1,
                          marginLeft: 12,
                        }}
                      >
                        <Text
                          style={[
                            styles.khataName,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {
                            rec.studentName
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
                            rec.hostel
                          }
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor:
                              rec.status ===
                              'Approved'
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
                              rec.status ===
                              'Approved'
                                ? colors.success
                                : colors.error,
                            fontWeight:
                              '900',
                            fontSize: 9,
                          }}
                        >
                          {
                            rec.status
                          }
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.khataInfo,
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
                          DUES
                        </Text>

                        <Text
                          style={[
                            styles.infoValue,
                            {
                              color:
                                rec.amountDue >
                                0
                                  ? colors.error
                                  : colors.text,
                            },
                          ]}
                        >
                          ₹
                          {
                            rec.amountDue
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
                          LIMIT
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
                          ₹
                          {
                            rec.creditLimit
                          }
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.actionRow,
                        {
                          borderTopColor:
                            colors.border,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          {
                            backgroundColor:
                              colors.error +
                              '15',
                          },
                        ]}
                        onPress={() =>
                          setAddDueCustomer(
                            rec
                          )
                        }
                      >
                        <ArrowUpRight
                          size={14}
                          color={
                            colors.error
                          }
                        />

                        <Text
                          style={{
                            color:
                              colors.error,
                            marginLeft: 5,
                            fontWeight:
                              '800',
                            fontSize: 11,
                          }}
                        >
                          Add Due
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          {
                            backgroundColor:
                              colors.success +
                              '15',
                          },
                        ]}
                        onPress={() =>
                          setSettlingRecord(
                            rec
                          )
                        }
                      >
                        <ArrowDownLeft
                          size={14}
                          color={
                            colors.success
                          }
                        />

                        <Text
                          style={{
                            color:
                              colors.success,
                            marginLeft: 5,
                            fontWeight:
                              '800',
                            fontSize: 11,
                          }}
                        >
                          Settle
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.iconBtn,
                          {
                            backgroundColor:
                              colors.surface,
                          },
                        ]}
                        onPress={() =>
                          Share.share({
                            message: `${rec.studentName} outstanding balance is ₹${rec.amountDue}`,
                          })
                        }
                      >
                        <Share2
                          size={14}
                          color={
                            colors.text
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

        {/* INVENTORY */}
        {activeTab ===
          'inventory' && (
          <>
            {inventory.map(
              (item) => {
                const low =
                  item.stock <=
                  item.threshold;

                return (
                  <GlassCard
                    key={item.id}
                    style={
                      styles.stockCard
                    }
                  >
                    <View
                      style={
                        styles.khataTop
                      }
                    >
                      <View
                        style={{
                          flex: 1,
                        }}
                      >
                        <Text
                          style={[
                            styles.khataName,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {
                            item.itemName
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
                            item.category
                          }
                        </Text>
                      </View>

                      {low && (
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor:
                                colors.error +
                                '20',
                            },
                          ]}
                        >
                          <AlertTriangle
                            size={
                              11
                            }
                            color={
                              colors.error
                            }
                          />

                          <Text
                            style={{
                              color:
                                colors.error,
                              marginLeft: 4,
                              fontWeight:
                                '900',
                              fontSize: 9,
                            }}
                          >
                            LOW
                          </Text>
                        </View>
                      )}
                    </View>

                    <View
                      style={[
                        styles.khataInfo,
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
                          STOCK
                        </Text>

                        <Text
                          style={[
                            styles.infoValue,
                            {
                              color:
                                low
                                  ? colors.error
                                  : colors.text,
                            },
                          ]}
                        >
                          {
                            item.stock
                          }{' '}
                          {
                            item.unit
                          }
                        </Text>
                      </View>

                      <View>
                        <Text
                          style={
                            styles.infoLabel
                          }
                        >
                          THRESHOLD
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
                            item.threshold
                          }
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.actionRow,
                        {
                          borderTopColor:
                            colors.border,
                        },
                      ]}
                    >
                      {[5, 10, 20].map(
                        (qty) => (
                          <TouchableOpacity
                            key={
                              qty
                            }
                            style={[
                              styles.smallBtn,
                              {
                                backgroundColor:
                                  colors.primary,
                              },
                            ]}
                            onPress={() =>
                              restockItem(
                                item.id,
                                qty
                              )
                            }
                          >
                            <Text
                              style={
                                styles.smallBtnTxt
                              }
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

        {/* EXPIRY */}
        {activeTab ===
          'expiry' && (
          <>
            {expiryItems.map(
              (item) => (
                <GlassCard
                  key={item.id}
                  style={
                    styles.stockCard
                  }
                >
                  <View
                    style={
                      styles.khataTop
                    }
                  >
                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <Text
                        style={[
                          styles.khataName,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {
                          item.itemName
                        }
                      </Text>

                      <Text
                        style={{
                          color:
                            colors.textMuted,
                          fontSize: 11,
                        }}
                      >
                        Original:
                        ₹
                        {
                          item.originalPrice
                        }
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor:
                            colors.error +
                            '20',
                        },
                      ]}
                    >
                      <Clock3
                        size={11}
                        color={
                          colors.error
                        }
                      />

                      <Text
                        style={{
                          color:
                            colors.error,
                          marginLeft: 4,
                          fontWeight:
                            '900',
                          fontSize: 9,
                        }}
                      >
                        {
                          item.daysLeft
                        }
                        D
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.khataInfo,
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
                        DISCOUNT
                      </Text>

                      <Text
                        style={[
                          styles.infoValue,
                          {
                            color:
                              colors.primary,
                          },
                        ]}
                      >
                        {
                          item.discount
                        }
                        %
                      </Text>
                    </View>

                    <View>
                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        SALE PRICE
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
                        ₹
                        {Math.round(
                          item.originalPrice *
                            (1 -
                              item.discount /
                                100)
                        )}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.broadcastBtn,
                      {
                        backgroundColor:
                          item.activeSale
                            ? colors.success +
                              '20'
                            : colors.primary,
                        borderColor:
                          item.activeSale
                            ? colors.success
                            : 'transparent',
                      },
                    ]}
                  >
                    {item.activeSale ? (
                      <View
                        style={
                          styles.centerRow
                        }
                      >
                        <CheckCircle2
                          size={14}
                          color={
                            colors.success
                          }
                        />

                        <Text
                          style={{
                            color:
                              colors.success,
                            marginLeft: 6,
                            fontWeight:
                              '900',
                          }}
                        >
                          Broadcast
                          Active
                        </Text>
                      </View>
                    ) : (
                      <Text
                        style={{
                          color:
                            '#FFF',
                          fontWeight:
                            '900',
                        }}
                      >
                        Activate
                        Clearance
                      </Text>
                    )}
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
            id: 'khata',
            label: 'Khata',
            icon: UserPlus,
          },
          {
            id: 'inventory',
            label: 'Stock',
            icon: ShoppingBag,
          },
          {
            id: 'expiry',
            label: 'Expiry',
            icon: Percent,
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
    fontWeight: '900',
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

  analyticsRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
  },

  analyticsValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },

  analyticsLabel: {
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
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
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

  methodRow: {
    flexDirection: 'row',
    gap: 8,
  },

  methodChip: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  qrBtn: {
    marginTop: 12,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  qrBox: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },

  khataCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  stockCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  khataTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },

  khataName: {
    fontSize: 15,
    fontWeight: '900',
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  khataInfo: {
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
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },

  actionRow: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
    flexDirection: 'row',
    gap: 8,
  },

  actionBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  smallBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  smallBtnTxt: {
    color: '#FFF',
    fontWeight: '900',
  },

  broadcastBtn: {
    marginTop: 14,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerRow: {
    flexDirection: 'row',
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