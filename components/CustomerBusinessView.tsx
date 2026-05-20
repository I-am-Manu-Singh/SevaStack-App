import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';

import {
  Stack,
  useRouter,
} from 'expo-router';

import {
  Star,
  MapPin,
  ShieldCheck,
  Sparkles,
  Utensils,
  Home,
  BookOpen,
  Shirt,
  Scissors,
  Dumbbell,
  Car,
  Truck,
  HeartPulse,
  Coffee,
  AlertCircle,
  CheckCircle2,
  Clock3,
} from 'lucide-react-native';

import {
  LinearGradient,
} from 'expo-linear-gradient';

import {
  GlassCard,
} from '@/components/GlassCard';

import {
  useApp,
} from '@/lib/AppContext';

import {
  supabase,
} from '@/lib/supabase';

// ======================================================
// TYPES
// ======================================================

interface CustomerBusinessViewProps {
  type: string;
}

// ======================================================
// SCREEN
// ======================================================

export function CustomerBusinessView({
  type,
}: CustomerBusinessViewProps) {
  const {
    colors,
    profile,
    catalog,
  } = useApp();

  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    activeRecords,
    setActiveRecords,
  ] = useState<any[]>([]);

  const [
    dbServices,
    setDbServices,
  ] = useState<any[]>([]);

  // ======================================================
  // FORM STATES
  // ======================================================

  const [
    selectedPlan,
    setSelectedPlan,
  ] = useState(
    'Standard'
  );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState('Today');

  const [
    selectedTime,
    setSelectedTime,
  ] = useState(
    '12:00 PM'
  );

  const [
    specialInstructions,
    setSpecialInstructions,
  ] = useState('');

  const [
    contactNumber,
    setContactNumber,
  ] = useState(
    profile?.phone || ''
  );

  const [
    roomType,
    setRoomType,
  ] = useState(
    'Double Sharing'
  );

  const [
    serviceType,
    setServiceType,
  ] = useState(
    'Wash & Iron'
  );

  const [
    itemsCount,
    setItemsCount,
  ] = useState('5');

  const [
    extraDetail,
    setExtraDetail,
  ] = useState('');

  // ======================================================
  // FETCH SERVICES
  // ======================================================

  useEffect(() => {
    async function fetchServices() {
      try {
        const {
          data,
        } = await supabase
          .from('services')
          .select('*')
          .eq(
            'business_type',
            type
          );

        if (data) {
          setDbServices(data);
        }
      } catch (err) {
        console.log(err);
      }
    }

    fetchServices();
  }, [type]);

  // ======================================================
  // MERGED CATALOG
  // ======================================================

  const mergedCatalog =
    useMemo(() => {
      const localCatalog =
        (
          catalog || []
        ).filter(
          (item) =>
            item.businessType ===
            type
        );

      const merged = [
        ...dbServices.map(
          (item: any) => ({
            id: item.id,
            name: item.name,
            price:
              parseFloat(
                item.price
              ) || 0,
            image:
              item.image,
            category:
              item.category,
            unit:
              item.unit,
          })
        ),
      ];

      localCatalog.forEach(
        (localItem) => {
          const exists =
            merged.some(
              (dbItem) =>
                dbItem.name.toLowerCase() ===
                localItem.name.toLowerCase()
            );

          if (!exists) {
            merged.push(
              localItem
            );
          }
        }
      );

      return merged;
    }, [
      catalog,
      dbServices,
      type,
    ]);

  // ======================================================
  // FETCH ACTIVE BOOKINGS
  // ======================================================

  useEffect(() => {
    async function fetchBookings() {
      if (!profile?.id)
        return;

      setLoading(true);

      try {
        const {
          data,
        } = await supabase
          .from(
            'appointments'
          )
          .select('*')
          .eq(
            'customer_name',
            profile.full_name
          )
          .eq(
            'business_type',
            type
          );

        setActiveRecords(
          data || []
        );
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [profile, type]);

  // ======================================================
  // SUBMIT BOOKING
  // ======================================================

  const handleCreateBooking =
    async () => {
      if (submitting)
        return;

      try {
        setSubmitting(true);

        const {
          error,
        } = await supabase
          .from(
            'appointments'
          )
          .insert([
            {
              customer_name:
                profile?.full_name ||
                'Student',

              service:
                selectedPlan,

              business_type:
                type,

              booking_date:
                selectedDate,

              time:
                selectedTime,

              contact:
                contactNumber,

              notes:
                specialInstructions,

              room_type:
                roomType,

              service_type:
                serviceType,

              item_count:
                itemsCount,

              extra_detail:
                extraDetail,

              status:
                'Pending',
            },
          ]);

        if (error)
          throw error;

        Alert.alert(
          'Booking Created',
          `${type} request submitted successfully. Humanity survives another form submission. Barely.`,
          [
            {
              text: 'OK',
              onPress: () =>
                router.back(),
            },
          ]
        );
      } catch (err: any) {
        Alert.alert(
          'Error',
          err.message
        );
      } finally {
        setSubmitting(false);
      }
    };

  // ======================================================
  // ICON
  // ======================================================

  const getIcon = () => {
    switch (type) {
      case 'Tiffin':
        return (
          <Utensils
            size={28}
            color={
              colors.primary
            }
          />
        );

      case 'Hostel':
        return (
          <Home
            size={28}
            color={
              colors.primary
            }
          />
        );

      case 'Library':
        return (
          <BookOpen
            size={28}
            color={
              colors.primary
            }
          />
        );

      case 'Laundry':
        return (
          <Shirt
            size={28}
            color={
              colors.primary
            }
          />
        );

      case 'Barber':
        return (
          <Scissors
            size={28}
            color={
              colors.primary
            }
          />
        );

      case 'Gym':
        return (
          <Dumbbell
            size={28}
            color={
              colors.primary
            }
          />
        );

      case 'Travel':
        return (
          <Car
            size={28}
            color={
              colors.primary
            }
          />
        );

      case 'Transport':
        return (
          <Truck
            size={28}
            color={
              colors.primary
            }
          />
        );

      case 'Chemist':
        return (
          <HeartPulse
            size={28}
            color={
              colors.primary
            }
          />
        );

      case 'Cafe':
        return (
          <Coffee
            size={28}
            color={
              colors.primary
            }
          />
        );

      default:
        return (
          <Sparkles
            size={28}
            color={
              colors.primary
            }
          />
        );
    }
  };

  // ======================================================
  // UI
  // ======================================================

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
      <Stack.Screen
        options={{
          title: `${type} Booking`,
          headerTintColor:
            colors.primary,

          headerStyle: {
            backgroundColor:
              colors.background,
          },

          headerTitleStyle:
            {
              color:
                colors.text,

              fontWeight:
                '800',
            },
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* ====================================================== */}
        {/* TOP CARD */}
        {/* ====================================================== */}

        <GlassCard
          style={
            styles.topCard
          }
        >
          <LinearGradient
            colors={[
              colors.primary +
                '20',
              'transparent',
            ]}
            style={
              styles.gradientBg
            }
          />

          <View
            style={
              styles.topRow
            }
          >
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor:
                    colors.primary +
                    '15',
                },
              ]}
            >
              {getIcon()}
            </View>

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={[
                  styles.businessTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Verified Kota{' '}
                {type} Hub
              </Text>

              <View
                style={
                  styles.ratingRow
                }
              >
                <Star
                  size={13}
                  color="#F59E0B"
                  fill="#F59E0B"
                />

                <Text
                  style={{
                    color:
                      colors.text,

                    fontSize: 12,
                    fontWeight:
                      '700',
                  }}
                >
                  4.8
                </Text>

                <MapPin
                  size={11}
                  color={
                    colors.textMuted
                  }
                />

                <Text
                  style={{
                    color:
                      colors.textMuted,

                    fontSize: 11,
                  }}
                >
                  Kota Coaching
                  Zone
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.verifiedBadge,
                {
                  backgroundColor:
                    colors.success +
                    '15',
                },
              ]}
            >
              <ShieldCheck
                size={13}
                color={
                  colors.success
                }
              />

              <Text
                style={{
                  color:
                    colors.success,

                  fontSize: 10,
                  fontWeight:
                    '800',
                }}
              >
                VERIFIED
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* ====================================================== */}
        {/* CATALOG */}
        {/* ====================================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                colors.text,
            },
          ]}
        >
          Catalog & Services
        </Text>

       <View style={styles.catalogGrid}>
  {mergedCatalog.map(
    (item: any) => {
      const selected =
        selectedPlan ===
        item.name;

      return (
        <TouchableOpacity
          activeOpacity={0.9}
          key={item.id}
          onPress={() =>
            setSelectedPlan(
              item.name
            )
          }
          style={[
            styles.gridCard,
            {
              borderColor:
                selected
                  ? colors.primary
                  : colors.border,

              backgroundColor:
                colors.surface,
            },
          ]}
        >
          {/* IMAGE */}

          <Image
            source={{
              uri:
                item.image ||
                'https://images.unsplash.com/photo-1521566652839-697aa473761a?w=400&q=80',
            }}
            style={
              styles.gridImage
            }
          />

          {/* CATEGORY */}

          {item.category && (
            <View
              style={[
                styles.gridBadge,
                {
                  backgroundColor:
                    colors.primary +
                    '15',
                },
              ]}
            >
              <Text
                style={{
                  color:
                    colors.primary,

                  fontSize: 9,
                  fontWeight:
                    '800',
                }}
              >
                {
                  item.category
                }
              </Text>
            </View>
          )}

          {/* CONTENT */}

          <View
            style={
              styles.gridContent
            }
          >
            <Text
              numberOfLines={2}
              style={[
                styles.gridName,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {item.name}
            </Text>

            <Text
              style={[
                styles.gridPrice,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              ₹{item.price}
            </Text>
          </View>

          {/* BUTTON */}

          <View
            style={[
              styles.gridBtn,
              {
                backgroundColor:
                  selected
                    ? colors.primary
                    : colors.primary +
                      '12',
              },
            ]}
          >
            <Text
              style={{
                color: selected
                  ? '#FFF'
                  : colors.primary,

                fontSize: 11,
                fontWeight:
                  '800',
              }}
            >
              {selected
                ? 'Selected'
                : 'Select'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  )}
</View> 

        {/* ====================================================== */}
        {/* BOOKING FORM */}
        {/* ====================================================== */}

        <GlassCard
          style={
            styles.formCard
          }
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,

                marginTop: 0,
              },
            ]}
          >
            Booking Details
          </Text>

          {/* TIFFIN */}

          {type ===
            'Tiffin' && (
            <View
              style={
                styles.formGap
              }
            >
              <Text
                style={[
                  styles.label,
                  {
                    color:
                      colors.textMuted,
                  },
                ]}
              >
                Meal Plan
              </Text>

              <View
                style={
                  styles.optionRow
                }
              >
                {[
                  'Basic Veg',
                  'Standard',
                  'Premium',
                ].map(
                  (
                    item
                  ) => {
                    const selected =
                      selectedPlan ===
                      item;

                    return (
                      <TouchableOpacity
                        key={
                          item
                        }
                        onPress={() =>
                          setSelectedPlan(
                            item
                          )
                        }
                        style={[
                          styles.optionBtn,
                          {
                            borderColor:
                              selected
                                ? colors.primary
                                : colors.border,

                            backgroundColor:
                              selected
                                ? colors.primary +
                                  '15'
                                : 'transparent',
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              selected
                                ? colors.primary
                                : colors.text,

                            fontSize: 12,

                            fontWeight:
                              '700',
                          }}
                        >
                          {
                            item
                          }
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>
            </View>
          )}

          {/* HOSTEL */}

          {type ===
            'Hostel' && (
            <View
              style={
                styles.formGap
              }
            >
              <Text
                style={[
                  styles.label,
                  {
                    color:
                      colors.textMuted,
                  },
                ]}
              >
                Room Type
              </Text>

              <View
                style={
                  styles.optionRow
                }
              >
                {[
                  'Single AC',
                  'Double Sharing',
                  'Single Non-AC',
                ].map(
                  (
                    item
                  ) => {
                    const selected =
                      roomType ===
                      item;

                    return (
                      <TouchableOpacity
                        key={
                          item
                        }
                        onPress={() =>
                          setRoomType(
                            item
                          )
                        }
                        style={[
                          styles.optionBtn,
                          {
                            borderColor:
                              selected
                                ? colors.primary
                                : colors.border,

                            backgroundColor:
                              selected
                                ? colors.primary +
                                  '15'
                                : 'transparent',
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              selected
                                ? colors.primary
                                : colors.text,

                            fontSize: 12,

                            fontWeight:
                              '700',
                          }}
                        >
                          {
                            item
                          }
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>
            </View>
          )}

          {/* LAUNDRY */}

          {type ===
            'Laundry' && (
            <View
              style={
                styles.formGap
              }
            >
              <Text
                style={[
                  styles.label,
                  {
                    color:
                      colors.textMuted,
                  },
                ]}
              >
                Service Type
              </Text>

              <View
                style={
                  styles.optionRow
                }
              >
                {[
                  'Wash & Iron',
                  'Dry Cleaning',
                  'Steam Press',
                ].map(
                  (
                    item
                  ) => {
                    const selected =
                      serviceType ===
                      item;

                    return (
                      <TouchableOpacity
                        key={
                          item
                        }
                        onPress={() =>
                          setServiceType(
                            item
                          )
                        }
                        style={[
                          styles.optionBtn,
                          {
                            borderColor:
                              selected
                                ? colors.primary
                                : colors.border,

                            backgroundColor:
                              selected
                                ? colors.primary +
                                  '15'
                                : 'transparent',
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              selected
                                ? colors.primary
                                : colors.text,

                            fontSize: 12,

                            fontWeight:
                              '700',
                          }}
                        >
                          {
                            item
                          }
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>

              <TextInput
                value={
                  itemsCount
                }
                onChangeText={
                  setItemsCount
                }
                keyboardType="numeric"
                placeholder="Number of items"
                placeholderTextColor={
                  colors.textMuted
                }
                style={[
                  styles.input,
                  {
                    color:
                      colors.text,

                    borderColor:
                      colors.border,
                  },
                ]}
              />
            </View>
          )}

          {/* COMMON */}

          <View
            style={
              styles.formGap
            }
          >
            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              Select Date
            </Text>

            <View
              style={
                styles.optionRow
              }
            >
              {[
                'Today',
                'Tomorrow',
                'Day After',
              ].map(
                (item) => {
                  const selected =
                    selectedDate ===
                    item;

                  return (
                    <TouchableOpacity
                      key={
                        item
                      }
                      onPress={() =>
                        setSelectedDate(
                          item
                        )
                      }
                      style={[
                        styles.optionBtn,
                        {
                          borderColor:
                            selected
                              ? colors.primary
                              : colors.border,

                          backgroundColor:
                            selected
                              ? colors.primary +
                                '15'
                              : 'transparent',
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            selected
                              ? colors.primary
                              : colors.text,

                          fontSize: 12,

                          fontWeight:
                            '700',
                        }}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>

            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              Time Slot
            </Text>

            <View
              style={
                styles.optionRow
              }
            >
              {[
                '10:00 AM',
                '12:00 PM',
                '02:00 PM',
                '05:00 PM',
                '08:00 PM',
              ].map(
                (item) => {
                  const selected =
                    selectedTime ===
                    item;

                  return (
                    <TouchableOpacity
                      key={
                        item
                      }
                      onPress={() =>
                        setSelectedTime(
                          item
                        )
                      }
                      style={[
                        styles.optionBtn,
                        {
                          borderColor:
                            selected
                              ? colors.primary
                              : colors.border,

                          backgroundColor:
                            selected
                              ? colors.primary +
                                '15'
                              : 'transparent',
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            selected
                              ? colors.primary
                              : colors.text,

                          fontSize: 12,

                          fontWeight:
                            '700',
                        }}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>

            <TextInput
              value={
                contactNumber
              }
              onChangeText={
                setContactNumber
              }
              keyboardType="phone-pad"
              placeholder="Contact Number"
              placeholderTextColor={
                colors.textMuted
              }
              style={[
                styles.input,
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
                specialInstructions
              }
              onChangeText={
                setSpecialInstructions
              }
              placeholder="Special requests / notes"
              multiline
              placeholderTextColor={
                colors.textMuted
              }
              style={[
                styles.textArea,
                {
                  color:
                    colors.text,

                  borderColor:
                    colors.border,
                },
              ]}
            />
          </View>

          <TouchableOpacity
            onPress={
              handleCreateBooking
            }
            style={[
              styles.submitBtn,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            {submitting ? (
              <ActivityIndicator
                size="small"
                color="#FFF"
              />
            ) : (
              <Text
                style={
                  styles.submitText
                }
              >
                Confirm Booking
              </Text>
            )}
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    scrollContent: {
      padding: 16,
      paddingBottom: 80,
    },

    topCard: {
      padding: 18,
      overflow:
        'hidden',
      marginBottom: 20,
    },

    gradientBg: {
      position:
        'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },

    topRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 14,
    },

    iconWrap: {
      width: 60,
      height: 60,
      borderRadius: 18,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    businessTitle: {
      fontSize: 16,
      fontWeight: '800',
    },

    ratingRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 6,
      marginTop: 6,
    },

    verifiedBadge: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 14,
    },

  catalogCard: {
  flexDirection: 'row',
  flex: 1,
  alignItems: 'center',
  paddingVertical: 8,
  paddingHorizontal: 10,
  borderRadius: 16,
  gap: 10,
  minHeight: 78,
},

  catalogImage: {
  width: 52,
  height: 52,
  borderRadius: 12,
},
catalogInfo: {
  flex: 1,
  justifyContent: 'center',
},

catalogTopRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,

},

catalogName: {
  flex: 1,
  fontSize: 13,
  fontWeight: '800',

},

catalogPrice: {
  fontSize: 11,
  marginTop: 4,
  fontWeight: '700',
},

categoryBadge: {
  paddingHorizontal: 6,
  paddingVertical: 3,
  borderRadius: 6,
},

selectBtn: {
  minWidth: 58,
  height: 32,
  paddingHorizontal: 12,
  borderRadius: 10,
  borderWidth: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
    formCard: {
      padding: 18,
      marginTop: 20,
    },

    formGap: {
      gap: 16,
      marginBottom: 20,
    },

    label: {
      fontSize: 11,
      fontWeight: '800',
      marginBottom: 8,
      textTransform:
        'uppercase',
    },

    optionRow: {
      flexDirection:
        'row',
      flexWrap: 'wrap',
      gap: 10,
    },

    optionBtn: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
    },

    input: {
      height: 50,
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 14,
      fontSize: 14,
      fontWeight: '600',
    },
catalogGrid: {

  flexDirection: 'row',

  flexWrap: 'wrap',

  justifyContent: 'space-between',

  gap: 12,

},

gridCard: {

  width: '48%',

  borderWidth: 1,

  borderRadius: 18,

  overflow: 'hidden',

  paddingBottom: 12,

},

gridImage: {

  width: '100%',

  height: 110,

},

gridBadge: {

  position: 'absolute',

  top: 10,

  left: 10,

  paddingHorizontal: 8,

  paddingVertical: 4,

  borderRadius: 8,

},

gridContent: {

  paddingHorizontal: 12,

  paddingTop: 10,

},

gridName: {

  fontSize: 13,

  fontWeight: '800',

  minHeight: 36,

},

gridPrice: {

  marginTop: 6,

  fontSize: 12,

  fontWeight: '700',

},

gridBtn: {

  marginTop: 12,

  marginHorizontal: 12,

  height: 34,

  borderRadius: 10,

  justifyContent: 'center',

  alignItems: 'center',

},
    textArea: {
      minHeight: 100,
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 14,
      fontSize: 14,
      fontWeight: '600',
      textAlignVertical:
        'top',
    },

    submitBtn: {
      height: 54,
      borderRadius: 16,
      justifyContent:
        'center',
      alignItems:
        'center',
      marginTop: 8,
    },

    submitText: {
      color: '#FFF',
      fontSize: 14,
      fontWeight: '800',
    },
  });