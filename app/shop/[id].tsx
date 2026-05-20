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
    <View style={[G.safeArea, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ 
        headerTransparent: true, 
        headerTitle: '',
        headerTintColor: '#FFF',
        headerRight: () => (
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerCircleBtn}><Share2 size={18} color="#FFF" /></TouchableOpacity>
            <TouchableOpacity style={styles.headerCircleBtn}><Heart size={18} color="#FFF" /></TouchableOpacity>
          </View>
        )
      }} />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image 
            source={{ uri: info.image }} 
            style={styles.coverImage} 
          />
          <LinearGradient
            colors={['transparent', 'rgba(15, 23, 42, 0.7)', colors.background]}
            style={styles.coverGradient}
          />
          <View style={styles.shopMetaOverlay}>
            <View style={styles.badgeRow}>
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={12} color={colors.accent} />
                <Text style={styles.verifiedText}>Seva Verified</Text>
              </View>
              <View style={styles.trendingBadge}>
                <TrendingUp size={12} color="#FFF" />
                <Text style={styles.trendingText}>{t('trending')}</Text>
              </View>
            </View>
            <Text style={styles.shopName}>{info.name}</Text>
            <Text style={[styles.shopDesc, { color: colors.textMuted }]}>{info.desc}</Text>
            <View style={[G.row, { marginTop: 6 }]}>
              <Star size={14} color={colors.secondary} fill={colors.secondary} />
              <Text style={styles.ratingText}>4.9 (120+ Reviews)</Text>
              <Text style={styles.dot}> • </Text>
              <Text style={styles.distanceText}>0.5 km away</Text>
            </View>
          </View>
        </View>

        {/* Business Booster: Flash Deal Widget */}
        <View style={styles.boostBanner}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>Grand Opening Offer!</Text>
                <Text style={styles.bannerSubtitle}>Get 20% OFF using SevaStack checkout pay.</Text>
              </View>
              <View style={styles.promoCode}>
                <Tag size={12} color="#FFF" />
                <Text style={styles.codeText}>SEVA20</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Services / Ordering System */}
        <View style={[G.container, { paddingTop: 24 }]}>
          <Text style={[G.h3, { color: colors.text, marginBottom: 12 }]}>{t('explore_services')}</Text>

          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
          ) : (
            mergedServices.map((service) => {
              const cartItem = cart[service.id];
              return (
                <GlassCard key={service.id} style={styles.productCard}>
                  <View style={styles.productMain}>
                    <View style={styles.productInfo}>
                      <Text style={[styles.productName, { color: colors.text }]}>{service.name}</Text>
                      <View style={styles.metaRow}>
                        <Clock size={12} color={colors.textMuted} />
                        <Text style={[styles.durationText, { color: colors.textMuted }]}>{service.unit || 'session'}</Text>
                      </View>
                      <View style={G.row}>
                        <Text style={[styles.price, { color: colors.text }]}>₹{service.price}</Text>
                      </View>
                    </View>
                    <View style={styles.productImageContainer}>
                      <Image source={{ uri: service.image }} style={styles.productImage} />
                      {cartItem ? (
                        <View style={[styles.quantityContainer, { borderColor: colors.primary }]}>
                          <TouchableOpacity onPress={() => removeFromCart(service.id)} style={styles.qtyBtn}>
                            <Minus size={12} color={colors.primary} />
                          </TouchableOpacity>
                          <Text style={[styles.qtyText, { color: colors.text }]}>{cartItem.quantity}</Text>
                          <TouchableOpacity onPress={() => addToCart(service)} style={styles.qtyBtn}>
                            <Plus size={12} color={colors.primary} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity onPress={() => addToCart(service)} style={[styles.addBtn, { borderColor: colors.primary }]}>
                          <Text style={[styles.addBtnText, { color: colors.primary }]}>ADD +</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </GlassCard>
              );
            })
          )}
        </View>

        {/* Location & Info */}
        <View style={[G.container, { marginBottom: 140 }]}>
          <Text style={[G.h3, { color: colors.text, marginBottom: 16 }]}>Location & Hours</Text>
          <GlassCard style={styles.infoCard}>
            <View style={G.row}>
              <MapPin size={20} color={colors.primary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[G.body, { color: colors.text }]}>{info.address}</Text>
                <Text style={[G.caption, { color: colors.textMuted }]}>Verified Partner Shop</Text>
              </View>
            </View>
            <View style={[G.divider, { backgroundColor: colors.border }]} />
            <View style={G.row}>
              <Clock size={20} color={colors.primary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[G.body, { color: colors.text }]}>Open Today</Text>
                <Text style={[G.caption, { color: colors.textMuted }]}>09:00 AM - 08:30 PM</Text>
              </View>
            </View>
          </GlassCard>
        </View>
      </ScrollView>

      {/* Floating Checkout Button */}
      {totalItems > 0 && (
        <View style={styles.footer}>
          <LinearGradient
            colors={['rgba(15, 23, 42, 0)', 'rgba(15, 23, 42, 0.95)', 'rgba(15, 23, 42, 1)']}
            style={styles.footerGradient}
          />
          <View style={[styles.checkoutBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View>
              <Text style={[styles.itemCount, { color: colors.textMuted }]}>
                {totalItems} {totalItems === 1 ? t('item_added') : t('items_added')}
              </Text>
              <Text style={[styles.totalPrice, { color: colors.text }]}>₹{totalPrice.toFixed(2)}</Text>
            </View>
             <Button 
              title={t('book_now')} 
              onPress={() => setIsCheckoutVisible(true)} 
              style={StyleSheet.flatten([styles.bookNowBtn, { backgroundColor: colors.primary }])}
            />
          </View>
        </View>
      )}

      {/* Checkout details & payment option Modal */}
      <Modal
        visible={isCheckoutVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCheckoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('order_payment_summary')}</Text>
              <TouchableOpacity onPress={() => setIsCheckoutVisible(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              {/* Item details */}
              {cartItems.map(item => (
                <View key={item.service.id} style={styles.summaryItem}>
                  <Text style={[styles.summaryName, { color: colors.text }]}>{item.service.name} x{item.quantity}</Text>
                  <Text style={[styles.summaryPrice, { color: colors.text }]}>₹{item.service.price * item.quantity}</Text>
                </View>
              ))}

              <View style={[G.divider, { backgroundColor: colors.border }]} />

              <View style={[G.rowBetween, { marginBottom: 16 }]}>
                <Text style={[styles.totalLabel, { color: colors.text }]}>{t('total_price')}</Text>
                <Text style={[styles.totalValue, { color: colors.text }]}>₹{totalPrice.toFixed(2)}</Text>
              </View>

              {/* Time slot picker */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t('select_time_slot')} *</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                value={timeSlot}
                onChangeText={setTimeSlot}
                placeholder="e.g. 10:30 AM"
                placeholderTextColor={colors.textMuted}
              />

              {/* Contact Phone */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t('enter_phone')} *</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. +91 98765 43210"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />

              {/* Delivery Address */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t('enter_address')} *</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                value={address}
                onChangeText={setAddress}
                placeholder="e.g. Hostel 3, Room 412"
                placeholderTextColor={colors.textMuted}
              />

              {/* Notes */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t('special_notes')}</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any special request"
                placeholderTextColor={colors.textMuted}
              />

              {/* Payment methods */}
              <Text style={[styles.inputLabel, { color: colors.text, marginBottom: 8 }]}>{t('payment_method')} *</Text>
              <View style={styles.paymentMethods}>
                <TouchableOpacity 
                  style={[
                    styles.methodBtn, 
                    { borderColor: colors.border },
                    paymentMethod === 'cash' && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                  ]}
                  onPress={() => setPaymentMethod('cash')}
                >
                  <Text style={[styles.methodText, { color: colors.text }, paymentMethod === 'cash' && { color: colors.primary }]}>
                    {t('cash_on_counter')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.methodBtn, 
                    { borderColor: colors.border },
                    paymentMethod === 'upi' && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                  ]}
                  onPress={() => setPaymentMethod('upi')}
                >
                  <Text style={[styles.methodText, { color: colors.text }, paymentMethod === 'upi' && { color: colors.primary }]}>
                    {t('upi_instant')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.methodBtn, 
                    { borderColor: colors.border },
                    paymentMethod === 'khata' && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                  ]}
                  onPress={() => setPaymentMethod('khata')}
                >
                  <Text style={[styles.methodText, { color: colors.text }, paymentMethod === 'khata' && { color: colors.primary }]}>
                    {t('khata_credit')}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalCancelBtn, { backgroundColor: colors.border + '30' }]} 
                onPress={() => setIsCheckoutVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={[styles.modalCancelText, { color: colors.text }]}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalSubmitBtn, { backgroundColor: colors.primary }]} 
                onPress={handlePlaceOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>{t('place_order')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 16,
  },
  headerCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverContainer: {
    height: 350,
    width: '100%',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  shopMetaOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  verifiedText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: 'bold',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  trendingText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  shopName: {
    ...Typography.h1,
    color: '#FFF',
    fontSize: 24,
  },
  shopDesc: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  ratingText: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '600',
    marginLeft: 6,
  },
  dot: {
    color: Colors.textMuted,
  },
  distanceText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  boostBanner: {
    paddingHorizontal: Spacing.md,
    marginTop: -20,
  },
  bannerGradient: {
    borderRadius: 20,
    padding: 16,
    elevation: 8,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: {
    ...Typography.body,
    fontWeight: '800',
    color: '#FFF',
  },
  bannerSubtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  promoCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  codeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  productCard: {
    padding: 0,
    marginTop: 14,
  },
  productMain: {
    flexDirection: 'row',
    padding: 14,
    justifyContent: 'space-between',
  },
  productInfo: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    ...Typography.h3,
    fontSize: 15,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginBottom: 8,
  },
  durationText: {
    fontSize: 11,
  },
  price: {
    ...Typography.h3,
    fontSize: 16,
  },
  productImageContainer: {
    width: 90,
    alignItems: 'center',
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 14,
  },
  addBtn: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 3,
  },
  addBtnText: {
    fontWeight: '800',
    fontSize: 11,
  },
  quantityContainer: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 28,
    width: 76,
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    elevation: 3,
  },
  qtyBtn: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '800',
  },
  infoCard: {
    padding: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 16,
    paddingBottom: 30,
  },
  footerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  checkoutBar: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    elevation: 8,
  },
  itemCount: {
    fontSize: 11,
    fontWeight: '700',
  },
  totalPrice: {
    ...Typography.h3,
    fontSize: 18,
    marginTop: 2,
  },
  bookNowBtn: {
    height: 44,
    paddingHorizontal: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryName: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryPrice: {
    fontSize: 13,
    fontWeight: '700',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  modalInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 13,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodText: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontWeight: '700',
    fontSize: 13,
  },
  modalSubmitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 13,
  }
});
