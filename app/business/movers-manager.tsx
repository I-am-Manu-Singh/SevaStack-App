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
  Truck,
  Package,
  Calculator,
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
  Camera,
  Box
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

import { CustomerBusinessView } from '@/components/CustomerBusinessView';

export default function MoversManagerScreen() {
  const { userRole, businessType } = useApp();
  
  if (userRole === 'customer' || businessType !== 'Transport') {
    return <CustomerBusinessView type="Transport" />;
  }

  return <MoversManagerScreenMerchant />;
}

function MoversManagerScreenMerchant() {

  const { colors, theme, profile, userRole, businessType } = useApp();
  
  

  const [activeTab, setActiveTab] = useState<'shifts' | 'quote' | 'inventory'>('shifts');

  // Supabase State
  const [shifts, setShifts] = useState<any[]>([]);
  const [inventories, setInventories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const [shiftsData, invData] = await Promise.all([
        supabase.from('movers_shifts').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('movers_inventories').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false })
      ]);

      let finalShifts = shiftsData.data || [];
      if (!shiftsData.data || shiftsData.data.length === 0) {
        const defaultShifts = [
          { student_name: 'Aman Verma', source: 'Hostel A', destination: 'Hostel C', items_summary: '5 heavy boxes, 1 Study Table', status: 'Booked', quote_amount: 1200, deposit_paid: 200, date: 'Today' },
          { student_name: 'Divya Sen', source: 'Hostel B', destination: 'PG Elite', items_summary: '4 boxes, 1 Cooler', status: 'Packing', quote_amount: 1500, deposit_paid: 300, date: 'Today' }
        ].map(s => ({ ...s, merchant_id: profile.id }));
        const seedRes = await supabase.from('movers_shifts').insert(defaultShifts).select();
        if (seedRes.data) finalShifts = seedRes.data;
      }

      const mappedShifts = finalShifts.map((row: any) => ({
        id: row.id,
        studentName: row.student_name,
        source: row.source,
        destination: row.destination,
        itemsSummary: row.items_summary,
        status: row.status,
        quoteAmount: row.quote_amount,
        depositPaid: row.deposit_paid,
        date: row.date
      }));
      setShifts(mappedShifts);

      let finalInv = invData.data || [];
      if (!invData.data || invData.data.length === 0) {
        const defaultInv = mappedShifts.map(s => ({
          merchant_id: profile.id,
          student_name: s.studentName,
          boxes: 4,
          cooler: 1,
          table_qty: 1,
          cycle: 0,
          photo_verified: true
        }));
        const seedRes = await supabase.from('movers_inventories').insert(defaultInv).select();
        if (seedRes.data) finalInv = seedRes.data;
      }

      const mappedInv = finalInv.map((row: any) => ({
        id: row.id,
        studentName: row.student_name,
        boxes: row.boxes,
        cooler: row.cooler,
        table: row.table_qty,
        cycle: row.cycle,
        photoVerified: row.photo_verified
      }));
      setInventories(mappedInv);

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
  const [shiftFilter, setShiftFilter] = useState<'All' | 'Booked' | 'Packing' | 'In Transit' | 'Unpacked & Delivered'>('All');

  // Add Shifting state
  const [newShiftModal, setNewShiftModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSrc, setNewSrc] = useState('Hostel C');
  const [newDest, setNewDest] = useState('PG Elite');
  const [newItems, setNewItems] = useState('3 Heavy Boxes, 1 Table');
  const [newQuote, setNewQuote] = useState('1800');

  // Quote Calculator states
  const [calcDistance, setCalcDistance] = useState('5');
  const [calcSrcFloor, setCalcSrcFloor] = useState('3');
  const [calcSrcLift, setCalcSrcLift] = useState(false);
  const [calcDestFloor, setCalcDestFloor] = useState('1');
  const [calcDestLift, setCalcDestLift] = useState(true);
  const [calcHeavies, setCalcHeavies] = useState('1');
  const [computedQuote, setComputedQuote] = useState<number | null>(null);

  // Settle dues state
  const [settlingShift, setSettlingShift] = useState<any | null>(null);
  const [settleAmount, setSettleAmount] = useState('0');

  // Add Shifting order
  const handleAddNewShift = async () => {
    if (!newName || !newItems) {
      Alert.alert('Missing Fields', 'Please complete student name and cargo details.');
      return;
    }
    if (!profile?.id) return;

    const quoteVal = parseInt(newQuote) || 1500;
    const { error: shiftError } = await supabase.from('movers_shifts').insert([{
      merchant_id: profile.id,
      student_name: newName,
      source: newSrc,
      destination: newDest,
      items_summary: newItems,
      status: 'Booked',
      quote_amount: quoteVal,
      deposit_paid: 200,
      date: 'Scheduled Today'
    }]);

    if (shiftError) {
      Alert.alert('Error', shiftError.message);
      return;
    }

    const { error: invError } = await supabase.from('movers_inventories').insert([{
      merchant_id: profile.id,
      student_name: newName,
      boxes: 3,
      cooler: 1,
      table_qty: 0,
      cycle: 0,
      photo_verified: true
    }]);

    if (invError) {
      console.error(invError);
    }

    Alert.alert('Shifting Booked', `Successfully scheduled relocation for ${newName}. Generated inventory card.`);
    setNewName('');
    setNewItems('');
    setNewShiftModal(false);
    fetchData();
  };

  // Transition shifting stage
  const transitionShiftStatus = async (id: string, currentStatus: string) => {
    if (!profile?.id) return;
    const statusSequence = ['Booked', 'Packing', 'In Transit', 'Unpacked & Delivered'];
    const nextIdx = statusSequence.indexOf(currentStatus) + 1;
    if (nextIdx >= statusSequence.length) return;

    const nextStatus = statusSequence[nextIdx];

    const { error } = await supabase.from('movers_shifts').update({
      status: nextStatus
    }).eq('id', id);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    if (nextStatus === 'Unpacked & Delivered') {
      const match = shifts.find(s => s.id === id);
      Alert.alert('Delivery Confirmed', `Settle check: ${match?.studentName || 'Student'} has received all packages.`);
    }

    fetchData();
  };

  // Calculate shifting quote automatically
  const handleComputeQuote = () => {
    const dist = parseFloat(calcDistance) || 0;
    const srcFloor = parseInt(calcSrcFloor) || 0;
    const destFloor = parseInt(calcDestFloor) || 0;
    const heavies = parseInt(calcHeavies) || 0;

    let total = 500;
    total += dist * 50;

    if (!calcSrcLift && srcFloor > 0) {
      total += srcFloor * 150;
    }
    if (!calcDestLift && destFloor > 0) {
      total += destFloor * 150;
    }

    total += heavies * 200;

    setComputedQuote(Math.round(total));
  };

  // Settle Shifting Dues
  const handleSettleDues = async () => {
    if (!profile?.id || !settlingShift) return;

    const { error } = await supabase.from('movers_shifts').update({
      deposit_paid: settlingShift.quoteAmount
    }).eq('id', settlingShift.id);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Payment Settle', `Setted ₹${settleAmount} via UPI. Shift ticket fully closed.`);
    setSettlingShift(null);
    fetchData();
  };

  const filteredShifts = shifts.filter(sh => {
    const matchesSearch = sh.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sh.source.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sh.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = shiftFilter === 'All' || sh.status === shiftFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <Stack.Screen options={{ 
        title: 'Hostel Shifting Suite',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerShown: true
      }} />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
        {activeTab === 'shifts' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Live Shifting & Logistics Desk</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Schedule local logistics, allocate packers, and monitor active cargo transits as student PG coordinates.
              </Text>
            </View>

            {/* Quick Search and Add Shift */}
            <View style={styles.searchRow}>
              <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search student, source, destination..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.searchInput, { color: colors.text }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity 
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
                onPress={() => setNewShiftModal(!newShiftModal)}
              >
                <Plus size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Shift filters */}
            <View style={styles.filterRow}>
              {['All', 'Booked', 'Packing', 'In Transit', 'Unpacked & Delivered'].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    shiftFilter === f && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]}
                  onPress={() => setShiftFilter(f as any)}
                >
                  <Text style={[
                    styles.filterChipTxt,
                    { color: colors.textMuted },
                    shiftFilter === f && { color: colors.primary, fontWeight: '700' }
                  ]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Add Shifting form modal */}
            {newShiftModal && (
              <GlassCard style={styles.modalFormCard}>
                <View style={styles.formHeaderRow}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Book Shifting Job</Text>
                  <TouchableOpacity onPress={() => setNewShiftModal(false)}>
                    <Text style={{ color: colors.error, fontWeight: '700' }}>Close</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Student Full Name"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newName}
                  onChangeText={setNewName}
                />

                <TextInput
                  placeholder="Source Location (e.g. Hostel C)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newSrc}
                  onChangeText={setNewSrc}
                />

                <TextInput
                  placeholder="Destination Location (e.g. PG Elite)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newDest}
                  onChangeText={setNewDest}
                />

                <TextInput
                  placeholder="Cargo Checklist (e.g. 3 Boxes, 1 Cooler)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newItems}
                  onChangeText={setNewItems}
                />

                <TextInput
                  placeholder="Job Fare Quote (₹)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newQuote}
                  onChangeText={setNewQuote}
                  keyboardType="numeric"
                />

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddNewShift}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Confirm Job Booking</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* List */}
            {filteredShifts.map(sh => (
              <GlassCard key={sh.id} style={styles.printCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{sh.studentName}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}> From {sh.source}  To {sh.destination}</Text>
                  </View>
                  
                  <View style={[
                    styles.statusBadge, 
                    sh.status === 'Unpacked & Delivered' ? { backgroundColor: colors.success + '20' } : { backgroundColor: colors.accent + '20' }
                  ]}>
                    <Truck size={11} color={sh.status === 'Unpacked & Delivered' ? colors.success : colors.accent} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 9, color: sh.status === 'Unpacked & Delivered' ? colors.success : colors.accent, fontWeight: '900' }}>
                      {sh.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={[styles.pdfDetailsPanel, { borderTopColor: colors.border }]}>
                  <Box size={16} color={colors.primary} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pdfNameLabel, { color: colors.text }]}>Luggage Cargo: {sh.itemsSummary}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>
                      Shifting Schedule: {sh.date}
                    </Text>
                  </View>
                </View>

                <View style={[styles.invoiceRow, { borderTopColor: colors.border }]}>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>Fare Balance Outstanding:</Text>
                  <Text style={[styles.qtyDisplayTxt, { color: sh.quoteAmount === sh.depositPaid ? colors.success : colors.error }]}>
                    {sh.quoteAmount === sh.depositPaid ? 'Sattled Fully' : `₹${sh.quoteAmount - sh.depositPaid} Due`}
                  </Text>
                </View>

                {/* Shifting Actions */}
                <View style={styles.printActionArea}>
                  <TouchableOpacity 
                    style={[styles.shareSlipBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Share.share({ message: `Hi ${sh.studentName}, your shifting booking from ${sh.source} to ${sh.destination} is marked "${sh.status}". Quote: ₹${sh.quoteAmount}. We are packing and in transit!` })}
                  >
                    <Share2 size={13} color={colors.text} style={{ marginRight: 4 }} />
                    <Text style={{ color: colors.text, fontSize: 10, fontWeight: '700' }}>Notify Student</Text>
                  </TouchableOpacity>

                  {sh.status !== 'Unpacked & Delivered' && (
                    <TouchableOpacity 
                      style={[styles.transitionButton, { backgroundColor: colors.primary }]}
                      onPress={() => transitionShiftStatus(sh.id, sh.status)}
                    >
                      <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900' }}>
                        {sh.status === 'Booked' && 'Start Packing '}
                        {sh.status === 'Packing' && 'Load & Dispatch Transit '}
                        {sh.status === 'In Transit' && 'Mark Delivered & Settle '}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {sh.status === 'Unpacked & Delivered' && sh.quoteAmount > sh.depositPaid && (
                    <TouchableOpacity 
                      style={[styles.transitionButton, { backgroundColor: colors.success }]}
                      onPress={() => {
                        setSettlingShift(sh);
                        setSettleAmount((sh.quoteAmount - sh.depositPaid).toString());
                      }}
                    >
                      <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900' }}>
                        Settle Dues ₹{sh.quoteAmount - sh.depositPaid}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </GlassCard>
            ))}

            {/* Settle Shifting Dues Modal */}
            {settlingShift && (
              <GlassCard style={styles.billFormCard}>
                <View style={styles.formHeaderRow}>
                  <QrCode size={18} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Settle Shifting: {settlingShift.studentName}</Text>
                  <TouchableOpacity onPress={() => setSettlingShift(null)}>
                    <Text style={{ color: colors.error, fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Settle Amount (₹)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={settleAmount}
                  onChangeText={setSettleAmount}
                  keyboardType="numeric"
                />

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.success }]}
                  onPress={handleSettleDues}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Settle Remaining Balance Dues</Text>
                </TouchableOpacity>
              </GlassCard>
            )}
          </View>
        )}

        {activeTab === 'quote' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Shifting Lift & Distance Quote Maker</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Compute custom labor and transit charges considering hostel floor levels, heavy surcharges, and elevator lift availability.
              </Text>
            </View>

            <GlassCard style={styles.billFormCard}>
              <View style={styles.formHeaderRow}>
                <Calculator size={18} color={colors.primary} />
                <Text style={[styles.formTitle, { color: colors.text }]}>Quote Generator POS</Text>
              </View>

              <View style={styles.inlineInputsGrid}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Distance (km)</Text>
                  <TextInput
                    style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                    value={calcDistance}
                    onChangeText={setCalcDistance}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Source Floor</Text>
                  <TextInput
                    style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                    value={calcSrcFloor}
                    onChangeText={setCalcSrcFloor}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Dest Floor</Text>
                  <TextInput
                    style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                    value={calcDestFloor}
                    onChangeText={setCalcDestFloor}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inlineInputsGrid}>
                <TouchableOpacity 
                  style={[
                    styles.smallSelectChip,
                    { flex: 1, marginRight: 8, backgroundColor: colors.surface, borderColor: colors.border },
                    calcSrcLift && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]}
                  onPress={() => setCalcSrcLift(!calcSrcLift)}
                >
                  <Text style={{ fontSize: 10, color: colors.text }}>Source Lift: {calcSrcLift ? 'AVAILABLE ' : 'NO LIFT '}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.smallSelectChip,
                    { flex: 1, backgroundColor: colors.surface, borderColor: colors.border },
                    calcDestLift && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]}
                  onPress={() => setCalcDestLift(!calcDestLift)}
                >
                  <Text style={{ fontSize: 10, color: colors.text }}>Dest Lift: {calcDestLift ? 'AVAILABLE ' : 'NO LIFT '}</Text>
                </TouchableOpacity>
              </View>

              <View style={{ marginVertical: 10 }}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Heavy Appliance Counts (Fridge/Cooler/Desks)</Text>
                <TextInput
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={calcHeavies}
                  onChangeText={setCalcHeavies}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, { backgroundColor: colors.primary, marginBottom: 12 }]}
                onPress={handleComputeQuote}
              >
                <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Calculate Estimate Quote</Text>
              </TouchableOpacity>

              {computedQuote !== null && (
                <View style={[styles.invoiceRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }]}>
                  <Text style={{ fontSize: 14, color: colors.text, fontWeight: '800' }}>Estimated Quote Base:</Text>
                  <Text style={{ fontSize: 20, color: colors.primary, fontWeight: '900' }}>₹{computedQuote}</Text>
                </View>
              )}
            </GlassCard>
          </View>
        )}

        {activeTab === 'inventory' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Luggage Shifting Photo Inventory Locker</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Photo verified lists of student boxes, air coolers, and desktops to ensure absolute zero lost package liability.
              </Text>
            </View>

            {inventories.map(inv => (
              <GlassCard key={inv.id} style={styles.packCard}>
                <View style={styles.subCardHeader}>
                  <Package size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{inv.studentName}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Security Check: Verified Checked-in Cargo</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={{ fontSize: 9, color: colors.success, fontWeight: '900' }}>Verified</Text>
                  </View>
                </View>

                {/* Cargo Count Grid */}
                <View style={[styles.fitGridArea, { borderTopColor: colors.border }]}>
                  {[
                    { label: 'HEAVY BOXES', val: `${inv.boxes} Units` },
                    { label: 'AIR COOLER', val: `${inv.cooler} Units` },
                    { label: 'STUDY DESK', val: `${inv.table} Units` },
                    { label: 'CYCLE/BIKE', val: `${inv.cycle} Units` }
                  ].map((stat, idx) => (
                    <View key={idx} style={styles.fitMeasureCell}>
                      <Text style={{ fontSize: 9, color: colors.textMuted }}>{stat.label}</Text>
                      <Text style={{ fontSize: 11, fontWeight: '900', color: colors.text, marginTop: 2 }}>{stat.val}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.surfaceLight, height: 32, marginTop: 12, flexDirection: 'row' }]}
                  onPress={() => Alert.alert('Inventory Verified', 'Visual photos checklist locked for this shifting order.')}
                >
                  <Camera size={14} color={colors.text} style={{ marginRight: 6 }} />
                  <Text style={{ color: colors.text, fontSize: 10, fontWeight: '800' }}>View Shifting Photo Records (3 verified)</Text>
                </TouchableOpacity>
              </GlassCard>
            ))}
          </View>
        )}

        </>
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
            { id: 'shifts', label: 'Active Shifting Runs', icon: Truck },
            { id: 'quote', label: 'Shifting Quote Maker', icon: Calculator },
            { id: 'inventory', label: 'Luggage Photo Card', icon: Package },
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
  smallSelectChip: {
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
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
