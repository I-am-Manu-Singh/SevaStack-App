import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  Alert, 
  Share,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { 
  Car,
  MapPin,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Share2,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  QrCode,
  TrendingUp,
  ArrowUpRight,
  Users,
  Award
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

import { CustomerBusinessView } from '@/components/CustomerBusinessView';

export default function CabManagerScreen() {
  const { userRole, businessType } = useApp();
  
  if (userRole === 'customer' || businessType !== 'Travel') {
    return <CustomerBusinessView type="Travel" />;
  }

  return <CabManagerScreenMerchant />;
}

function CabManagerScreenMerchant() {

  const { colors, theme, profile, userRole, businessType } = useApp();
  
  

  const [activeTab, setActiveTab] = useState<'pools' | 'split' | 'tokens'>('pools');

  // Dynamic Supabase State
  const [pools, setPools] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const [poolsData, tokensData] = await Promise.all([
        supabase.from('cab_pools').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('cab_tokens').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false })
      ]);
      let finalPools = poolsData.data || [];
      if (!poolsData.data || poolsData.data.length === 0) {
        const defaultPools = [
          { destination: 'Jaipur Airport Drop', departure_time: '25 May, 04:00 PM', vehicle_type: 'Sedan Dzire', total_fare: 1200, max_seats: 4, passengers_count: 2, passengers: ['Amit Patel', 'Sneha Roy'], status: 'Open', date: '25 May' },
          { destination: 'Railway Station Drop', departure_time: '26 May, 10:00 AM', vehicle_type: 'Innova Crysta', total_fare: 1800, max_seats: 6, passengers_count: 6, passengers: ['Vikram Grover', 'Rohan Sen', 'Neha Bajaj', 'Kunal S.', 'Simran K.', 'Jatin P.'], status: 'Locked', date: '26 May' }
        ].map(p => ({ ...p, merchant_id: profile.id }));
        const seedRes = await supabase.from('cab_pools').insert(defaultPools).select();
        if (seedRes.data) finalPools = seedRes.data;
      }

      const mappedPools = finalPools.map((row: any) => ({
        id: row.id,
        destination: row.destination,
        departureTime: row.departure_time,
        vehicleType: row.vehicle_type,
        totalFare: row.total_fare,
        maxSeats: row.max_seats,
        passengersCount: row.passengers_count,
        passengers: Array.isArray(row.passengers) ? row.passengers : [],
        status: row.status,
        date: row.date
      }));
      setPools(mappedPools);

      let finalTokens = tokensData.data || [];
      if (!tokensData.data || tokensData.data.length === 0) {
        const defaultTokens = [
          { student_name: 'Amit Patel', destination: 'Jaipur Airport Drop', deposit_paid: 300, contact: '+919999988888', status: 'Booked', pool_joined: 'Jaipur Airport Drop' },
          { student_name: 'Sneha Roy', destination: 'Jaipur Airport Drop', deposit_paid: 300, contact: '+919999988877', status: 'Booked', pool_joined: 'Jaipur Airport Drop' }
        ].map(t => ({ ...t, merchant_id: profile.id }));
        const seedRes = await supabase.from('cab_tokens').insert(defaultTokens).select();
        if (seedRes.data) finalTokens = seedRes.data;
      }

      const mappedTokens = finalTokens.map((row: any) => ({
        id: row.id,
        studentName: row.student_name,
        destination: row.destination,
        depositPaid: row.deposit_paid,
        contact: row.contact,
        status: row.status,
        poolJoined: row.pool_joined
      }));
      setTokens(mappedTokens);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [poolFilter, setPoolFilter] = useState<'All' | 'Open' | 'Locked'>('All');

  // Add Pool state
  const [newPoolModal, setNewPoolModal] = useState(false);
  const [newDest, setNewDest] = useState('Jaipur Airport Drop');
  const [newTime, setNewTime] = useState('25 May, 04:00 PM');
  const [newVehicle, setNewVehicle] = useState('Sedan Dzire');
  const [newFare, setNewFare] = useState('1200');
  const [newMaxSeats, setNewMaxSeats] = useState('4');

  // Add passenger to pool state
  const [joiningPool, setJoiningPool] = useState<any | null>(null);
  const [joinStudent, setJoinStudent] = useState('');
  const [joinPhone, setJoinPhone] = useState('');

  // Fare Split Calculator States
  const [splitFare, setSplitFare] = useState('1200');
  const [splitSeats, setSplitSeats] = useState('4');
  const [passengerShares, setPassengerShares] = useState([
    { name: 'Amit Patel', share: 300, paid: true },
    { name: 'Sneha Roy', share: 300, paid: false },
    { name: 'Vikram Grover', share: 300, paid: false },
    { name: 'Rohan Sen', share: 300, paid: false }
  ]);

  // Settle individual share
  const handlePayShare = (index: number) => {
    setPassengerShares(prev => prev.map((ps, idx) => {
      if (idx === index) {
        return { ...ps, paid: true };
      }
      return ps;
    }));
    Alert.alert('Share Settle', `Setted ₹${passengerShares[index].share} via UPI for ${passengerShares[index].name}.`);
  };

  // Add New Cab Pool
  const handleAddNewPool = async () => {
    if (!newDest || !newTime || !newFare) {
      Alert.alert('Missing Fields', 'Please complete all required fields.');
      return;
    }
    if (!profile?.id) return;

    try {
      const { error } = await supabase.from('cab_pools').insert([{
        merchant_id: profile.id,
        destination: newDest,
        departure_time: newTime,
        vehicle_type: newVehicle,
        total_fare: parseInt(newFare) || 1200,
        max_seats: parseInt(newMaxSeats) || 4,
        passengers_count: 1,
        passengers: ['Owner Dispatch'],
        status: 'Open',
        date: 'Today'
      }]);

      if (error) throw error;

      Alert.alert('Cab Pool Created', `Successfully setup a shared ${newVehicle} pool to ${newDest}.`);
      setNewPoolModal(false);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  // Join passenger to pool
  const handleJoinStudent = async () => {
    if (!joinStudent) {
      Alert.alert('Missing Name', 'Please complete student name.');
      return;
    }
    if (!profile?.id || !joiningPool) return;

    const newPassengers = [...joiningPool.passengers, joinStudent];
    const newCount = joiningPool.passengersCount + 1;
    const nextStatus = newCount >= joiningPool.maxSeats ? 'Locked' : 'Open';

    try {
      // 1. Update cab pool table
      const poolPromise = supabase.from('cab_pools').update({
        passengers: newPassengers,
        passengers_count: newCount,
        status: nextStatus
      }).eq('id', joiningPool.id);

      // 2. Insert new token
      const tokenPromise = supabase.from('cab_tokens').insert([{
        merchant_id: profile.id,
        student_name: joinStudent,
        destination: joiningPool.destination.replace(' Drop', ''),
        deposit_paid: 200,
        contact: joinPhone || '+919811220011',
        status: 'Confirmed',
        pool_joined: `Pool #${String(joiningPool.id).substring(0, 3)}`
      }]);

      const [poolRes, tokenRes] = await Promise.all([poolPromise, tokenPromise]);

      if (poolRes.error) throw poolRes.error;
      if (tokenRes.error) throw tokenRes.error;

      Alert.alert('Student Enrolled', `${joinStudent} successfully clustered in ${joiningPool.destination} pool.`);
      setJoinStudent('');
      setJoinPhone('');
      setJoiningPool(null);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  // Calculate manual splits
  const recalculateFareSplit = () => {
    const total = parseFloat(splitFare) || 0;
    const seats = parseInt(splitSeats) || 1;
    const shareAmt = Math.round(total / seats);

    const newPassengers = Array.from({ length: seats }, (_, i) => ({
      name: i === 0 ? 'Amit Patel' : i === 1 ? 'Sneha Roy' : `Passenger ${i + 1}`,
      share: shareAmt,
      paid: false
    }));

    setPassengerShares(newPassengers);
  };

  const filteredPools = pools.filter(pl => {
    const matchesSearch = pl.destination.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pl.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pl.passengers.some((p: string) => p.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = poolFilter === 'All' || pl.status === poolFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <Stack.Screen options={{ 
        title: 'Cab & Travel Pooler',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerShown: true
      }} />

      <ScrollView 
         showsVerticalScrollIndicator={false} 
         contentContainerStyle={styles.scrollContent}
         refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        
        {activeTab === 'pools' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Cab Pooling & Transit Dashboard</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Group student travelers heading to airports or stations. Lock pools, allocate Sedan/SUV options, and minimize transit costs.
              </Text>
            </View>

            {/* Quick Search and Add Pool */}
            <View style={styles.searchRow}>
              <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search destination, vehicle, student..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.searchInput, { color: colors.text }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity 
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
                onPress={() => setNewPoolModal(!newPoolModal)}
              >
                <Plus size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Status Filter Row */}
            <View style={styles.filterRow}>
              {['All', 'Open', 'Locked'].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    poolFilter === f && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]}
                  onPress={() => setPoolFilter(f as any)}
                >
                  <Text style={[
                    styles.filterChipTxt,
                    { color: colors.textMuted },
                    poolFilter === f && { color: colors.primary, fontWeight: '700' }
                  ]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Add Pool Modal Card */}
            {newPoolModal && (
              <GlassCard style={styles.modalFormCard}>
                <View style={styles.formHeaderRow}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Setup New Cab Pool</Text>
                  <TouchableOpacity onPress={() => setNewPoolModal(false)}>
                    <Text style={{ color: colors.error, fontWeight: '700' }}>Close</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Destination (e.g. Jaipur Airport Drop)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newDest}
                  onChangeText={setNewDest}
                />

                <TextInput
                  placeholder="Departure Date & Time (e.g. 24 May, 06:00 PM)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newTime}
                  onChangeText={setNewTime}
                />

                <View style={styles.inlineInputsGrid}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Vehicle Type</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={newVehicle}
                      onChangeText={setNewVehicle}
                    />
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Base Fare (₹)</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={newFare}
                      onChangeText={setNewFare}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Max Seats</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={newMaxSeats}
                      onChangeText={setNewMaxSeats}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddNewPool}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Create Cab Pool</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* List */}
            {filteredPools.map(pl => (
              <GlassCard key={pl.id} style={styles.printCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{pl.destination}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}> {pl.departureTime} • {pl.date}</Text>
                  </View>
                  
                  <View style={[
                    styles.statusBadge, 
                    pl.status === 'Open' ? { backgroundColor: colors.success + '20' } : { backgroundColor: colors.error + '20' }
                  ]}>
                    <Car size={11} color={pl.status === 'Open' ? colors.success : colors.error} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 9, color: pl.status === 'Open' ? colors.success : colors.error, fontWeight: '900' }}>
                      {pl.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={[styles.pdfDetailsPanel, { borderTopColor: colors.border }]}>
                  <MapPin size={16} color={colors.primary} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pdfNameLabel, { color: colors.text }]}>{pl.vehicleType} (Fare: ₹{pl.totalFare})</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>
                      Passengers: {pl.passengers.join(', ')}
                    </Text>
                  </View>
                </View>

                <View style={[styles.invoiceRow, { borderTopColor: colors.border }]}>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>Occupancy Allocation Grid:</Text>
                  <Text style={[styles.qtyDisplayTxt, { color: pl.passengersCount >= pl.maxSeats ? colors.error : colors.success }]}>
                    {pl.passengersCount} / {pl.maxSeats} Seats Filled
                  </Text>
                </View>

                {/* Cab Actions */}
                <View style={styles.printActionArea}>
                  <TouchableOpacity 
                    style={[styles.shareSlipBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Share.share({ message: `Hi students, cab pool to ${pl.destination} in ${pl.vehicleType} departs at ${pl.departureTime}. Seats occupied: ${pl.passengersCount}/${pl.maxSeats}. Join now to split fare!` })}
                  >
                    <Share2 size={13} color={colors.text} style={{ marginRight: 4 }} />
                    <Text style={{ color: colors.text, fontSize: 10, fontWeight: '700' }}>Broadcast Pool</Text>
                  </TouchableOpacity>

                  {pl.status === 'Open' && (
                    <TouchableOpacity 
                      style={[styles.transitionButton, { backgroundColor: colors.primary }]}
                      onPress={() => setJoiningPool(pl)}
                    >
                      <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900' }}>
                        Cluster Student 
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </GlassCard>
            ))}

            {/* Settle passenger add card modal */}
            {joiningPool && (
              <GlassCard style={styles.billFormCard}>
                <View style={styles.formHeaderRow}>
                  <Users size={18} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Add Student: {joiningPool.destination}</Text>
                  <TouchableOpacity onPress={() => setJoiningPool(null)}>
                    <Text style={{ color: colors.error, fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Student Full Name"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={joinStudent}
                  onChangeText={setJoinStudent}
                />

                <TextInput
                  placeholder="Contact Mobile Number"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={joinPhone}
                  onChangeText={setJoinPhone}
                  keyboardType="phone-pad"
                />

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.success }]}
                  onPress={handleJoinStudent}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Confirm Placement Seat</Text>
                </TouchableOpacity>
              </GlassCard>
            )}
          </View>
        )}

        {activeTab === 'split' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Cab Fare Split Calculator Desk</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Compute visual splittings for transit base fares easily based on student occupancy. Settle shares via UPI QR.
              </Text>
            </View>

            <GlassCard style={styles.billFormCard}>
              <View style={styles.formHeaderRow}>
                <QrCode size={18} color={colors.primary} />
                <Text style={[styles.formTitle, { color: colors.text }]}>Split Fare POS</Text>
              </View>

              <View style={styles.inlineInputsGrid}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Total Transit Base Fare (₹)</Text>
                  <TextInput
                    style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                    value={splitFare}
                    onChangeText={setSplitFare}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Checked-in Seats count</Text>
                  <TextInput
                    style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                    value={splitSeats}
                    onChangeText={setSplitSeats}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, { backgroundColor: colors.primary, marginBottom: 12 }]}
                onPress={recalculateFareSplit}
              >
                <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Calculate Split Equally</Text>
              </TouchableOpacity>

              {/* Splits List */}
              <Text style={[styles.inputLabel, { color: colors.text, marginVertical: 8 }]}>INDIVIDUAL PASSENGER SHARES</Text>
              {passengerShares.map((ps, idx) => (
                <View key={idx} style={[styles.friendRow, { borderBottomColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, color: colors.text, fontWeight: '700' }}>{ps.name}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Share: ₹{ps.share}</Text>
                  </View>
                  
                  {ps.paid ? (
                    <View style={[styles.miniStatusBadge, { backgroundColor: colors.success + '20' }]}>
                      <Text style={{ color: colors.success, fontSize: 10, fontWeight: '800' }}>SETTLED </Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.payShareBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handlePayShare(idx)}
                    >
                      <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '800' }}>Settle Share</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </GlassCard>
          </View>
        )}

        {activeTab === 'tokens' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Advance Booking Deposit Tokens</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Track deposit transactions and secure travel bookings during end-of-semester holiday rushes.
              </Text>
            </View>

            {tokens.map(tk => (
              <GlassCard key={tk.id} style={styles.packCard}>
                <View style={styles.subCardHeader}>
                  <Award size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{tk.studentName}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}> {tk.contact} • Route: {tk.destination}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={{ fontSize: 9, color: colors.success, fontWeight: '900' }}>{tk.status.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={[styles.fitGridArea, { borderTopColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: colors.text }}>Landed in: {tk.poolJoined}</Text>
                    <Text style={{ fontSize: 10, color: colors.success, fontWeight: '800', marginTop: 4 }}>
                      Deposit Paid: ₹{tk.depositPaid}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.payShareBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Alert.alert('Deposit Details', `Token of ₹${tk.depositPaid} is locked for booking validation.`)}
                  >
                    <Text style={{ color: colors.text, fontSize: 9, fontWeight: '800' }}>Inspect Deposit</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Bottom Navigation */}
      <View style={[
        styles.bottomTabBar, 
        { 
          backgroundColor: colors.surface + 'E8', 
          borderColor: colors.border,
          shadowColor: colors.primary,
        }
      ]}>
        {[
            { id: 'pools', label: 'Active Cab Pools', icon: Car },
            { id: 'split', label: 'Fare Split Desk', icon: Users },
            { id: 'tokens', label: 'Booking Token Ledger', icon: Clock },
          ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.bottomTabBtn, isActive && { backgroundColor: colors.primary + '18' }]}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <View style={[styles.bottomTabIndicator, isActive && { backgroundColor: colors.primary }]} />
              <Icon size={20} color={isActive ? colors.primary : colors.textMuted} />
              <Text style={[styles.bottomTabLabel, { color: isActive ? colors.primary : colors.textMuted }]}>
                {tab.label.trim()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

}


const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  tabBarContainer: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tabsScroll: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    gap: 8,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  tabIcon: {
    marginRight: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.md,
  },
  introHeader: {
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  introSub: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterChipTxt: {
    fontSize: 11,
  },
  modalFormCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
    marginLeft: 6,
  },
  formInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  submitBtn: {
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  printCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  studentNameText: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
  },
  pdfDetailsPanel: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfNameLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 10,
  },
  qtyDisplayTxt: {
    fontSize: 14,
    fontWeight: '800',
  },
  printActionArea: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  shareSlipBtn: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transitionButton: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  billFormCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  inlineInputsGrid: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 10,
    marginBottom: 2,
    fontWeight: '700',
  },
  friendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  payShareBtn: {
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniStatusBadge: {
    paddingHorizontal: 8,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAddBtn: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
  },
  packCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  fitGridArea: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fitMeasureCell: {
    alignItems: 'center',
  },
  statusBadgeActive: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    height: 72,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    elevation: 12,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  bottomTabBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  bottomTabIndicator: {
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginBottom: 2,
  },
  bottomTabLabel: {
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
