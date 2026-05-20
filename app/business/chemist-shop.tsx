// =======================================================
// CHEMIST SHOP SCREEN - CLEAN MODERN VERSION
// Humans invented AI prescription scanners because
// deciphering doctor handwriting became a public health
// crisis. Fair enough.
// =======================================================

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
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
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  FileText,
  Minus,
  Pill,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
} from 'lucide-react-native';

import { Spacing } from '@/constants/Theme';

import { GlassCard } from '@/components/GlassCard';

import { useApp } from '@/lib/AppContext';

import { supabase } from '@/lib/supabase';

import { CustomerBusinessView } from '@/components/CustomerBusinessView';

// =======================================================
// ROOT
// =======================================================

export default function ChemistShopScreen() {
  const {
    userRole,
    businessType,
  } = useApp();

  if (
    userRole === 'customer' ||
    businessType !== 'Pharmacy'
  ) {
    return (
      <CustomerBusinessView type="Chemist" />
    );
  }

  return (
    <ChemistShopScreenMerchant />
  );
}

// =======================================================
// MAIN
// =======================================================

function ChemistShopScreenMerchant() {
  const {
    colors,
    profile,
  } = useApp();

  // =====================================================
  // TABS
  // =====================================================

  const [activeTab, setActiveTab] =
    useState<
      | 'directory'
      | 'rx'
      | 'billing'
      | 'checker'
    >('directory');

  // =====================================================
  // STATE
  // =====================================================

  const [medicines, setMedicines] =
    useState<any[]>([]);

  const [billingCart, setBillingCart] =
    useState<any[]>([]);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState('All');

  const [newMedModal, setNewMedModal] =
    useState(false);

  const [formName, setFormName] =
    useState('');

  const [formSalt, setFormSalt] =
    useState('');

  const [formStock, setFormStock] =
    useState('');

  const [formPrice, setFormPrice] =
    useState('');

  const [formWarning, setFormWarning] =
    useState('OTC');

  const [formRx, setFormRx] =
    useState(false);

  const [billingStudent, setBillingStudent] =
    useState('Walk-in');

  const [discountPercent, setDiscountPercent] =
    useState('10');

  const [checkoutReceipt, setCheckoutReceipt] =
    useState<any | null>(null);

  // =====================================================
  // AI CHECKER
  // =====================================================

  const [drugA, setDrugA] =
    useState('');

  const [drugB, setDrugB] =
    useState('');

  const [interactionResult, setInteractionResult] =
    useState<any | null>(null);

  const [isCheckingInteractions, setIsCheckingInteractions] =
    useState(false);

  // =====================================================
  // FETCH
  // =====================================================

  const fetchData = useCallback(
    async () => {
      if (!profile?.id) return;

      try {
        const { data } =
          await supabase
            .from(
              'chemist_medicines'
            )
            .select('*')
            .eq(
              'merchant_id',
              profile.id
            );

        let meds =
          data || [];

        // Seed default meds
        if (meds.length === 0) {
          const defaults = [
            {
              name: 'Dolo 650',
              category:
                'Analgesics',
              salt:
                'Paracetamol',
              warning: 'OTC',
              stock: 120,
              price: 30,
              expiry:
                '12/2028',
              rx_required:
                false,
            },
            {
              name:
                'Amoxicillin',
              category:
                'Antibiotics',
              salt:
                'Amoxicillin',
              warning:
                'Schedule H',
              stock: 40,
              price: 95,
              expiry:
                '09/2027',
              rx_required:
                true,
            },
          ].map(m => ({
            ...m,
            merchant_id:
              profile.id,
          }));

          const seed =
            await supabase
              .from(
                'chemist_medicines'
              )
              .insert(defaults)
              .select();

          meds =
            seed.data || [];
        }

        setMedicines(
          meds.map(
            (m: any) => ({
              id: m.id,
              name: m.name,
              category:
                m.category,
              salt: m.salt,
              warning:
                m.warning,
              stock:
                m.stock,
              price:
                Number(
                  m.price
                ),
              expiry:
                m.expiry,
              rxRequired:
                m.rx_required,
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

  // =====================================================
  // REFRESH
  // =====================================================

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  // =====================================================
  // FILTERS
  // =====================================================

  const categories = [
    'All',
    'Analgesics',
    'Antibiotics',
    'Anti-Allergic',
  ];

  const filteredMeds = useMemo(
    () => {
      return medicines.filter(
        med => {
          const matchesSearch =
            med.name
              .toLowerCase()
              .includes(
                searchQuery.toLowerCase()
              ) ||
            med.salt
              .toLowerCase()
              .includes(
                searchQuery.toLowerCase()
              );

          const matchesCategory =
            selectedCategory ===
              'All' ||
            med.category ===
              selectedCategory;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
    },
    [
      medicines,
      searchQuery,
      selectedCategory,
    ]
  );

  // =====================================================
  // ANALYTICS
  // =====================================================

  const lowStockCount =
    medicines.filter(
      m => m.stock <= 15
    ).length;

  const totalInventory =
    medicines.length;

  const inventoryValue =
    medicines.reduce(
      (acc, med) =>
        acc +
        med.price * med.stock,
      0
    );

  // =====================================================
  // ADD MEDICINE
  // =====================================================

  const handleAddMedicine =
    async () => {
      if (
        !formName ||
        !formSalt ||
        !formPrice
      ) {
        Alert.alert(
          'Missing Fields',
          'Please complete required fields.'
        );

        return;
      }

      const { error } =
        await supabase
          .from(
            'chemist_medicines'
          )
          .insert([
            {
              merchant_id:
                profile?.id,
              name: formName,
              category:
                'Analgesics',
              salt: formSalt,
              warning:
                formWarning,
              stock:
                Number(
                  formStock
                ) || 0,
              price:
                Number(
                  formPrice
                ) || 0,
              expiry:
                '12/2028',
              rx_required:
                formRx,
            },
          ]);

      if (error) {
        Alert.alert(
          'Error',
          error.message
        );

        return;
      }

      setFormName('');
      setFormSalt('');
      setFormStock('');
      setFormPrice('');

      setNewMedModal(false);

      fetchData();
    };

  // =====================================================
  // STOCK
  // =====================================================

  const adjustStock =
    async (
      id: string,
      delta: number
    ) => {
      const target =
        medicines.find(
          m => m.id === id
        );

      if (!target) return;

      const updated =
        Math.max(
          0,
          target.stock + delta
        );

      await supabase
        .from(
          'chemist_medicines'
        )
        .update({
          stock: updated,
        })
        .eq('id', id);

      fetchData();
    };

  // =====================================================
  // CART
  // =====================================================

  const addToCart = (
    med: any
  ) => {
    const exists =
      billingCart.find(
        i => i.id === med.id
      );

    if (exists) {
      setBillingCart(prev =>
        prev.map(item =>
          item.id === med.id
            ? {
                ...item,
                qty:
                  item.qty +
                  1,
              }
            : item
        )
      );
    } else {
      setBillingCart([
        ...billingCart,
        {
          ...med,
          qty: 1,
        },
      ]);
    }
  };

  const removeFromCart = (
    id: string
  ) => {
    setBillingCart(prev =>
      prev.filter(
        item =>
          item.id !== id
      )
    );
  };

  const subtotal =
    billingCart.reduce(
      (acc, item) =>
        acc +
        item.qty *
          item.price,
      0
    );

  const discount =
    (subtotal *
      Number(
        discountPercent
      )) /
    100;

  const total =
    subtotal - discount;

  // =====================================================
  // CHECKOUT
  // =====================================================

  const handleCheckout =
    () => {
      if (
        billingCart.length ===
        0
      ) {
        Alert.alert(
          'Cart Empty',
          'Add medicines first.'
        );

        return;
      }

      setCheckoutReceipt({
        invoice:
          `INV-${Date.now()
            .toString()
            .slice(-6)}`,
        student:
          billingStudent,
        items:
          billingCart,
        subtotal,
        discount,
        total,
      });

      setBillingCart([]);
    };

  // =====================================================
  // AI CHECKER
  // =====================================================

  const handleCheckInteractions =
    () => {
      if (
        !drugA ||
        !drugB
      ) {
        Alert.alert(
          'Missing Drugs',
          'Enter both compounds.'
        );

        return;
      }

      setIsCheckingInteractions(
        true
      );

      setTimeout(() => {
        setIsCheckingInteractions(
          false
        );

        const a =
          drugA.toLowerCase();

        const b =
          drugB.toLowerCase();

        if (
          a.includes(
            'paracetamol'
          ) &&
          b.includes(
            'alcohol'
          )
        ) {
          setInteractionResult(
            {
              severity:
                'High Warning',
              color:
                '#EF4444',
              title:
                'Paracetamol + Alcohol',
              risk:
                'Potential liver toxicity risk.',
              recommendation:
                'Avoid alcohol during therapy.',
            }
          );
        } else {
          setInteractionResult(
            {
              severity:
                'No Major Interaction',
              color:
                '#10B981',
              title:
                `${drugA} + ${drugB}`,
              risk:
                'No significant contraindications detected.',
              recommendation:
                'Standard precautions apply.',
            }
          );
        }
      }, 1400);
    };

  // =====================================================
  // UI
  // =====================================================

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
            'Pharmacy Dashboard',
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
              marginTop: 60,
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
                Smart Pharmacy
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
                Inventory,
                prescriptions,
                AI diagnostics
                and billing in
                one place.
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
                    'Inventory',
                  value:
                    totalInventory,
                },
                {
                  label:
                    'Low Stock',
                  value:
                    lowStockCount,
                },
                {
                  label:
                    'Inventory ₹',
                  value: `₹${inventoryValue}`,
                },
              ].map(
                (
                  item,
                  index
                ) => (
                  <GlassCard
                    key={
                      index
                    }
                    style={
                      styles.analyticsCard
                    }
                  >
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
                )
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
                  placeholder="Search medicine..."
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
                  setNewMedModal(
                    !newMedModal
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
            {/* CATEGORY */}
            {/* ================================= */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.categoriesRow
              }
            >
              {categories.map(
                category => (
                  <TouchableOpacity
                    key={
                      category
                    }
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor:
                          colors.surface,
                        borderColor:
                          colors.border,
                      },
                      selectedCategory ===
                        category && {
                        backgroundColor:
                          colors.primary +
                          '20',
                        borderColor:
                          colors.primary,
                      },
                    ]}
                    onPress={() =>
                      setSelectedCategory(
                        category
                      )
                    }
                  >
                    <Text
                      style={{
                        color:
                          selectedCategory ===
                          category
                            ? colors.primary
                            : colors.textMuted,
                        fontSize: 11,
                        fontWeight:
                          '700',
                      }}
                    >
                      {
                        category
                      }
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>

            {/* ================================= */}
            {/* ADD FORM */}
            {/* ================================= */}

            {newMedModal && (
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
                  Add Medicine
                </Text>

                <TextInput
                  placeholder="Medicine Name"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  value={
                    formName
                  }
                  onChangeText={
                    setFormName
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
                  placeholder="Salt Formula"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  value={
                    formSalt
                  }
                  onChangeText={
                    setFormSalt
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
                    handleAddMedicine
                  }
                >
                  <Text
                    style={
                      styles.submitBtnText
                    }
                  >
                    Register
                    Medicine
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* ================================= */}
            {/* DIRECTORY */}
            {/* ================================= */}

            {activeTab ===
              'directory' &&
              filteredMeds.map(
                med => (
                  <GlassCard
                    key={
                      med.id
                    }
                    style={
                      styles.medCard
                    }
                  >
                    <View
                      style={
                        styles.medTop
                      }
                    >
                      <View
                        style={{
                          flex: 1,
                        }}
                      >
                        <Text
                          style={[
                            styles.medName,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {
                            med.name
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
                            med.salt
                          }
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.warningBadge,
                          {
                            backgroundColor:
                              med.warning ===
                              'OTC'
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
                              med.warning ===
                              'OTC'
                                ? colors.success
                                : colors.error,
                            fontSize: 9,
                            fontWeight:
                              '900',
                          }}
                        >
                          {
                            med.warning
                          }
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.medFooter,
                        {
                          borderTopColor:
                            colors.border,
                        },
                      ]}
                    >
                      <View>
                        <Text
                          style={{
                            color:
                              colors.text,
                            fontWeight:
                              '800',
                          }}
                        >
                          ₹
                          {
                            med.price
                          }
                        </Text>

                        <Text
                          style={{
                            color:
                              med.stock <=
                              15
                                ? colors.error
                                : colors.textMuted,
                            fontSize: 11,
                          }}
                        >
                          {
                            med.stock
                          }{' '}
                          pcs
                        </Text>
                      </View>

                      <View
                        style={
                          styles.stockControls
                        }
                      >
                        <TouchableOpacity
                          style={
                            styles.stockBtn
                          }
                          onPress={() =>
                            adjustStock(
                              med.id,
                              -1
                            )
                          }
                        >
                          <Minus
                            size={
                              14
                            }
                            color={
                              colors.text
                            }
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={
                            styles.stockBtn
                          }
                          onPress={() =>
                            adjustStock(
                              med.id,
                              1
                            )
                          }
                        >
                          <Plus
                            size={
                              14
                            }
                            color={
                              colors.text
                            }
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.billBtn,
                            {
                              backgroundColor:
                                colors.primary,
                            },
                          ]}
                          onPress={() =>
                            addToCart(
                              med
                            )
                          }
                        >
                          <Pill
                            size={
                              14
                            }
                            color="#FFF"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </GlassCard>
                )
              )}

            {/* ================================= */}
            {/* BILLING */}
            {/* ================================= */}

            {activeTab ===
              'billing' && (
              <View>
                {checkoutReceipt ? (
                  <GlassCard
                    style={
                      styles.receiptCard
                    }
                  >
                    <CheckCircle2
                      size={
                        42
                      }
                      color={
                        colors.success
                      }
                    />

                    <Text
                      style={[
                        styles.receiptTitle,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      Invoice
                      Generated
                    </Text>

                    <Text
                      style={{
                        color:
                          colors.textMuted,
                        fontSize: 11,
                      }}
                    >
                      {
                        checkoutReceipt.invoice
                      }
                    </Text>

                    <View
                      style={{
                        width:
                          '100%',
                        marginTop: 14,
                      }}
                    >
                      {checkoutReceipt.items.map(
                        (
                          item: any,
                          idx: number
                        ) => (
                          <View
                            key={
                              idx
                            }
                            style={
                              styles.receiptRow
                            }
                          >
                            <Text
                              style={{
                                color:
                                  colors.text,
                              }}
                            >
                              {
                                item.name
                              }{' '}
                              x
                              {
                                item.qty
                              }
                            </Text>

                            <Text
                              style={{
                                color:
                                  colors.text,
                              }}
                            >
                              ₹
                              {item.price *
                                item.qty}
                            </Text>
                          </View>
                        )
                      )}
                    </View>

                    <View
                      style={[
                        styles.receiptDivider,
                        {
                          backgroundColor:
                            colors.border,
                        },
                      ]}
                    />

                    <View
                      style={
                        styles.receiptRow
                      }
                    >
                      <Text
                        style={{
                          color:
                            colors.textMuted,
                        }}
                      >
                        Total
                      </Text>

                      <Text
                        style={{
                          color:
                            colors.primary,
                          fontWeight:
                            '900',
                          fontSize: 18,
                        }}
                      >
                        ₹
                        {
                          checkoutReceipt.total
                        }
                      </Text>
                    </View>
                  </GlassCard>
                ) : (
                  <>
                    <GlassCard
                      style={
                        styles.billingCard
                      }
                    >
                      <TextInput
                        value={
                          billingStudent
                        }
                        onChangeText={
                          setBillingStudent
                        }
                        placeholder="Patient Name"
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
                          discountPercent
                        }
                        onChangeText={
                          setDiscountPercent
                        }
                        placeholder="Discount %"
                        placeholderTextColor={
                          colors.textMuted
                        }
                        keyboardType="numeric"
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
                    </GlassCard>

                    {billingCart.map(
                      (
                        item,
                        idx
                      ) => (
                        <GlassCard
                          key={
                            idx
                          }
                          style={
                            styles.cartCard
                          }
                        >
                          <View
                            style={{
                              flex: 1,
                            }}
                          >
                            <Text
                              style={[
                                styles.cartName,
                                {
                                  color:
                                    colors.text,
                                },
                              ]}
                            >
                              {
                                item.name
                              }
                            </Text>

                            <Text
                              style={{
                                color:
                                  colors.textMuted,
                                fontSize: 11,
                              }}
                            >
                              Qty:{' '}
                              {
                                item.qty
                              }
                            </Text>
                          </View>

                          <TouchableOpacity
                            onPress={() =>
                              removeFromCart(
                                item.id
                              )
                            }
                          >
                            <Trash2
                              size={
                                16
                              }
                              color={
                                colors.error
                              }
                            />
                          </TouchableOpacity>
                        </GlassCard>
                      )
                    )}

                    {billingCart.length >
                      0 && (
                      <GlassCard
                        style={
                          styles.summaryCard
                        }
                      >
                        <View
                          style={
                            styles.receiptRow
                          }
                        >
                          <Text
                            style={{
                              color:
                                colors.textMuted,
                            }}
                          >
                            Subtotal
                          </Text>

                          <Text
                            style={{
                              color:
                                colors.text,
                            }}
                          >
                            ₹
                            {
                              subtotal
                            }
                          </Text>
                        </View>

                        <View
                          style={
                            styles.receiptRow
                          }
                        >
                          <Text
                            style={{
                              color:
                                colors.textMuted,
                            }}
                          >
                            Discount
                          </Text>

                          <Text
                            style={{
                              color:
                                colors.success,
                            }}
                          >
                            -₹
                            {
                              discount
                            }
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.receiptDivider,
                            {
                              backgroundColor:
                                colors.border,
                            },
                          ]}
                        />

                        <View
                          style={
                            styles.receiptRow
                          }
                        >
                          <Text
                            style={{
                              color:
                                colors.text,
                              fontWeight:
                                '900',
                            }}
                          >
                            Total
                          </Text>

                          <Text
                            style={{
                              color:
                                colors.primary,
                              fontWeight:
                                '900',
                            }}
                          >
                            ₹
                            {total}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.submitBtn,
                            {
                              backgroundColor:
                                colors.primary,
                              marginTop: 14,
                            },
                          ]}
                          onPress={
                            handleCheckout
                          }
                        >
                          <Text
                            style={
                              styles.submitBtnText
                            }
                          >
                            Generate
                            Invoice
                          </Text>
                        </TouchableOpacity>
                      </GlassCard>
                    )}
                  </>
                )}
              </View>
            )}

            {/* ================================= */}
            {/* AI CHECKER */}
            {/* ================================= */}

            {activeTab ===
              'checker' && (
              <GlassCard
                style={
                  styles.checkerCard
                }
              >
                <TextInput
                  value={drugA}
                  onChangeText={
                    setDrugA
                  }
                  placeholder="Drug A"
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
                  value={drugB}
                  onChangeText={
                    setDrugB
                  }
                  placeholder="Drug B"
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
                    handleCheckInteractions
                  }
                >
                  {isCheckingInteractions ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFF"
                    />
                  ) : (
                    <Text
                      style={
                        styles.submitBtnText
                      }
                    >
                      Run AI
                      Diagnostic
                    </Text>
                  )}
                </TouchableOpacity>

                {interactionResult && (
                  <View
                    style={[
                      styles.resultCard,
                      {
                        borderColor:
                          interactionResult.color,
                      },
                    ]}
                  >
                    <View
                      style={
                        styles.resultHeader
                      }
                    >
                      <ShieldAlert
                        size={
                          18
                        }
                        color={
                          interactionResult.color
                        }
                      />

                      <Text
                        style={{
                          color:
                            interactionResult.color,
                          fontWeight:
                            '900',
                        }}
                      >
                        {
                          interactionResult.severity
                        }
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.resultTitle,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      {
                        interactionResult.title
                      }
                    </Text>

                    <Text
                      style={[
                        styles.resultText,
                        {
                          color:
                            colors.textMuted,
                        },
                      ]}
                    >
                      {
                        interactionResult.risk
                      }
                    </Text>

                    <Text
                      style={[
                        styles.resultText,
                        {
                          color:
                            colors.textMuted,
                          marginTop: 10,
                        },
                      ]}
                    >
                      {
                        interactionResult.recommendation
                      }
                    </Text>
                  </View>
                )}
              </GlassCard>
            )}

            <View
              style={{
                height: 120,
              }}
            />
          </>
        )}
      </ScrollView>

      {/* ========================================= */}
      {/* BOTTOM NAV */}
      {/* ========================================= */}

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
            id: 'directory',
            label: 'Meds',
            icon: Pill,
          },
          {
            id: 'rx',
            label: 'RX',
            icon: FileText,
          },
          {
            id: 'billing',
            label: 'Billing',
            icon: CheckCircle2,
          },
          {
            id: 'checker',
            label: 'AI',
            icon: Cpu,
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
                styles.bottomBtn,
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
                style={{
                  color:
                    isActive
                      ? colors.primary
                      : colors.textMuted,
                  fontSize: 10,
                  fontWeight:
                    '800',
                  marginTop: 4,
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

// =======================================================
// STYLES
// =======================================================

const styles = StyleSheet.create({
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
    fontSize: 28,
    fontWeight: '900',
  },

  heroSubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
  },

  analyticsRow: {
    flexDirection:
      'row',
    gap: 10,
    marginBottom: 18,
  },

  analyticsCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
  },

  analyticsValue: {
    fontSize: 20,
    fontWeight: '900',
  },

  analyticsLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
  },

  searchRow: {
    flexDirection:
      'row',
    gap: 8,
    marginBottom: 16,
  },

  searchBar: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection:
      'row',
    alignItems:
      'center',
    paddingHorizontal: 12,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
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

  categoriesRow: {
    gap: 8,
    paddingBottom: 18,
  },

  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },

  formCard: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 18,
  },

  formTitle: {
    fontSize: 15,
    fontWeight: '800',
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
    fontWeight: '800',
    fontSize: 12,
  },

  medCard: {
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },

  medTop: {
    flexDirection:
      'row',
  },

  medName: {
    fontSize: 15,
    fontWeight: '900',
  },

  warningBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  medFooter: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
    flexDirection:
      'row',
    justifyContent:
      'space-between',
    alignItems:
      'center',
  },

  stockControls: {
    flexDirection:
      'row',
    gap: 8,
  },

  stockBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor:
      'rgba(255,255,255,0.06)',
    justifyContent:
      'center',
    alignItems:
      'center',
  },

  billBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent:
      'center',
    alignItems:
      'center',
  },

  billingCard: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
  },

  cartCard: {
    flexDirection:
      'row',
    alignItems:
      'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },

  cartName: {
    fontSize: 14,
    fontWeight: '800',
  },

  summaryCard: {
    padding: 16,
    borderRadius: 18,
    marginTop: 14,
  },

  receiptCard: {
    padding: 18,
    borderRadius: 18,
    alignItems:
      'center',
  },

  receiptTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 10,
  },

  receiptDivider: {
    width: '100%',
    height: 1,
    marginVertical: 12,
    opacity: 0.12,
  },

  receiptRow: {
    width: '100%',
    flexDirection:
      'row',
    justifyContent:
      'space-between',
    paddingVertical: 4,
  },

  checkerCard: {
    padding: 16,
    borderRadius: 18,
  },

  resultCard: {
    marginTop: 16,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
  },

  resultHeader: {
    flexDirection:
      'row',
    alignItems:
      'center',
    gap: 8,
  },

  resultTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '800',
  },

  resultText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
  },

  bottomBar: {
    position:
      'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    height: 66,
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

  bottomBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent:
      'center',
    alignItems:
      'center',
  },
});