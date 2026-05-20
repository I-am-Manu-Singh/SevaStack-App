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
  Wrench,
  Hammer,
  Settings,
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
  Check
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

import { CustomerBusinessView } from '@/components/CustomerBusinessView';

export default function RepairManagerScreen() {
  const { userRole, businessType } = useApp();
  
  if (userRole === 'customer' || businessType !== 'Handyman') {
    return <CustomerBusinessView type="Handyman" />;
  }

  return <RepairManagerScreenMerchant />;
}

function RepairManagerScreenMerchant() {

  const { colors, theme, profile, userRole, businessType } = useApp();
  
  

  const [activeTab, setActiveTab] = useState<'repairs' | 'parts' | 'otp'>('repairs');

  // Dynamic Supabase State
  const [repairs, setRepairs] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const [repairsData, partsData] = await Promise.all([
        supabase.from('repair_jobs').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('repair_parts').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false })
      ]);
      
      let finalRepairs = repairsData.data || [];
      if (!repairsData.data || repairsData.data.length === 0) {
        const defaultRepairs = [
          { student_name: 'Varun Dhawan', room: 'Hostel A - 108', category: 'AC & Cooler', issue: 'Cooler pump not lifting water', status: 'Reported', cost: 250, parts_used: 'None registered', otp_code: '4820', date: 'Today' },
          { student_name: 'Alia Bhatt', room: 'Hostel C - 204', category: 'Electrical', issue: 'Tubelight flickering continuously', status: 'Inspecting', cost: 120, parts_used: 'None registered', otp_code: '9031', date: 'Today' }
        ].map(r => ({ ...r, merchant_id: profile.id }));
        const seedRes = await supabase.from('repair_jobs').insert(defaultRepairs).select();
        if (seedRes.data) finalRepairs = seedRes.data;
      }

      const mappedRepairs = finalRepairs.map((row: any) => ({
        id: row.id,
        studentName: row.student_name,
        room: row.room,
        category: row.category,
        issue: row.issue,
        status: row.status,
        cost: row.cost || 0,
        partsUsed: row.parts_used || 'None registered',
        otpCode: row.otp_code,
        date: row.date || 'Today'
      }));
      setRepairs(mappedRepairs);

      let finalParts = partsData.data || [];
      if (!partsData.data || partsData.data.length === 0) {
        const defaultParts = [
          { name: 'Submersible Cooler Pump', price: 250, stock: 12 },
          { name: 'Ceiling Fan Regulator', price: 80, stock: 24 },
          { name: 'LED Tube Light 20W', price: 120, stock: 18 },
          { name: 'Geyser Heating Element', price: 450, stock: 6 }
        ].map(p => ({ ...p, merchant_id: profile.id }));
        const seedRes = await supabase.from('repair_parts').insert(defaultParts).select();
        if (seedRes.data) finalParts = seedRes.data;
      }

      const mappedParts = finalParts.map((row: any) => ({
        id: row.id,
        name: row.name,
        price: row.price || 0,
        stock: row.stock || 0
      }));
      setParts(mappedParts);

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
  const [repairFilter, setRepairFilter] = useState<'All' | 'Reported' | 'Inspecting' | 'Fixing' | 'Resolved'>('All');

  // Add Repair state
  const [newRepairModal, setNewRepairModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRoom, setNewRoom] = useState('Hostel C - 302');
  const [newCategory, setNewCategory] = useState('AC & Cooler');
  const [newIssue, setNewIssue] = useState('AC water leaking on study desk');
  const [newCost, setNewCost] = useState('350');

  // Spare Parts checklist invoice state
  const [selectedRep, setSelectedRep] = useState<any | null>(null);
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [laborCharge, setLaborCharge] = useState('150');

  // OTP Verification state
  const [verifyingRep, setVerifyingRep] = useState<any | null>(null);
  const [inputOtp, setInputOtp] = useState('');

  // Add New Repair job
  const handleAddNewRepair = async () => {
    if (!newName || !newIssue) {
      Alert.alert('Missing Fields', 'Please complete student name and issue description.');
      return;
    }
    if (!profile?.id) return;

    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    try {
      const { error } = await supabase.from('repair_jobs').insert([{
        merchant_id: profile.id,
        student_name: newName,
        room: newRoom,
        category: newCategory,
        issue: newIssue,
        status: 'Reported',
        cost: parseInt(newCost) || 200,
        parts_used: 'None registered',
        otp_code: generatedOtp,
        date: 'Today'
      }]);

      if (error) throw error;

      Alert.alert('Repair Ticket Created', `Successfully setup a repair ticket for ${newName} at ${newRoom}. OTP code ${generatedOtp} sent.`);
      setNewName('');
      setNewIssue('');
      setNewRepairModal(false);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  // Transition repair stage
  const transitionRepairStatus = async (id: string, currentStatus: string) => {
    const statusSequence = ['Reported', 'Inspecting', 'Fixing', 'Resolved'];
    const nextIdx = statusSequence.indexOf(currentStatus) + 1;
    if (nextIdx >= statusSequence.length) return;

    const nextStatus = statusSequence[nextIdx];

    if (nextStatus === 'Resolved') {
      const targetRep = repairs.find(r => r.id === id);
      if (targetRep) {
        setVerifyingRep(targetRep);
      }
      return;
    }

    try {
      const { error } = await supabase.from('repair_jobs').update({ status: nextStatus }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  // Verify OTP closure
  const handleVerifyOtp = async () => {
    if (!verifyingRep) return;
    if (inputOtp === verifyingRep.otpCode) {
      try {
        const { error } = await supabase.from('repair_jobs').update({ status: 'Resolved' }).eq('id', verifyingRep.id);
        if (error) throw error;

        Alert.alert('OTP Verified', `Ticket resolved successfully. Payments and handback completed.`);
        setVerifyingRep(null);
        setInputOtp('');
        fetchData();
      } catch (e: any) {
        Alert.alert('Error', e.message);
      }
    } else {
      Alert.alert('Invalid OTP', 'The completion security code entered is incorrect.');
    }
  };

  // Spare Parts invoice checkout calculator
  const handleSettlePartsInvoice = async () => {
    if (!selectedRep) return;
    let partsTotal = 0;
    const partsNames: string[] = [];

    parts.forEach(pt => {
      if (selectedParts.includes(pt.id)) {
        partsTotal += pt.price;
        partsNames.push(pt.name);
      }
    });

    const totalInvoice = partsTotal + (parseInt(laborCharge) || 150);

    try {
      const { error } = await supabase.from('repair_jobs').update({
        cost: totalInvoice,
        parts_used: partsNames.join(', ') || 'Service Only'
      }).eq('id', selectedRep.id);

      if (error) throw error;

      Alert.alert('Invoice Calculated', `Finalized repair cost at ₹${totalInvoice} including spares.`);
      setSelectedRep(null);
      setSelectedParts([]);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const filteredRepairs = repairs.filter(rep => {
    const matchesSearch = rep.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rep.room.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rep.issue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = repairFilter === 'All' || rep.status === repairFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <Stack.Screen options={{ 
        title: 'Handyman Repairs Suite',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerShown: true
      }} />

      <ScrollView 
         showsVerticalScrollIndicator={false} 
         contentContainerStyle={styles.scrollContent}
         refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        
        {activeTab === 'repairs' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Handyman Repair Tickets Queue</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Organize PG room repair complaints (AC, water heaters, coolers, furniture) and coordinate completion flows.
              </Text>
            </View>

            {/* Quick Search and Add Repair */}
            <View style={styles.searchRow}>
              <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search student, room, issue..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.searchInput, { color: colors.text }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity 
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
                onPress={() => setNewRepairModal(!newRepairModal)}
              >
                <Plus size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Repair filters */}
            <View style={styles.filterRow}>
              {['All', 'Reported', 'Inspecting', 'Fixing', 'Resolved'].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    repairFilter === f && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]}
                  onPress={() => setRepairFilter(f as any)}
                >
                  <Text style={[
                    styles.filterChipTxt,
                    { color: colors.textMuted },
                    repairFilter === f && { color: colors.primary, fontWeight: '700' }
                  ]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Add Repair form modal */}
            {newRepairModal && (
              <GlassCard style={styles.modalFormCard}>
                <View style={styles.formHeaderRow}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>File Repair Ticket</Text>
                  <TouchableOpacity onPress={() => setNewRepairModal(false)}>
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
                  placeholder="Room No (e.g. Hostel C - 302)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newRoom}
                  onChangeText={setNewRoom}
                />

                <TextInput
                  placeholder="Category (e.g. AC & Cooler, Electrical)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newCategory}
                  onChangeText={setNewCategory}
                />

                <TextInput
                  placeholder="Describe repair issue details..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newIssue}
                  onChangeText={setNewIssue}
                />

                <TextInput
                  placeholder="Estimated Base Repair Labor (₹)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newCost}
                  onChangeText={setNewCost}
                  keyboardType="numeric"
                />

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddNewRepair}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>File Room Ticket</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* List */}
            {filteredRepairs.map(rep => (
              <GlassCard key={rep.id} style={styles.printCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{rep.studentName}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}> Room: {rep.room} • {rep.date}</Text>
                  </View>
                  
                  <View style={[
                    styles.statusBadge, 
                    rep.status === 'Resolved' ? { backgroundColor: colors.success + '20' } : { backgroundColor: colors.accent + '20' }
                  ]}>
                    <Wrench size={11} color={rep.status === 'Resolved' ? colors.success : colors.accent} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 9, color: rep.status === 'Resolved' ? colors.success : colors.accent, fontWeight: '900' }}>
                      {rep.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={[styles.pdfDetailsPanel, { borderTopColor: colors.border }]}>
                  <Settings size={16} color={colors.primary} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pdfNameLabel, { color: colors.text }]}>Category: {rep.category}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>
                      Issue: {rep.issue}
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>
                      Parts Checked: {rep.partsUsed}
                    </Text>
                  </View>
                </View>

                <View style={[styles.invoiceRow, { borderTopColor: colors.border }]}>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>Total Service Invoice Price:</Text>
                  <Text style={[styles.qtyDisplayTxt, { color: colors.text }]}>₹{rep.cost}</Text>
                </View>

                {/* Repair Actions */}
                <View style={styles.printActionArea}>
                  <TouchableOpacity 
                    style={[styles.shareSlipBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Share.share({ message: `Hi ${rep.studentName}, your handyman room repair ticket for ${rep.issue} is marked "${rep.status}". Final Invoice total: ₹${rep.cost}. Settle via UPI!` })}
                  >
                    <Share2 size={13} color={colors.text} style={{ marginRight: 4 }} />
                    <Text style={{ color: colors.text, fontSize: 10, fontWeight: '700' }}>Share Bill</Text>
                  </TouchableOpacity>

                  {rep.status !== 'Resolved' && (
                    <TouchableOpacity 
                      style={[styles.transitionButton, { backgroundColor: colors.primary }]}
                      onPress={() => transitionRepairStatus(rep.id, rep.status)}
                    >
                      <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900' }}>
                        {rep.status === 'Reported' && 'Start Inspection '}
                        {rep.status === 'Inspecting' && 'Assign Spare Parts '}
                        {rep.status === 'Fixing' && 'Verify OTP & Settle Dues '}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {rep.status !== 'Resolved' && (
                    <TouchableOpacity 
                      style={[styles.shareSlipBtn, { backgroundColor: colors.surfaceLight }]}
                      onPress={() => setSelectedRep(rep)}
                    >
                      <Text style={{ color: colors.text, fontSize: 10, fontWeight: '700' }}>Calc Invoice</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </GlassCard>
            ))}

            {/* Spare Parts Checklist POS Modal */}
            {selectedRep && (
              <GlassCard style={styles.billFormCard}>
                <View style={styles.formHeaderRow}>
                  <Settings size={18} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Parts Invoice: {selectedRep.studentName}</Text>
                  <TouchableOpacity onPress={() => setSelectedRep(null)}>
                    <Text style={{ color: colors.error, fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Base Service Labor Cost (₹)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={laborCharge}
                  onChangeText={setLaborCharge}
                  keyboardType="numeric"
                />

                <Text style={[styles.inputLabel, { color: colors.text, marginVertical: 8 }]}>CHECK OFF REPLACEMENT PARTS</Text>
                {parts.map(pt => {
                  const isSelected = selectedParts.includes(pt.id);
                  return (
                    <TouchableOpacity
                      key={pt.id}
                      style={[
                        styles.friendRow,
                        { borderBottomColor: colors.border },
                        isSelected && { backgroundColor: colors.primary + '10' }
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedParts(selectedParts.filter(id => id !== pt.id));
                        } else {
                          setSelectedParts([...selectedParts, pt.id]);
                        }
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, color: colors.text, fontWeight: '700' }}>{pt.name}</Text>
                        <Text style={{ fontSize: 11, color: colors.textMuted }}>Price: ₹{pt.price} • Stock: {pt.stock}</Text>
                      </View>
                      
                      {isSelected ? (
                        <View style={[styles.miniStatusBadge, { backgroundColor: colors.success + '20' }]}>
                          <Text style={{ color: colors.success, fontSize: 10, fontWeight: '800' }}>ADDED</Text>
                        </View>
                      ) : (
                        <View style={[styles.miniStatusBadge, { backgroundColor: colors.border }]}>
                          <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '800' }}>ADD</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.success, marginTop: 12 }]}
                  onPress={handleSettlePartsInvoice}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Calculate Total Quote</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* OTP Verification Prompt Card */}
            {verifyingRep && (
              <GlassCard style={styles.billFormCard}>
                <View style={styles.formHeaderRow}>
                  <AlertTriangle size={18} color={colors.accent} style={{ marginRight: 8 }} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Completion OTP verification</Text>
                  <TouchableOpacity onPress={() => setVerifyingRep(null)}>
                    <Text style={{ color: colors.error, fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 12 }}>
                  Privacy verification security code has been sent to {verifyingRep.studentName} at room {verifyingRep.room}. Ask the student for the 4-digit code to authorize job closure.
                </Text>

                <TextInput
                  placeholder="Enter 4-Digit OTP Code (e.g. 4821)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border, textAlign: 'center', letterSpacing: 8, fontSize: 18 }]}
                  value={inputOtp}
                  onChangeText={setInputOtp}
                  maxLength={4}
                  keyboardType="numeric"
                />

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleVerifyOtp}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Confirm Verification OTP</Text>
                </TouchableOpacity>
              </GlassCard>
            )}
          </View>
        )}

        {activeTab === 'parts' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Handyman Spare Parts Ledger</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Track spare parts inventory (motors, pumps, regulator caps, slide rails) and verify stock allocations.
              </Text>
            </View>

            {parts.map(pt => (
              <GlassCard key={pt.id} style={styles.packCard}>
                <View style={styles.subCardHeader}>
                  <Settings size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{pt.name}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Price Tag: ₹{pt.price} each</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={{ fontSize: 9, color: colors.success, fontWeight: '900' }}>{pt.stock} in stock</Text>
                  </View>
                </View>

                <View style={[styles.fitGridArea, { borderTopColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Standard replacement time: ~15 mins</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.payShareBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Alert.alert('Stock Refill', 'Order spares from the primary service distributors.')}
                  >
                    <Text style={{ color: colors.text, fontSize: 9, fontWeight: '800' }}>Restock Spares</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'otp' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Security OTP Verification Vault</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Validate privacy and lock completion codes for pending handyman repair tickets.
              </Text>
            </View>

            {repairs.filter(r => r.status !== 'Resolved').map(rep => (
              <GlassCard key={rep.id} style={styles.packCard}>
                <View style={styles.subCardHeader}>
                  <Wrench size={18} color={colors.accent} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{rep.studentName} ({rep.room})</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Required Code: {rep.otpCode}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.error + '20' }]}>
                    <Text style={{ fontSize: 9, color: colors.error, fontWeight: '900' }}>OTP Pending</Text>
                  </View>
                </View>

                <View style={[styles.fitGridArea, { borderTopColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: colors.text }}>Issue: {rep.issue}</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.payShareBtn, { backgroundColor: colors.primary }]}
                    onPress={() => setVerifyingRep(rep)}
                  >
                    <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '800' }}>Input OTP Code</Text>
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
            { id: 'repairs', label: 'Category Repair Tickets', icon: Hammer },
            { id: 'parts', label: 'Spare Parts Ledger', icon: Settings },
            { id: 'otp', label: 'Completion OTP Verification', icon: Wrench },
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
