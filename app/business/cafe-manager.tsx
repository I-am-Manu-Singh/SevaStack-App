// =====================================================
// CAFE MANAGER SCREEN
// Cleaned + modernized.
// Humans created three dashboards just to track Maggi.
// Civilization peaked somewhere around instant noodles.
// =====================================================

import React, {
  useState,
  useEffect,
  useCallback,
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
  Utensils,
  Coffee,
  Plus,
  Search,
  Share2,
  Sparkles,
  Users,
  ChefHat,
  Percent,
  TrendingUp,
  Clock3,
  Wallet,
} from 'lucide-react-native';

import {
  Colors,
  Spacing,
} from '@/constants/Theme';

import { GlassCard } from '@/components/GlassCard';

import { useApp } from '@/lib/AppContext';

import { supabase } from '@/lib/supabase';

import { CustomerBusinessView } from '@/components/CustomerBusinessView';

// =====================================================
// ROOT
// =====================================================

export default function CafeManagerScreen() {
  const {
    userRole,
    businessType,
  } = useApp();

  if (
    userRole === 'customer' ||
    businessType !== 'Cafe'
  ) {
    return (
      <CustomerBusinessView type="Cafe" />
    );
  }

  return (
    <CafeManagerScreenMerchant />
  );
}

// =====================================================
// MAIN
// =====================================================

function CafeManagerScreenMerchant() {
  const {
    colors,
    profile,
  } = useApp();

  const [activeTab, setActiveTab] =
    useState<
      'tokens' | 'split' | 'promos'
    >('tokens');

  // ===================================================
  // DATA
  // ===================================================

  const [tokens, setTokens] =
    useState<any[]>([]);

  const [promos, setPromos] =
    useState<any[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  // ===================================================
  // SEARCH
  // ===================================================

  const [searchQuery, setSearchQuery] =
    useState('');

  const [tokenFilter, setTokenFilter] =
    useState<
      | 'All'
      | 'Cooking'
      | 'Ready'
      | 'Served'
    >('All');

  // ===================================================
  // NEW TOKEN
  // ===================================================

  const [newTokenModal, setNewTokenModal] =
    useState(false);

  const [newName, setNewName] =
    useState('');

  const [newTable, setNewTable] =
    useState('Table 5');

  const [newItems, setNewItems] =
    useState(
      'Cheese Maggi + Cold Coffee'
    );

  const [newAmount, setNewAmount] =
    useState('180');

  // ===================================================
  // SPLIT BILL
  // ===================================================

  const [splitTable, setSplitTable] =
    useState('Table 4');

  const [splitTotal, setSplitTotal] =
    useState('600');

  const [splitCount, setSplitCount] =
    useState('4');

  const [friendsList, setFriendsList] =
    useState([
      {
        name: 'Vikram',
        share: 150,
        paid: false,
      },
      {
        name: 'Sameer',
        share: 150,
        paid: false,
      },
      {
        name: 'Kabir',
        share: 150,
        paid: false,
      },
      {
        name: 'Rohan',
        share: 150,
        paid: true,
      },
    ]);

  // ===================================================
  // FETCH
  // ===================================================

  const fetchData = useCallback(
    async () => {
      if (!profile?.id) return;

      try {
        const [
          tokensData,
          promosData,
        ] = await Promise.all([
          supabase
            .from('cafe_tokens')
            .select('*')
            .eq(
              'merchant_id',
              profile.id
            ),

          supabase
            .from('cafe_promos')
            .select('*')
            .eq(
              'merchant_id',
              profile.id
            ),
        ]);

        // ============================================
        // TOKENS
        // ============================================

        let finalTokens =
          tokensData.data || [];

        if (
          finalTokens.length ===
          0
        ) {
          const defaults = [
            {
              token_number:
                'TK-101',
              table_id:
                'Table 5',
              items:
                'Cheese Maggi + Cold Coffee',
              qty_summary:
                '2 Items',
              status:
                'Cooking',
              amount: 180,
              student_name:
                'Varun',
            },
            {
              token_number:
                'TK-102',
              table_id:
                'Table 2',
              items:
                'Sandwich + Shake',
              qty_summary:
                '2 Items',
              status:
                'Ready',
              amount: 240,
              student_name:
                'Alia',
            },
          ].map(t => ({
            ...t,
            merchant_id:
              profile.id,
          }));

          const seed =
            await supabase
              .from(
                'cafe_tokens'
              )
              .insert(defaults)
              .select();

          finalTokens =
            seed.data || [];
        }

        setTokens(
          finalTokens.map(
            (t: any) => ({
              id: t.id,
              tokenNumber:
                t.token_number,
              tableId:
                t.table_id,
              items: t.items,
              qtySummary:
                t.qty_summary,
              status:
                t.status,
              amount:
                Number(
                  t.amount
                ),
              studentName:
                t.student_name,
            })
          )
        );

        // ============================================
        // PROMOS
        // ============================================

        let finalPromos =
          promosData.data || [];

        if (
          finalPromos.length ===
          0
        ) {
          const defaults = [
            {
              title:
                'Night Owl Combo',
              timing:
                '11PM - 2AM',
              description:
                'Free tea with double cheese maggi.',
              code:
                'NIGHTOWL',
              active: true,
            },
            {
              title:
                'Exam Fuel',
              timing:
                '4PM - 7PM',
              description:
                '15% off on beverages.',
              code:
                'STUDY15',
              active: true,
            },
          ].map(p => ({
            ...p,
            merchant_id:
              profile.id,
          }));

          const seed =
            await supabase
              .from(
                'cafe_promos'
              )
              .insert(defaults)
              .select();

          finalPromos =
            seed.data || [];
        }

        setPromos(
          finalPromos.map(
            (p: any) => ({
              id: p.id,
              title: p.title,
              timing:
                p.timing,
              description:
                p.description,
              code: p.code,
              active:
                p.active,
            })
          )
        );
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [profile?.id]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ===================================================
  // REFRESH
  // ===================================================

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  // ===================================================
  // ANALYTICS
  // ===================================================

  const activeOrders =
    tokens.filter(
      t => t.status !== 'Served'
    ).length;

  const totalRevenue =
    tokens.reduce(
      (acc, curr) =>
        acc + curr.amount,
      0
    );

  const servedOrders =
    tokens.filter(
      t => t.status === 'Served'
    ).length;

  const promoCount =
    promos.length;

  // ===================================================
  // FILTER
  // ===================================================

  const filteredTokens =
    tokens.filter(token => {
      const query =
        searchQuery.toLowerCase();

      const matchesSearch =
        token.studentName
          .toLowerCase()
          .includes(query) ||
        token.items
          .toLowerCase()
          .includes(query) ||
        token.tokenNumber
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        tokenFilter === 'All'
          ? true
          : token.status ===
            tokenFilter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });

  // ===================================================
  // ACTIONS
  // ===================================================

  const handleAddNewToken =
    async () => {
      if (
        !newItems ||
        !newAmount
      ) {
        Alert.alert(
          'Missing Fields',
          'Please enter order details.'
        );

        return;
      }

      const tokenId =
        `TK-${100 + tokens.length + 1}`;

      const { error } =
        await supabase
          .from('cafe_tokens')
          .insert([
            {
              merchant_id:
                profile?.id,
              token_number:
                tokenId,
              table_id:
                newTable,
              items:
                newItems,
              qty_summary:
                'Custom Order',
              status:
                'Cooking',
              amount:
                Number(
                  newAmount
                ),
              student_name:
                newName ||
                'Walk-in',
            },
          ]);

      if (error) {
        Alert.alert(
          'Error',
          error.message
        );

        return;
      }

      Alert.alert(
        'Order Created',
        `${tokenId} added to kitchen queue.`
      );

      setNewTokenModal(false);

      fetchData();
    };

  const transitionTokenStatus =
    async (
      id: string,
      current: string
    ) => {
      let next = current;

      if (current === 'Cooking')
        next = 'Ready';

      else if (
        current === 'Ready'
      )
        next = 'Served';

      if (next === current)
        return;

      await supabase
        .from('cafe_tokens')
        .update({
          status: next,
        })
        .eq('id', id);

      fetchData();
    };

  const handleRecalculateSplit =
    () => {
      const total =
        Number(
          splitTotal
        ) || 0;

      const count =
        Number(
          splitCount
        ) || 1;

      const share =
        Math.round(
          total / count
        );

      setFriendsList(
        Array.from(
          {
            length: count,
          },
          (_, i) => ({
            name: `Friend ${
              i + 1
            }`,
            share,
            paid: false,
          })
        )
      );
    };

  const handlePayShare =
    (index: number) => {
      setFriendsList(prev =>
        prev.map(
          (
            friend,
            idx
          ) =>
            idx === index
              ? {
                  ...friend,
                  paid: true,
                }
              : friend
        )
      );
    };

  // ===================================================
  // UI
  // ===================================================

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
            'Cafe Operations',
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
              isRefreshing
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
        {isLoading ? (
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
            {/* ================================= */}
            {/* HERO */}
            {/* ================================= */}

            <GlassCard
              style={
                styles.heroCard
              }
            >
              <Text
                style={[
                  styles.heroTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Cafe Dashboard
              </Text>

              <Text
                style={[
                  styles.heroSubtitle,
                  {
                    color:
                      colors.textMuted,
                  },
                ]}
              >
                Kitchen
                tokens,
                split
                billing,
                promo
                campaigns
                and live
                food prep
                tracking.
              </Text>
            </GlassCard>

            {/* ================================= */}
            {/* ANALYTICS */}
            {/* ================================= */}

            <View
              style={
                styles.analyticsRow
              }
            >
              {[
                {
                  label:
                    'Active Orders',
                  value:
                    activeOrders,
                  icon:
                    ChefHat,
                },
                {
                  label:
                    'Revenue',
                  value: `₹${totalRevenue}`,
                  icon:
                    Wallet,
                },
                {
                  label:
                    'Served',
                  value:
                    servedOrders,
                  icon:
                    Coffee,
                },
                {
                  label:
                    'Promos',
                  value:
                    promoCount,
                  icon:
                    Percent,
                },
              ].map(
                (
                  item,
                  index
                ) => {
                  const Icon =
                    item.icon;

                  return (
                    <GlassCard
                      key={
                        index
                      }
                      style={
                        styles.analyticsCard
                      }
                    >
                      <Icon
                        size={
                          18
                        }
                        color={
                          colors.primary
                        }
                      />

                      <Text
                        style={[
                          styles.analyticsValue,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {
                          item.value
                        }
                      </Text>

                      <Text
                        style={[
                          styles.analyticsLabel,
                          {
                            color:
                              colors.textMuted,
                          },
                        ]}
                      >
                        {
                          item.label
                        }
                      </Text>
                    </GlassCard>
                  );
                }
              )}
            </View>

            {/* ================================= */}
            {/* SEARCH */}
            {/* ================================= */}

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
                  size={16}
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
                  placeholder="Search orders..."
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

              <TouchableOpacity
                style={[
                  styles.addBtn,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
                onPress={() =>
                  setNewTokenModal(
                    !newTokenModal
                  )
                }
              >
                <Plus
                  size={20}
                  color="#FFF"
                />
              </TouchableOpacity>
            </View>

            {/* ================================= */}
            {/* FILTERS */}
            {/* ================================= */}

            <View
              style={
                styles.filterRow
              }
            >
              {[
                'All',
                'Cooking',
                'Ready',
                'Served',
              ].map(
                filter => (
                  <TouchableOpacity
                    key={
                      filter
                    }
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor:
                          colors.surface,
                        borderColor:
                          colors.border,
                      },
                      tokenFilter ===
                        filter && {
                        backgroundColor:
                          colors.primary +
                          '20',
                        borderColor:
                          colors.primary,
                      },
                    ]}
                    onPress={() =>
                      setTokenFilter(
                        filter as any
                      )
                    }
                  >
                    <Text
                      style={{
                        color:
                          tokenFilter ===
                          filter
                            ? colors.primary
                            : colors.textMuted,
                        fontWeight:
                          '700',
                        fontSize: 11,
                      }}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* ================================= */}
            {/* CREATE TOKEN */}
            {/* ================================= */}

            {newTokenModal && (
              <GlassCard
                style={
                  styles.modalCard
                }
              >
                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Create Order
                </Text>

                <TextInput
                  value={
                    newName
                  }
                  onChangeText={
                    setNewName
                  }
                  placeholder="Customer Name"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  style={[
                    styles.formInput,
                    {
                      color:
                        colors.text,
                      borderColor:
                        colors.border,
                    },
                  ]}
                />

                <TextInput
                  value={
                    newItems
                  }
                  onChangeText={
                    setNewItems
                  }
                  placeholder="Food Items"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  style={[
                    styles.formInput,
                    {
                      color:
                        colors.text,
                      borderColor:
                        colors.border,
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
                    handleAddNewToken
                  }
                >
                  <Text
                    style={
                      styles.submitBtnText
                    }
                  >
                    Add To
                    Kitchen Queue
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* ================================= */}
            {/* TOKENS */}
            {/* ================================= */}

            {filteredTokens.map(
              token => (
                <GlassCard
                  key={token.id}
                  style={
                    styles.tokenCard
                  }
                >
                  <View
                    style={
                      styles.tokenTop
                    }
                  >
                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <Text
                        style={[
                          styles.tokenTitle,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {
                          token.studentName
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
                          token.tableId
                        }
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            token.status ===
                            'Ready'
                              ? colors.success +
                                '20'
                              : token.status ===
                                'Served'
                              ? colors.border
                              : colors.accent +
                                '20',
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            token.status ===
                            'Ready'
                              ? colors.success
                              : token.status ===
                                'Served'
                              ? colors.textMuted
                              : colors.accent,
                          fontSize: 9,
                          fontWeight:
                            '900',
                        }}
                      >
                        {
                          token.status
                        }
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.tokenInfo,
                      {
                        borderTopColor:
                          colors.border,
                      },
                    ]}
                  >
                    <Coffee
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
                        style={[
                          styles.tokenFood,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {
                          token.items
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
                          token.tokenNumber
                        }
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.tokenFooter,
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
                      Total
                    </Text>

                    <Text
                      style={{
                        color:
                          colors.text,
                        fontWeight:
                          '800',
                        fontSize: 14,
                      }}
                    >
                      ₹
                      {
                        token.amount
                      }
                    </Text>
                  </View>

                  <View
                    style={
                      styles.tokenActions
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
                        Share.share(
                          {
                            message: `${token.studentName}, your order is ${token.status}.`,
                          }
                        )
                      }
                    >
                      <Share2
                        size={
                          13
                        }
                        color={
                          colors.text
                        }
                      />

                      <Text
                        style={[
                          styles.actionBtnText,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        Notify
                      </Text>
                    </TouchableOpacity>

                    {token.status !==
                      'Served' && (
                      <TouchableOpacity
                        style={[
                          styles.primaryBtn,
                          {
                            backgroundColor:
                              colors.primary,
                          },
                        ]}
                        onPress={() =>
                          transitionTokenStatus(
                            token.id,
                            token.status
                          )
                        }
                      >
                        <Text
                          style={
                            styles.submitBtnText
                          }
                        >
                          {token.status ===
                          'Cooking'
                            ? 'Mark Ready'
                            : 'Mark Served'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </GlassCard>
              )
            )}

            <View
              style={{
                height: 120,
              }}
            />
          </>
        )}
      </ScrollView>

      {/* ===================================== */}
      {/* BOTTOM NAV */}
      {/* ===================================== */}

      <View
        style={[
          styles.bottomTabBar,
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
            id: 'tokens',
            label: 'Orders',
            icon: ChefHat,
          },
          {
            id: 'split',
            label: 'Split',
            icon: Users,
          },
          {
            id: 'promos',
            label: 'Promos',
            icon: Percent,
          },
        ].map(tab => {
          const Icon =
            tab.icon;

          const isActive =
            activeTab ===
            tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.bottomTabBtn,
                isActive && {
                  backgroundColor:
                    colors.primary +
                    '18',
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
                  isActive
                    ? colors.primary
                    : colors.textMuted
                }
              />

              <Text
                style={[
                  styles.bottomTabLabel,
                  {
                    color:
                      isActive
                        ? colors.primary
                        : colors.textMuted,
                  },
                ]}
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

// =====================================================
// STYLES
// =====================================================

const styles: any =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    scrollContent: {
      padding:
        Spacing.md,
    },

    heroCard: {
      marginBottom: 18,
    },

    heroTitle: {
      fontSize: 26,
      fontWeight:
        '900',
    },

    heroSubtitle: {
      marginTop: 6,
      fontSize: 13,
      lineHeight: 18,
    },

    analyticsRow: {
      flexDirection:
        'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 18,
    },

    analyticsCard: {
      width: '47%',
      padding: 14,
      borderRadius: 18,
    },

    analyticsValue: {
      marginTop: 10,
      fontSize: 20,
      fontWeight:
        '900',
    },

    analyticsLabel: {
      marginTop: 4,
      fontSize: 11,
      fontWeight:
        '700',
    },

    searchRow: {
      flexDirection:
        'row',
      gap: 8,
      marginBottom: 14,
    },

    searchBar: {
      flex: 1,
      flexDirection:
        'row',
      alignItems:
        'center',
      borderWidth: 1,
      borderRadius: 14,
      height: 46,
      paddingHorizontal: 12,
    },

    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 13,
    },

    addBtn: {
      width: 46,
      height: 46,
      borderRadius: 14,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    filterRow: {
      flexDirection:
        'row',
      gap: 8,
      marginBottom: 18,
    },

    filterChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderWidth: 1,
      borderRadius: 999,
    },

    modalCard: {
      padding: 16,
      borderRadius: 18,
      marginBottom: 18,
    },

    modalTitle: {
      fontSize: 15,
      fontWeight:
        '800',
      marginBottom: 14,
    },

    formInput: {
      height: 46,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 12,
      fontSize: 13,
    },

    submitBtn: {
      height: 44,
      borderRadius: 12,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    submitBtnText: {
      color: '#FFF',
      fontWeight:
        '800',
      fontSize: 12,
    },

    tokenCard: {
      padding: 14,
      borderRadius: 18,
      marginBottom: 12,
    },

    tokenTop: {
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    tokenTitle: {
      fontSize: 15,
      fontWeight:
        '900',
    },

    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
    },

    tokenInfo: {
      borderTopWidth: 1,
      paddingTop: 12,
      marginTop: 10,
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    tokenFood: {
      fontSize: 13,
      fontWeight:
        '800',
    },

    tokenFooter: {
      borderTopWidth: 1,
      paddingTop: 10,
      marginTop: 10,
      flexDirection:
        'row',
      justifyContent:
        'space-between',
    },

    tokenActions: {
      flexDirection:
        'row',
      gap: 8,
      marginTop: 14,
    },

    actionBtn: {
      flexDirection:
        'row',
      alignItems:
        'center',
      paddingHorizontal: 12,
      height: 34,
      borderRadius: 10,
    },

    actionBtnText: {
      marginLeft: 6,
      fontSize: 11,
      fontWeight:
        '700',
    },

    primaryBtn: {
      flex: 1,
      height: 34,
      borderRadius: 10,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    bottomTabBar: {
      position:
        'absolute',
      bottom: 12,
      left: 16,
      right: 16,
      height: 62,
      borderRadius: 22,
      borderWidth: 1,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-around',
      paddingHorizontal: 6,
    },

    bottomTabBtn: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    bottomTabLabel: {
      marginTop: 4,
      fontSize: 10,
      fontWeight:
        '800',
    },
  });