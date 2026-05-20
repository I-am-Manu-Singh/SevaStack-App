import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  Star, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Utensils, 
  Users, 
  Home, 
  BookOpen, 
  Shirt, 
  Scissors, 
  FileText, 
  Dumbbell, 
  Car, 
  Truck, 
  HeartPulse, 
  Coffee, 
  Activity, 
  AlertCircle,
  Plus
} from 'lucide-react-native';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

interface CustomerBusinessViewProps {
  type: string;
}

export function CustomerBusinessView({ type }: CustomerBusinessViewProps) {
  const { colors, theme, profile, catalog } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeRecords, setActiveRecords] = useState<any[]>([]);
  const [dbServices, setDbServices] = useState<any[]>([]);

  // Form Fields State
  const [selectedPlan, setSelectedPlan] = useState('Standard (2 Meals)');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [contactNumber, setContactNumber] = useState(profile?.phone || '');
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTime, setSelectedTime] = useState('12:00 PM');
  const [roomType, setRoomType] = useState('Double Sharing Non-AC');
  const [itemsCount, setItemsCount] = useState('5');
  const [serviceType, setServiceType] = useState('Wash & Iron');
  const [extraDetail, setExtraDetail] = useState('');

  // Fetch db services for this type
  useEffect(() => {
    async function fetchDbServices() {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('business_type', type);
        if (data && data.length > 0) {
          setDbServices(data);
        }
      } catch (err) {
        console.log("Error loading database services:", err);
      }
    }
    fetchDbServices();
  }, [type]);

  // Filter local catalog items matching this type
  const localCatalog = (catalog || []).filter(item => item.businessType === type);

  // Merge database services with mock items
  const mergedCatalog = [...dbServices.map((item: any) => ({
    id: item.id,
    name: item.name,
    price: parseFloat(item.price),
    category: item.category,
    unit: item.unit,
    businessType: item.business_type || item.businessType,
    image: item.image
  }))];

  localCatalog.forEach(localItem => {
    if (!mergedCatalog.some(dbItem => dbItem.name.toLowerCase() === localItem.name.toLowerCase())) {
      mergedCatalog.push(localItem);
    }
  });

  // Fetch student's existing active bookings
  useEffect(() => {
    async function fetchMyBookings() {
      if (!profile?.id) return;
      setLoading(true);
      try {
        let query;
        if (type === 'Tiffin') {
          query = supabase.from('tiffin_subscriptions').select('*').eq('student_name', profile.full_name || 'Rohan');
        } else if (type === 'Hostel') {
          query = supabase.from('hostel_residents').select('*').eq('student_name', profile.full_name || 'Rohan');
        } else if (type === 'Laundry') {
          query = supabase.from('laundry_orders').select('*').eq('customer_name', profile.full_name || 'Rohan');
        } else {
          query = supabase.from('appointments').select('*').eq('customer_name', profile.full_name || 'Rohan').eq('business_type', type);
        }

        const { data, error } = await query;
        if (data) setActiveRecords(data);
      } catch (err) {
        console.log('Error fetching user records:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyBookings();
  }, [type, profile]);

  const handleCreateBooking = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const studentName = profile?.full_name || 'Rohan';
      
      if (type === 'Tiffin') {
        const { error } = await supabase.from('tiffin_subscriptions').insert([{
          student_name: studentName,
          hostel_address: specialInstructions || 'Hostel Block A',
          plan_type: selectedPlan,
          days_left: 30,
          spice_level: 'Medium',
          phone: contactNumber || '+919876543210',
          status: 'Active'
        }]);
        if (error) throw error;
      } else if (type === 'Hostel') {
        const { error } = await supabase.from('hostel_residents').insert([{
          student_name: studentName,
          room_number: 'Room ' + Math.floor(Math.random() * 300 + 100),
          college_affiliation: specialInstructions || 'Kota IIT Academy',
          rent_due: 12000.00,
          status: 'Paid'
        }]);
        if (error) throw error;
      } else if (type === 'Laundry') {
        const { error } = await supabase.from('laundry_orders').insert([{
          customer_name: studentName,
          room_number: specialInstructions || 'Rm 102',
          items_count: parseInt(itemsCount) || 5,
          service_type: serviceType,
          amount: (parseInt(itemsCount) || 5) * 15,
          status: 'Received',
          delicate_tag: extraDetail || 'None'
        }]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('appointments').insert([{
          customer_name: studentName,
          service: selectedPlan,
          time: selectedTime,
          price: 250,
          status: 'pending',
          business_type: type
        }]);
        if (error) throw error;
      }

      Alert.alert(
        "Booking Successful", 
        `Your request for ${type} has been registered successfully. The merchant will notify you shortly.`,
        [{ text: "OK", onPress: () => router.replace('/(tabs)') }]
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper values based on business type
  const getIcon = () => {
    switch(type) {
      case 'Tiffin': return <Utensils size={28} color={colors.primary} />;
      case 'Hostel': return <Home size={28} color={colors.primary} />;
      case 'Library': return <BookOpen size={28} color={colors.primary} />;
      case 'Laundry': return <Shirt size={28} color={colors.primary} />;
      case 'Barber': return <Scissors size={28} color={colors.primary} />;
      case 'Gym': return <Dumbbell size={28} color={colors.primary} />;
      case 'Travel': return <Car size={28} color={colors.primary} />;
      case 'Transport': return <Truck size={28} color={colors.primary} />;
      case 'Chemist': return <HeartPulse size={28} color={colors.primary} />;
      case 'Cafe': return <Coffee size={28} color={colors.primary} />;
      default: return <Sparkles size={28} color={colors.primary} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ 
        title: `${type} Booking Portal`,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text, fontWeight: '800' },
        headerTintColor: colors.primary
      }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Info Card */}
        <GlassCard style={{ padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '15' }]}>
              {getIcon()}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>Verified Kota {type} Hub</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>4.8</Text>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textMuted }} />
                <MapPin size={12} color={colors.textMuted} />
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textMuted }}>Kota Coaching Zone</Text>
              </View>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
              <ShieldCheck size={14} color={colors.success} />
              <Text style={{ fontSize: 10, fontWeight: '800', color: colors.success }}>Verified</Text>
            </View>
          </View>
        </GlassCard>

        {/* Catalog & Menu Section */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 8 }]}>Catalog & Menu</Text>
        <View style={{ gap: 12, marginBottom: 16 }}>
          {mergedCatalog.map((item) => {
            const isSelected = selectedPlan === item.name || serviceType === item.name || roomType === item.name;
            return (
              <GlassCard 
                key={item.id} 
                style={[
                  styles.catalogCard, 
                  { borderColor: colors.border, borderWidth: 1 },
                  isSelected && { borderColor: colors.primary, borderWidth: 1.5 }
                ]}
              >
                <View style={styles.catalogItemRow}>
                  <Image 
                    source={{ uri: item.image || 'https://images.unsplash.com/photo-1521566652839-697aa473761a?w=400&q=80' }} 
                    style={styles.catalogImage} 
                  />
                  <View style={{ flex: 1 }}>
                    <View style={styles.catalogHeaderRow}>
                      <Text style={[styles.catalogItemName, { color: colors.text }]}>{item.name}</Text>
                      {item.category && (
                        <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
                          <Text style={{ fontSize: 9, color: colors.primary, fontWeight: '700' }}>{item.category}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.catalogItemPrice, { color: colors.textMuted }]}>
                      ₹{item.price} {item.unit ? `/ ${item.unit}` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={[
                      styles.catalogSelectBtn, 
                      { backgroundColor: isSelected ? colors.primary : colors.surface, borderColor: colors.primary }
                    ]}
                    onPress={() => {
                      setSelectedPlan(item.name);
                      setServiceType(item.name);
                      setRoomType(item.name);
                    }}
                  >
                    <Text style={[styles.catalogSelectBtnText, { color: isSelected ? '#FFF' : colors.primary }]}>
                      {isSelected ? 'Selected' : 'Select'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            );
          })}
          {mergedCatalog.length === 0 && (
            <View style={[styles.emptyContainer, { borderColor: colors.border }]}>
              <AlertCircle size={20} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600', marginTop: 4 }}>
                No items in this business catalog yet.
              </Text>
            </View>
          )}
        </View>

        {/* Dynamic Booking Forms */}
        <GlassCard style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 12 }}>New Request Booking</Text>
          
          {type === 'Tiffin' && (
            <View style={{ gap: 12 }}>
              <View>
                <Text style={[styles.label, { color: colors.textMuted }]}>Choose Meal Plan</Text>
                <View style={styles.optionRow}>
                  {['Basic Veg (1 Meal)', 'Standard (2 Meals)', 'Premium (3 Meals)'].map(p => (
                    <TouchableOpacity 
                      key={p} 
                      onPress={() => setSelectedPlan(p)}
                      style={[styles.optionBtn, { borderColor: colors.border }, selectedPlan === p && { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
                    >
                      <Text style={{ fontSize: 11, color: selectedPlan === p ? colors.primary : colors.text, fontWeight: '700' }}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={[styles.label, { color: colors.textMuted }]}>Delivery Hostel Address</Text>
                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g. Block C, Room 104, Landmark City PG"
                  placeholderTextColor={colors.textMuted}
                  value={specialInstructions}
                  onChangeText={setSpecialInstructions}
                />
              </View>

              <View>
                <Text style={[styles.label, { color: colors.textMuted }]}>Contact mobile number</Text>
                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  keyboardType="phone-pad"
                  placeholder="e.g. +91 98765 43210"
                  placeholderTextColor={colors.textMuted}
                  value={contactNumber}
                  onChangeText={setContactNumber}
                />
              </View>
            </View>
          )}

          {type === 'Hostel' && (
            <View style={{ gap: 12 }}>
              <View>
                <Text style={[styles.label, { color: colors.textMuted }]}>Select Room Type</Text>
                <View style={styles.optionRow}>
                  {['Single AC', 'Double Sharing', 'Single Non-AC'].map(p => (
                    <TouchableOpacity 
                      key={p} 
                      onPress={() => setRoomType(p)}
                      style={[styles.optionBtn, { borderColor: colors.border }, roomType === p && { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
                    >
                      <Text style={{ fontSize: 11, color: roomType === p ? colors.primary : colors.text, fontWeight: '700' }}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={[styles.label, { color: colors.textMuted }]}>Target Academy / College</Text>
                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g. Allen Career Institute, Resonance"
                  placeholderTextColor={colors.textMuted}
                  value={specialInstructions}
                  onChangeText={setSpecialInstructions}
                />
              </View>
            </View>
          )}

          {type === 'Laundry' && (
            <View style={{ gap: 12 }}>
              <View>
                <Text style={[styles.label, { color: colors.textMuted }]}>Laundry Service Type</Text>
                <View style={styles.optionRow}>
                  {['Wash & Iron', 'Dry Cleaning', 'Steam Press'].map(p => (
                    <TouchableOpacity 
                      key={p} 
                      onPress={() => setServiceType(p)}
                      style={[styles.optionBtn, { borderColor: colors.border }, serviceType === p && { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
                    >
                      <Text style={{ fontSize: 11, color: serviceType === p ? colors.primary : colors.text, fontWeight: '700' }}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>Cloth Items Count</Text>
                  <TextInput 
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    keyboardType="numeric"
                    placeholder="e.g. 8"
                    placeholderTextColor={colors.textMuted}
                    value={itemsCount}
                    onChangeText={setItemsCount}
                  />
                </View>

                <View style={{ flex: 2 }}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>Delicate Items warning</Text>
                  <TextInput 
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    placeholder="e.g. Woolen sweater, Silk"
                    placeholderTextColor={colors.textMuted}
                    value={extraDetail}
                    onChangeText={setExtraDetail}
                  />
                </View>
              </View>

              <View>
                <Text style={[styles.label, { color: colors.textMuted }]}>Hostel Room Delivery Address</Text>
                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g. Room 304, Royal PG"
                  placeholderTextColor={colors.textMuted}
                  value={specialInstructions}
                  onChangeText={setSpecialInstructions}
                />
              </View>
            </View>
          )}

          {type !== 'Tiffin' && type !== 'Hostel' && type !== 'Laundry' && (
            <View style={{ gap: 12 }}>
              <View>
                <Text style={[styles.label, { color: colors.textMuted }]}>Select Booking Slot</Text>
                <View style={styles.optionRow}>
                  {['Today', 'Tomorrow', 'Day After'].map(p => (
                    <TouchableOpacity 
                      key={p} 
                      onPress={() => setSelectedDate(p)}
                      style={[styles.optionBtn, { borderColor: colors.border }, selectedDate === p && { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
                    >
                      <Text style={{ fontSize: 11, color: selectedDate === p ? colors.primary : colors.text, fontWeight: '700' }}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={[styles.label, { color: colors.textMuted }]}>Select Time Slot</Text>
                <View style={styles.optionRow}>
                  {['10:00 AM', '02:00 PM', '05:00 PM', '08:00 PM'].map(p => (
                    <TouchableOpacity 
                      key={p} 
                      onPress={() => setSelectedTime(p)}
                      style={[styles.optionBtn, { borderColor: colors.border }, selectedTime === p && { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
                    >
                      <Text style={{ fontSize: 11, color: selectedTime === p ? colors.primary : colors.text, fontWeight: '700' }}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={[styles.label, { color: colors.textMuted }]}>Special Requests / Notes</Text>
                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g. Need urgent print, haircut style catalog, allergy warning"
                  placeholderTextColor={colors.textMuted}
                  value={specialInstructions}
                  onChangeText={setSpecialInstructions}
                />
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={handleCreateBooking}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14 }}>Submit Booking Order</Text>
            )}
          </TouchableOpacity>
        </GlassCard>

        {/* Existing Active Bookings / Subscriptions */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>My Current Active Status</Text>
        
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 12 }} />
        ) : activeRecords.length === 0 ? (
          <View style={[styles.emptyContainer, { borderColor: colors.border }]}>
            <AlertCircle size={24} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600', marginTop: 8 }}>No active bookings for this service.</Text>
          </View>
        ) : (
          activeRecords.map((rec, idx) => (
            <GlassCard key={idx} style={{ padding: 14, marginBottom: 12, borderColor: colors.border, borderWidth: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>
                    {rec.plan_type || rec.service || rec.room_number || 'Standard Booking'}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                    {rec.hostel_address || rec.college_affiliation || rec.room_number ? 'Hostel Address: ' + (rec.hostel_address || rec.college_affiliation || rec.room_number) : 'Time: ' + (rec.time || '12:00 PM')}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: (rec.status === 'Active' || rec.status === 'Paid' || rec.status === 'Approved') ? colors.success + '20' : '#F59E0B20' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: (rec.status === 'Active' || rec.status === 'Paid' || rec.status === 'Approved') ? colors.success : '#F59E0B' }}>
                    {(rec.status || 'Pending').toUpperCase()}
                  </Text>
                </View>
              </View>
              {rec.days_left !== undefined && (
                <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginTop: 10, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>Days Left on Subscription:</Text>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primary }}>{rec.days_left} Days</Text>
                </View>
              )}
            </GlassCard>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  optionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 10,
  },
  emptyContainer: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogCard: {
    padding: 12,
    borderRadius: 16,
  },
  catalogItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  catalogImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  catalogHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  catalogItemName: {
    fontSize: 14,
    fontWeight: '800',
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catalogItemPrice: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  catalogSelectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  catalogSelectBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
