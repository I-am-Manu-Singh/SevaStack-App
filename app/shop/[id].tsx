import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { 
  Star, 
  Clock, 
  MapPin, 
  Share2, 
  Heart, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  Tag,
  Plus,
  Minus,
  ArrowLeft,
  X,
  CreditCard,
  ShoppingBag
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { G } from '@/styles/global';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

const SHOP_INFO: Record<string, { name: string; desc: string; address: string; image: string }> = {
  Barber: { name: "The Royal Cut", desc: "Top styled haircuts and shaves", address: "Phase 7, Mohali, Punjab", image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80" },
  Tailor: { name: "Elite Tailors", desc: "Premium bespoke clothing & stitching", address: "Sector 62, Mohali, Punjab", image: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=800&q=80" },
  Laundry: { name: "Quick Wash Laundry", desc: "Express washing & premium steam press", address: "Sector 70, Mohali, Punjab", image: "https://images.unsplash.com/photo-1545180856-f2868ff128c7?w=800&q=80" },
  Tiffin: { name: "Sharma Tiffin Mess", desc: "Healthy home cooked student meals", address: "Kota Hub Main Road, Rajasthan", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80" },
  Library: { name: "Kota Library Hub", desc: "Quiet focus desks with high speed WiFi", address: "Landmark City, Kota, Rajasthan", image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80" },
  Stationery: { name: "Saraswati Stationery", desc: "Syllabus printouts and book sets", address: "Talwandi Market, Kota, Rajasthan", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80" }
};

export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors, theme, t, catalog, triggerNotification } = useApp();
  
  const businessType = id as string; // 'Barber', 'Tiffin', 'Laundry', etc.
  const info = SHOP_INFO[businessType] || { 
    name: `${businessType} Shop`, 
    desc: "Partner business ecosystem", 
    address: "Kota Student District, Rajasthan", 
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80" 
  };

  // Cart state
  const [cart, setCart] = React.useState<Record<string, { service: any; quantity: number }>>({});
  
  // Checkout Modal State
  const [isCheckoutVisible, setIsCheckoutVisible] = React.useState(false);
  const [timeSlot, setTimeSlot] = React.useState('10:00 AM');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<'cash' | 'upi' | 'khata'>('cash');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Dynamic services fetch
  const [dbServices, setDbServices] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    async function loadDbServices() {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('services')
          .select('*')
          .eq('business_type', businessType);
        if (data && data.length > 0) {
          setDbServices(data);
        }
      } catch (err) {
        console.log("Error fetching DB services:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDbServices();
  }, [businessType]);

  // Combine DB services and initial fallback catalog items matching this businessType
  const filteredCatalog = catalog.filter(item => 
    item.businessType === businessType || 
    (businessType === 'Food' && item.businessType === 'Tiffin') || 
    (businessType === 'Books' && item.businessType === 'Stationery')
  );

  const mergedServices: any[] = [...dbServices.map(d => ({
    id: d.id,
    name: d.name,
    price: parseFloat(d.price),
    category: d.category || 'General',
    unit: d.unit || 'session',
    image: d.image || 'https://images.unsplash.com/photo-1521566652839-697aa473761a?w=400&q=80'
  }))];

  filteredCatalog.forEach(c => {
    if (!mergedServices.some(m => m.name.toLowerCase() === c.name.toLowerCase())) {
      mergedServices.push({
        id: c.id,
        name: c.name,
        price: c.price,
        category: c.category,
        unit: c.unit,
        image: c.image
      });
    }
  });

  // Cart operations
  const addToCart = (service: any) => {
    setCart(prev => {
      const existing = prev[service.id];
      if (existing) {
        return { ...prev, [service.id]: { ...existing, quantity: existing.quantity + 1 } };
      }
      return { ...prev, [service.id]: { service, quantity: 1 } };
    });
  };

  const removeFromCart = (serviceId: string) => {
    setCart(prev => {
      const existing = prev[serviceId];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const next = { ...prev };
        delete next[serviceId];
        return next;
      }
      return { ...prev, [serviceId]: { ...existing, quantity: existing.quantity - 1 } };
    });
  };

  const cartItems = Object.values(cart);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.service.price * item.quantity), 0);

  // Submit appointment / checkout booking
  const handlePlaceOrder = async () => {
    if (totalItems === 0) {
      Alert.alert("Cart Empty", "Please add at least one service to book.");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Required", "Please enter your contact phone number.");
      return;
    }
    if (!address.trim()) {
      Alert.alert("Required", "Please enter your delivery/hostel address.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Find merchant matching business_type in Supabase
       const { data: merchants } = await supabase
        .from('merchants')
        .select('*')
        .eq('business_type', businessType)
        .limit(1);

      const targetMerchantId = merchants && merchants.length > 0 ? merchants[0].id : null;
      const targetBusinessName = merchants && merchants.length > 0 ? merchants[0].business_name : info.name;

      const servicesSummary = cartItems.map(item => `${item.service.name} x${item.quantity}`).join(', ');

      // 2. Insert appointment record
      const appointmentObj = {
        merchant_id: targetMerchantId,
        customer_name: `Room ${address} (${phone})`,
        service: servicesSummary,
        time: timeSlot,
        price: totalPrice,
        status: 'pending',
        business_type: businessType
      };

      const { data: aptData, error: aptError } = await supabase
        .from('appointments')
        .insert([appointmentObj])
        .select()
        .single();

      if (aptError) throw aptError;

      // 3. If Khata Book selected, create a ledger entry
      if (paymentMethod === 'khata' && targetMerchantId) {
        const { error: khataError } = await supabase
          .from('khata_records')
          .insert([{
            merchant_id: targetMerchantId,
            amount: totalPrice,
            description: `On-Credit Order: ${servicesSummary}`,
            type: 'income',
            date: new Date().toISOString().split('T')[0]
          }]);
        
        if (khataError) console.warn("Could not log to Khata ledger:", khataError.message);
      }

      // 4. Trigger notification
      await triggerNotification(
        'order', 
        t('order_success_title'), 
        `New order placed at ${targetBusinessName} for ${servicesSummary} via ${paymentMethod.toUpperCase()}`
      );

      // Reset cart and close checkout
      setCart({});
      setIsCheckoutVisible(false);
      Alert.alert(t('order_success_title'), t('order_success_msg'));
      router.back();
    } catch (e: any) {
      Alert.alert("Order Failed", e.message || "Failed to register booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <View
    style={[
      G.safeArea,
      {
        backgroundColor: colors.background,
      },
    ]}
  >
    <Stack.Screen
      options={{
        headerShown: false,
      }}
    />

   {/* FLOATING PREMIUM TOP BAR */}

<View style={styles.floatingTopBar}>
 <TouchableOpacity
  onPress={() => router.back()}
  activeOpacity={0.85}
  style={[
    styles.headerCircleBtn,
    {
      backgroundColor:
        theme === 'dark'
          ? 'rgba(15,23,42,0.88)'
          : 'rgba(255,255,255,0.96)',

      borderColor:
        theme === 'dark'
          ? 'rgba(255,255,255,0.16)'
          : 'rgba(0,0,0,0.08)',

      borderWidth: 1,

      shadowColor: '#000',

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity: 0.18,
      shadowRadius: 10,

      elevation: 12,
    },
  ]}
>
  <ArrowLeft
    size={22}
    strokeWidth={2.8}
    color={
      theme === 'dark'
        ? '#FFFFFF'
        : '#111827'
    }
  />
</TouchableOpacity>

  <View style={styles.floatingActionGroup}>
    <TouchableOpacity
      style={[
        styles.headerCircleBtn,
        {
          backgroundColor:
            theme === 'dark'
              ? 'rgba(15,23,42,0.55)'
              : 'rgba(255,255,255,0.75)',

          borderColor:
            theme === 'dark'
              ? 'rgba(255,255,255,0.12)'
              : 'rgba(0,0,0,0.08)',
        },
      ]}
      activeOpacity={0.85}
    >
      <Share2
        size={18}
        color={
          theme === 'dark'
            ? '#FFF'
            : colors.text
        }
      />
    </TouchableOpacity>

    <TouchableOpacity
      style={[
        styles.headerCircleBtn,
        {
          backgroundColor:
            theme === 'dark'
              ? 'rgba(15,23,42,0.55)'
              : 'rgba(255,255,255,0.75)',

          borderColor:
            theme === 'dark'
              ? 'rgba(255,255,255,0.12)'
              : 'rgba(0,0,0,0.08)',
        },
      ]}
      activeOpacity={0.85}
    >
      <Heart
        size={18}
        color={
          theme === 'dark'
            ? '#FFF'
            : colors.text
        }
      />
    </TouchableOpacity>
  </View>
</View>

    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingBottom: 160,
      }}
    >
      {/* HERO IMAGE */}

      <View style={styles.coverContainer}>
        <Image
          source={{
            uri: info.image,
          }}
          style={styles.coverImage}
        />

        <LinearGradient
          colors={[
            'rgba(0,0,0,0)',
            'rgba(0,0,0,0.18)',
            'rgba(15,23,42,0.85)',
            colors.background,
          ]}
          locations={[0, 0.35, 0.75, 1]}
          style={styles.coverGradient}
        />

        {/* HERO CONTENT */}

        <View style={styles.shopMetaOverlay}>
          <View style={styles.badgeRow}>
            <View style={styles.verifiedBadge}>
              <ShieldCheck
                size={12}
                color="#34D399"
              />

              <Text style={styles.verifiedText}>
                Verified Partner
              </Text>
            </View>

            <View style={styles.trendingBadge}>
              <TrendingUp
                size={12}
                color="#FFF"
              />

              <Text style={styles.trendingText}>
                Trending
              </Text>
            </View>
          </View>

          <Text style={styles.shopName}>
            {info.name}
          </Text>

          <Text style={styles.shopDesc}>
            {info.desc}
          </Text>

          <View style={styles.ratingRow}>
            <Star
              size={14}
              color="#FBBF24"
              fill="#FBBF24"
            />

            <Text style={styles.ratingText}>
              4.9 (120+ reviews)
            </Text>

            <Text style={styles.dot}>
              •
            </Text>

            <Text style={styles.distanceText}>
              0.5 km away
            </Text>
          </View>
        </View>
      </View>

      {/* PREMIUM OFFER BANNER */}

      <View style={styles.boostBanner}>
        <LinearGradient
          colors={[
            colors.primary,
            colors.accent,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerGradient}
        >
          <View style={styles.bannerContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>
                Grand Opening Offer
              </Text>

              <Text style={styles.bannerSubtitle}>
                Get 20% OFF on your first
                SevaStack booking payment.
              </Text>
            </View>

            <View style={styles.promoCode}>
              <Tag
                size={12}
                color="#FFF"
              />

              <Text style={styles.codeText}>
                SEVA20
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* SERVICES */}

     <View style={styles.sectionContainer}>
    <Text
  style={[
    styles.sectionTitle,
    {
      color: colors.text,
    },
  ]}
>
          Explore Services
        </Text>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{
              marginTop: 40,
            }}
          />
        ) : (
          <View
            style={{
              gap: 16,
            }}
          >
            {mergedServices.map(
              (service) => {
                const cartItem =
                  cart[service.id];

                return (
                  <GlassCard
                    key={service.id}
                    style={[
                      styles.productCard,
                      {
                        borderColor:
                          colors.border,
                      },
                    ]}
                  >
                    <View
                      style={
                        styles.productMain
                      }
                    >
                      <View
                        style={
                          styles.productInfo
                        }
                      >
                        <Text
                          numberOfLines={2}
                          style={[
                            styles.productName,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {service.name}
                        </Text>

                        <View
                          style={
                            styles.metaRow
                          }
                        >
                          <Clock
                            size={12}
                            color={
                              colors.textMuted
                            }
                          />

                          <Text
                            style={[
                              styles.durationText,
                              {
                                color:
                                  colors.textMuted,
                              },
                            ]}
                          >
                            {service.unit ||
                              'session'}
                          </Text>
                        </View>

                        <Text
                          style={[
                            styles.price,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          ₹{service.price}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.productImageContainer
                        }
                      >
                        <Image
                          source={{
                            uri:
                              service.image,
                          }}
                          style={
                            styles.productImage
                          }
                        />

                        {cartItem ? (
                          <View
                            style={[
                              styles.quantityContainer,
                              {
                                borderColor:
                                  colors.primary,
                              },
                            ]}
                          >
                            <TouchableOpacity
                              onPress={() =>
                                removeFromCart(
                                  service.id
                                )
                              }
                              style={
                                styles.qtyBtn
                              }
                            >
                              <Minus
                                size={14}
                                color={
                                  colors.primary
                                }
                              />
                            </TouchableOpacity>

                           <Text style={styles.qtyText}>
                              {
                                cartItem.quantity
                              }
                            </Text>

                            <TouchableOpacity
                              onPress={() =>
                                addToCart(
                                  service
                                )
                              }
                              style={
                                styles.qtyBtn
                              }
                            >
                              <Plus
                                size={14}
                                color={
                                  colors.primary
                                }
                              />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            activeOpacity={
                              0.85
                            }
                            onPress={() =>
                              addToCart(
                                service
                              )
                            }
                            style={[
                              styles.addBtn,
                              {
                                borderColor:
                                  colors.primary,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.addBtnText,
                                {
                                  color:
                                    colors.primary,
                                },
                              ]}
                            >
                              ADD +
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </GlassCard>
                );
              }
            )}
          </View>
        )}
      </View>

     {/* INFO SECTION */}

<View style={styles.sectionContainer}>
  <Text
    style={[
      styles.sectionTitle,
      {
        color: colors.text,
      },
    ]}
  >
    Location & Timing
  </Text>

  <GlassCard
    style={[
      styles.infoCard,
      {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      },
    ]}
  >
    <View style={styles.infoRow}>
      <View
        style={[
          styles.infoIconWrap,
          {
            backgroundColor:
              `${colors.primary}15`,
          },
        ]}
      >
        <MapPin
          size={18}
          color={colors.primary}
        />
      </View>

      <View style={styles.infoTextWrap}>
        <Text
          style={[
            styles.infoTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Landmark
        </Text>

        <Text
          style={[
            styles.infoSub,
            {
              color:
                colors.textMuted,
            },
          ]}
        >
          {info.address}
        </Text>
      </View>
    </View>

    <View
      style={[
        styles.divider,
        {
          backgroundColor:
            colors.border,
        },
      ]}
    />

    <View style={styles.infoRow}>
      <View
        style={[
          styles.infoIconWrap,
          {
            backgroundColor:
              `${colors.primary}15`,
          },
        ]}
      >
        <Clock
          size={18}
          color={colors.primary}
        />
      </View>

      <View style={styles.infoTextWrap}>
        <Text
          style={[
            styles.infoTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Open Today
        </Text>

        <Text
          style={[
            styles.infoSub,
            {
              color:
                colors.textMuted,
            },
          ]}
        >
          09:00 AM - 08:30 PM
        </Text>
      </View>
    </View>
  </GlassCard>
</View>
    </ScrollView>

    {/* FLOATING CHECKOUT */}

    {totalItems > 0 && (
      <View style={styles.footer}>
        <LinearGradient
          colors={[
            'rgba(15,23,42,0)',
            'rgba(15,23,42,0.75)',
            'rgba(15,23,42,1)',
          ]}
          style={styles.footerGradient}
        />

        <View
          style={[
            styles.checkoutBar,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          <View>
           <Text
  style={[
    styles.itemCount,
    {
      color:
        theme === 'dark'
          ? '#94A3B8'
          : '#475569',
    },
  ]}
>
              {totalItems} items added
            </Text>

            <Text
              style={[
                styles.totalPrice,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              ₹
              {totalPrice.toFixed(2)}
            </Text>
          </View>

          <Button
            title="Book Now"
            onPress={() =>
              setIsCheckoutVisible(
                true
              )
            }
            style={StyleSheet.flatten([
              styles.bookNowBtn,
              {
                backgroundColor:
                  colors.primary,
              },
            ])}
          />
        </View>
      </View>
    )}
  </View>
);
}
// REPLACE THESE BROKEN STYLES COMPLETELY
// Your overlap issue is mainly from:
// 1. negative marginTop on hero
// 2. absolute floating layers without safe spacing
// 3. footer + content not reserving enough height
// 4. hero overlay fighting banner spacing
// Humanity invents flexbox then spends 9 years defeating it with negative margins.

const styles = StyleSheet.create({
  // ======================================================
  // ROOT
  // ======================================================

  screen: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 180,
  },

  // ======================================================
  // FLOATING HEADER
  // ======================================================

  floatingTopBar: {
  position: 'absolute',

  top: 58,
  left: 18,
  right: 18,

  zIndex: 9999,
  elevation: 999,

  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

  floatingActionGroup: {
    flexDirection: 'row',
    gap: 10,
  },

  headerCircleBtn: {
    width: 44,
    height: 44,

    borderRadius: 22,

    backgroundColor: 'rgba(15,23,42,0.55)',

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',

    // Ensure buttons can be pressed
    pointerEvents: 'box-only',
  },

  

  // ======================================================
  // HERO
  // ======================================================

  coverContainer: {
    width: '100%',
    height: 420,

    overflow: 'hidden',

    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,

    backgroundColor: '#111827',
  },

  coverImage: {
    width: '100%',
    height: '100%',

    resizeMode: 'cover',
  },

  coverGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  shopMetaOverlay: {
    position: 'absolute',

    left: 22,
    right: 22,
    bottom: 34,
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 10,

    marginBottom: 14,
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 999,

    backgroundColor: 'rgba(16,185,129,0.16)',

    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.32)',

    gap: 6,
  },

  verifiedText: {
    color: '#D1FAE5',

    fontSize: 11,
    fontWeight: '800',
  },

  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 999,

    backgroundColor: 'rgba(239,68,68,0.2)',

    gap: 6,
  },

  trendingText: {
    color: '#FFF',

    fontSize: 11,
    fontWeight: '800',
  },

  shopName: {
    fontSize: 34,

    fontWeight: '900',

    color: '#FFF',

    letterSpacing: -1.2,
  },

  shopDesc: {
    fontSize: 14,

    lineHeight: 22,

    color: 'rgba(255,255,255,0.85)',

    marginTop: 8,

    fontWeight: '600',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: 14,
  },

  ratingText: {
    color: '#FFF',

    marginLeft: 6,

    fontWeight: '800',

    fontSize: 13,
  },

  dot: {
    color: 'rgba(255,255,255,0.45)',

    marginHorizontal: 8,
  },

  distanceText: {
    color: 'rgba(255,255,255,0.82)',

    fontSize: 12,

    fontWeight: '700',
  },

  // ======================================================
  // OFFER BANNER
  // ======================================================

  boostBanner: {
    paddingHorizontal: 18,

    marginTop: 18,
  },

  bannerGradient: {
    borderRadius: 24,

    padding: 18,

    elevation: 5,
  },

  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  bannerTitle: {
    color: '#FFF',

    fontSize: 17,

    fontWeight: '900',
  },

  bannerSubtitle: {
    color: 'rgba(255,255,255,0.88)',

    marginTop: 4,

    fontSize: 12,

    lineHeight: 18,

    fontWeight: '600',
  },

  promoCode: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 12,
    paddingVertical: 8,

    borderRadius: 14,

    backgroundColor: 'rgba(255,255,255,0.14)',

    gap: 6,
  },

  codeText: {
    color: '#FFF',

    fontWeight: '900',

    letterSpacing: 1,
  },

  // ======================================================
  // SECTION
  // ======================================================

  sectionContainer: {
    paddingHorizontal: 18,

    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 22,

    fontWeight: '900',

    marginBottom: 18,

    letterSpacing: -0.5,
  },

  // ======================================================
  // PRODUCT CARD
  // ======================================================

  productCard: {
    marginBottom: 16,

    borderRadius: 26,

    overflow: 'hidden',

    padding: 0,
  },

  productMain: {
    flexDirection: 'row',

    padding: 14,
  },

  productInfo: {
    flex: 1,

    justifyContent: 'center',

    paddingRight: 12,
  },

  productName: {
    fontSize: 16,

    lineHeight: 22,

    fontWeight: '800',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 6,

    marginTop: 8,
  },

  durationText: {
    fontSize: 11,

    fontWeight: '600',
  },

  price: {
    fontSize: 22,

    fontWeight: '900',

    marginTop: 12,
  },

productImageContainer: {
  width: 110,

  alignItems: 'center',

  paddingBottom: 16,

  overflow: 'visible',
},

  productImage: {
    width: 120,
    height: 120,

    borderRadius: 22,
  },

  addBtn: {
    position: 'absolute',

    bottom: -10,

    backgroundColor: '#FFF',

    borderRadius: 14,

    paddingHorizontal: 18,
    paddingVertical: 8,

    borderWidth: 1,

    elevation: 5,
  },

  addBtnText: {
    fontSize: 11,

    fontWeight: '900',
  },
quantityContainer: {
  position: 'absolute',

  bottom: -12,

  width: 92,
  height: 38,

  borderRadius: 14,

  backgroundColor: '#FFFFFF',

  borderWidth: 1.5,

  flexDirection: 'row',

  alignItems: 'center',
  justifyContent: 'space-between',

  paddingHorizontal: 8,

  shadowColor: '#000',

  shadowOffset: {
    width: 0,
    height: 4,
  },

  shadowOpacity: 0.12,
  shadowRadius: 10,

  elevation: 6,

  zIndex: 50,
},

qtyBtn: {
  width: 26,
  height: 26,

  borderRadius: 13,

  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: 'rgba(99,102,241,0.08)',
},

qtyText: {
  fontSize: 12,
  fontWeight: '900',
  color: 'rgba(89, 106, 137, 1)',
  minWidth: 20,

  textAlign: 'center',
},

  // ======================================================
  // INFO CARD
  // ======================================================

  infoCard: {
    padding: 18,

    borderRadius: 24,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoTextWrap: {
    marginLeft: 14,

    flex: 1,
  },

  infoTitle: {
    fontSize: 14,

    fontWeight: '800',
  },

  infoSub: {
    fontSize: 12,

    marginTop: 4,

    lineHeight: 18,
  },

  divider: {
    height: 1,

    marginVertical: 18,
  },

  // ======================================================
  // CHECKOUT FOOTER
  // ======================================================

  footer: {
    position: 'absolute',

    left: 0,
    right: 0,
    bottom: 0,

    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  footerGradient: {
    ...StyleSheet.absoluteFillObject,
  },

 checkoutBar: {
  borderRadius: 24,

  paddingHorizontal: 18,
  paddingVertical: 16,

  borderWidth: 1,

  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',

  shadowColor: '#000',

  shadowOffset: {
    width: 0,
    height: 10,
  },

  shadowOpacity: 0.16,
  shadowRadius: 18,

  elevation: 12,
},


  totalPrice: {
    fontSize: 24,

    fontWeight: '900',

    marginTop: 4,
  },

  bookNowBtn: {
    height: 52,

    paddingHorizontal: 28,

    borderRadius: 18,
  },

  // ======================================================
  // MODAL
  // ======================================================

  modalOverlay: {
    flex: 1,

    backgroundColor: 'rgba(0,0,0,0.6)',

    justifyContent: 'flex-end',
  },

  modalCard: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,

    padding: 20,

    maxHeight: '88%',
  },

  modalHeader: {
    flexDirection: 'row',

    justifyContent: 'space-between',
    alignItems: 'center',

    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 20,

    fontWeight: '900',
  },

  summaryItem: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    marginBottom: 10,
  },

  summaryName: {
    fontSize: 13,

    fontWeight: '600',
  },

  summaryPrice: {
    fontSize: 13,

    fontWeight: '800',
  },
itemCount: {

  fontSize: 12,

  fontWeight: '700',

  marginBottom: 2,

},
  totalLabel: {
    fontSize: 15,

    fontWeight: '800',
  },

  totalValue: {
    fontSize: 18,

    fontWeight: '900',
  },

  inputLabel: {
    fontSize: 11,

    fontWeight: '800',

    marginBottom: 8,

    textTransform: 'uppercase',

    letterSpacing: 0.8,
  },

  modalInput: {
    height: 52,

    borderRadius: 16,

    borderWidth: 1,

    paddingHorizontal: 14,

    fontSize: 14,

    marginBottom: 16,
  },

  paymentMethods: {
    flexDirection: 'row',

    gap: 10,

    marginBottom: 22,
  },

  methodBtn: {
    flex: 1,

    paddingVertical: 12,

    borderRadius: 14,

    borderWidth: 1,

    alignItems: 'center',
  },

  methodText: {
    fontSize: 11,

    fontWeight: '800',
  },

  modalButtons: {
    flexDirection: 'row',

    gap: 10,
  },

  modalCancelBtn: {
    flex: 1,

    height: 50,

    borderRadius: 16,

    justifyContent: 'center',
    alignItems: 'center',
  },

  modalSubmitBtn: {
    flex: 1,

    height: 50,

    borderRadius: 16,

    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCancelText: {
    fontSize: 14,

    fontWeight: '800',
  },

  modalSubmitText: {
    color: '#FFF',

    fontSize: 14,

    fontWeight: '900',
  },
  infoIconWrap: {
  width: 42,
  height: 42,

  borderRadius: 14,

  justifyContent: 'center',
  alignItems: 'center',
},
});