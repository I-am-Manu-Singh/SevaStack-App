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
  Scissors,
  Users,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Share2,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  UserPlus,
  QrCode,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Sliders
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

import { CustomerBusinessView } from '@/components/CustomerBusinessView';

export default function BarberManagerScreen() {
  const { userRole, businessType } = useApp();
  
  if (userRole === 'customer' || businessType !== 'Barber') {
    return <CustomerBusinessView type="Barber" />;
  }

  return <BarberManagerScreenMerchant />;
}

function BarberManagerScreenMerchant() {

  const { colors, theme, profile, userRole, businessType } = useApp();
  
  

  const [activeTab, setActiveTab] = useState<'queue' | 'allergies' | 'appointments'>('queue');

  // Supabase dynamic state
  const [chairs, setChairs] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const [chairsData, queueData, allergiesData] = await Promise.all([
        supabase.from('barber_chairs').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: true }),
        supabase.from('barber_queue').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: true }),
        supabase.from('barber_allergies').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false })
      ]);

      let finalChairs = chairsData.data || [];
      if (!chairsData.data || chairsData.data.length === 0) {
        const defaultChairs = [
          { barber_name: 'Stylist Rohit', customer_name: 'Vacant Chair', service: 'None', time_remaining: 0, status: 'Vacant' },
          { barber_name: 'Stylist Vikram', customer_name: 'Vacant Chair', service: 'None', time_remaining: 0, status: 'Vacant' }
        ].map(c => ({ ...c, merchant_id: profile.id }));
        const seedRes = await supabase.from('barber_chairs').insert(defaultChairs).select();
        if (seedRes.data) finalChairs = seedRes.data;
      }

      const mappedChairs = finalChairs.map((row: any) => ({
        id: row.id,
        barberName: row.barber_name,
        customerName: row.customer_name,
        service: row.service,
        timeRemaining: row.time_remaining,
        status: row.status
      }));
      setChairs(mappedChairs);

      let finalQueue = queueData.data || [];
      if (!queueData.data || queueData.data.length === 0) {
        const defaultQueue = [
          { customer_name: 'Varun Sharma', hostel: 'Hostel H-3', service: 'Beard Trim', phone: '+919999888877', status: 'Waiting' },
          { customer_name: 'Kartik Aaryan', hostel: 'Hostel H-1', service: 'Haircut + Styling', phone: '+919999888866', status: 'Waiting' }
        ].map(q => ({ ...q, merchant_id: profile.id }));
        const seedRes = await supabase.from('barber_queue').insert(defaultQueue).select();
        if (seedRes.data) finalQueue = seedRes.data;
      }

      const mappedQueue = finalQueue.map((row: any) => ({
        id: row.id,
        customerName: row.customer_name,
        hostel: row.hostel,
        service: row.service,
        phone: row.phone,
        status: row.status
      }));
      setQueue(mappedQueue);

      let finalAllergies = allergiesData.data || [];
      if (!allergiesData.data || allergiesData.data.length === 0) {
        const defaultAllergies = [
          { customer_name: 'Varun Sharma', warning: 'Sensitive skin. Prone to razor burns.', severity: 'High Alert', date: 'Yesterday' }
        ].map(a => ({ ...a, merchant_id: profile.id }));
        const seedRes = await supabase.from('barber_allergies').insert(defaultAllergies).select();
        if (seedRes.data) finalAllergies = seedRes.data;
      }

      const mappedAllergies = finalAllergies.map((row: any) => ({
        id: row.id,
        customerName: row.customer_name,
        warning: row.warning,
        severity: row.severity,
        date: row.date
      }));
      setAllergies(mappedAllergies);

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

  // Add Walk-in Modal Form states
  const [newWalkinModal, setNewWalkinModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newHostel, setNewHostel] = useState('');
  const [newService, setNewService] = useState('Haircut');
  const [newAllergyWarning, setNewAllergyWarning] = useState('');

  // Settle Bill State
  const [settlingChair, setSettlingChair] = useState<any | null>(null);
  const [billingCombo, setBillingCombo] = useState('Basic Cut');
  const [billAmount, setBillAmount] = useState('150');

  // Settle billing
  const handleSettleStylingDues = async () => {
    if (!profile?.id || !settlingChair) return;

    const { error } = await supabase.from('barber_chairs').update({
      customer_name: 'Vacant Chair',
      service: 'None',
      time_remaining: 0,
      status: 'Vacant'
    }).eq('id', settlingChair.id);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Payment Cleared', `Setted ₹${billAmount} via UPI/Cash for ${settlingChair.customerName}.`);
    setSettlingChair(null);
    fetchData();
  };

  // Add Walkin Customer to Live Queue
  const handleAddWalkin = async () => {
    if (!newName) {
      Alert.alert('Missing Name', 'Please enter customer name.');
      return;
    }
    if (!profile?.id) return;

    const { error: queueError } = await supabase.from('barber_queue').insert([{
      merchant_id: profile.id,
      customer_name: newName,
      hostel: newHostel || 'Walk-in Customer',
      service: newService,
      phone: '+91 99999 88888',
      status: 'Waiting'
    }]);

    if (queueError) {
      Alert.alert('Error', queueError.message);
      return;
    }

    if (newAllergyWarning) {
      const { error: allergyError } = await supabase.from('barber_allergies').insert([{
        merchant_id: profile.id,
        customer_name: newName,
        warning: newAllergyWarning,
        severity: 'High',
        date: 'Today'
      }]);
      if (allergyError) {
        console.error(allergyError);
      }
    }

    Alert.alert('Queue Entry Added', `Added ${newName} to the waiting queue under ${newService}.`);
    setNewName('');
    setNewHostel('');
    setNewService('Haircut');
    setNewAllergyWarning('');
    setNewWalkinModal(false);
    fetchData();
  };

  // Settle or call next in queue
  const callNextInQueue = async (chairId: string) => {
    if (!profile?.id) return;
    if (queue.length === 0) {
      Alert.alert('Queue Empty', 'No clients currently waiting in the lounge.');
      return;
    }

    const nextClient = queue[0];

    // Remove from queue
    const { error: deleteError } = await supabase.from('barber_queue').delete().eq('id', nextClient.id);
    if (deleteError) {
      Alert.alert('Error', deleteError.message);
      return;
    }

    // Place on chair
    const { error: chairError } = await supabase.from('barber_chairs').update({
      customer_name: nextClient.customerName,
      service: nextClient.service,
      time_remaining: 20,
      status: 'Occupied'
    }).eq('id', chairId);

    if (chairError) {
      Alert.alert('Error', chairError.message);
      return;
    }

    Alert.alert('Stylist Alerted', `Styled seat is now assigned to ${nextClient.customerName} for ${nextClient.service}.`);
    fetchData();
  };

  const handleCancelQueueSlot = async (id: string) => {
    try {
      const { error } = await supabase.from('barber_queue').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <Stack.Screen options={{ 
        title: 'Barber & Salon Hub',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerShown: true
      }} />

      {/* Tab Navigation */}

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
        {activeTab === 'queue' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Live Salon Queue & Seat Booking Desk</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Track live seat timers, call next waiting student clients, and dispatch dynamic billing.
              </Text>
            </View>

            {/* Live Stylist Chairs Grid */}
            <Text style={[styles.sectionTitleHeader, { color: colors.textMuted }]}>LIVE CHAIR STATUS</Text>
            <View style={styles.chairsGrid}>
              {chairs.map(ch => (
                <GlassCard key={ch.id} style={styles.chairCard}>
                  <View style={styles.chairHeader}>
                    <Scissors size={18} color={ch.status === 'Occupied' ? colors.primary : colors.textMuted} />
                    <View style={[styles.miniStatusBadge, { backgroundColor: ch.status === 'Occupied' ? colors.primary + '20' : colors.border }]}>
                      <Text style={{ fontSize: 9, color: ch.status === 'Occupied' ? colors.primary : colors.textMuted, fontWeight: '900' }}>
                        {ch.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.barberName, { color: colors.textMuted }]}>{ch.barberName}</Text>
                  <Text style={[styles.clientName, { color: colors.text }]}>{ch.customerName}</Text>
                  {ch.status === 'Occupied' && (
                    <View>
                      <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '700', marginTop: 4 }}>
                        {ch.service}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                         {ch.timeRemaining} mins remaining
                      </Text>
                      
                      <TouchableOpacity 
                        style={[styles.smallSettleBtn, { backgroundColor: colors.success + '20', borderColor: colors.success }]}
                        onPress={() => setSettlingChair(ch)}
                      >
                        <Text style={{ color: colors.success, fontSize: 10, fontWeight: '800' }}>Settle Bill & Vacate </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {ch.status === 'Vacant' && (
                    <TouchableOpacity 
                      style={[styles.callNextBtn, { backgroundColor: colors.primary }]}
                      onPress={() => callNextInQueue(ch.id)}
                    >
                      <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>Call Next waiting </Text>
                    </TouchableOpacity>
                  )}
                </GlassCard>
              ))}
            </View>

            {/* Settle Bill modal card */}
            {settlingChair && (
              <GlassCard style={styles.billFormCard}>
                <View style={styles.formHeaderRow}>
                  <QrCode size={18} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Settle Bill: {settlingChair.customerName}</Text>
                  <TouchableOpacity onPress={() => setSettlingChair(null)}>
                    <Text style={{ color: colors.error, fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inlineInputsGrid}>
                  <View style={{ flex: 2, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Choose Combo / Package</Text>
                    <View style={styles.selectBoxArea}>
                      {['Basic Cut (₹150)', 'Combo Pack (₹250)', 'Hair Color (₹450)'].map(c => (
                        <TouchableOpacity
                          key={c}
                          style={[
                            styles.smallSelectChip,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            billingCombo === c && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                          ]}
                          onPress={() => {
                            setBillingCombo(c);
                            if (c.includes('150')) setBillAmount('150');
                            else if (c.includes('250')) setBillAmount('255');
                            else setBillAmount('450');
                          }}
                        >
                          <Text style={{ fontSize: 9, color: billingCombo === c ? colors.primary : colors.textMuted }}>{c}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Final Price (₹)</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={billAmount}
                      onChangeText={setBillAmount}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.success }]}
                  onPress={handleSettleStylingDues}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Confirm Payment & Settle Seat</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* Waiting list row header */}
            <View style={styles.queueHeaderRow}>
              <Text style={[styles.sectionTitleHeader, { color: colors.textMuted, marginVertical: 0 }]}>WAITING QUEUE DESK</Text>
              <TouchableOpacity 
                style={[styles.miniAddBtn, { backgroundColor: colors.primary }]}
                onPress={() => setNewWalkinModal(!newWalkinModal)}
              >
                <Plus size={14} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>Add Walk-in</Text>
              </TouchableOpacity>
            </View>

            {/* Walkin customer registration form */}
            {newWalkinModal && (
              <GlassCard style={styles.modalFormCard}>
                <View style={styles.formHeaderRow}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Add Student Walk-in</Text>
                  <TouchableOpacity onPress={() => setNewWalkinModal(false)}>
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
                  placeholder="Hostel / Room (e.g. PG Residency Rm 12)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newHostel}
                  onChangeText={setNewHostel}
                />

                <TextInput
                  placeholder="Styling Requirement (e.g. Low fade cut, shave)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newService}
                  onChangeText={setNewService}
                />

                <TextInput
                  placeholder="Allergy / Skin Warnings (optional)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newAllergyWarning}
                  onChangeText={setNewAllergyWarning}
                />

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddWalkin}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Confirm Queue Slot</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* Live Queue Cards */}
            {queue.map((qu, idx) => (
              <GlassCard key={qu.id} style={styles.queueCard}>
                <View style={styles.subCardHeader}>
                  <View style={[styles.queueIndexBadge, { backgroundColor: colors.surface }]}>
                    <Text style={{ color: colors.primary, fontWeight: '900' }}>#{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{qu.customerName}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}> {qu.hostel}</Text>
                  </View>
                  
                  <View style={[styles.statusBadge, { backgroundColor: colors.accent + '20' }]}>
                    <Text style={{ fontSize: 9, color: colors.accent, fontWeight: '900' }}>{qu.service.toUpperCase()}</Text>
                  </View>
                </View>

                {/* Queue buttons */}
                <View style={[styles.queueActions, { borderTopColor: colors.border }]}>
                  <TouchableOpacity 
                    style={[styles.miniActionBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Share.share({ message: `Hi ${qu.customerName}, your turn is approaching at Royal Cut Barber. Please reach the salon desk in 5 mins!` })}
                  >
                    <Share2 size={13} color={colors.text} style={{ marginRight: 4 }} />
                    <Text style={{ color: colors.text, fontSize: 10, fontWeight: '700' }}>Alert Customer</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.miniActionBtn, { backgroundColor: colors.error + '12' }]}
                    onPress={() => handleCancelQueueSlot(qu.id)}
                  >
                    <Text style={{ color: colors.error, fontSize: 10, fontWeight: '700' }}>Cancel Slot</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'allergies' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Hair Dye & Skin Cosmetic Allergy Ledger</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Cross-verify chemical sensitivities before applying hair styling gel, ammonia dyes, or alcohol-based sprays. Avoid post-shave claims.
              </Text>
            </View>

            {allergies.map(al => (
              <GlassCard key={al.id} style={styles.allergyCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{al.customerName}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Logged: {al.date}</Text>
                  </View>
                  
                  <View style={[
                    styles.severityBadge, 
                    al.severity === 'High' ? { backgroundColor: colors.error + '20' } : { backgroundColor: colors.accent + '20' }
                  ]}>
                    <ShieldAlert size={12} color={al.severity === 'High' ? colors.error : colors.accent} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 9, color: al.severity === 'High' ? colors.error : colors.accent, fontWeight: '900' }}>
                      {al.severity.toUpperCase()} RISK
                    </Text>
                  </View>
                </View>

                <View style={[styles.allergyWarningPanel, { borderTopColor: colors.border }]}>
                  <Text style={[styles.warningInstructionText, { color: colors.text }]}>
                    Styling Constraint: {al.warning}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={[styles.verifiedAllergyBtn, { backgroundColor: colors.success + '15', borderColor: colors.success }]}
                  onPress={() => Alert.alert('Allergy Cleared', `Verified ${al.customerName}'s sensitive skin log. Styles alerted.`)}
                >
                  <CheckCircle2 size={13} color={colors.success} style={{ marginRight: 4 }} />
                  <Text style={{ color: colors.success, fontSize: 10, fontWeight: '800' }}>Confirm Styling Protection Active</Text>
                </TouchableOpacity>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'appointments' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Pre-booked Haircut Appointment Slots</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Coordinated advance slot requests pre-booked by student cards from the hostels.
              </Text>
            </View>

            {[
              { id: 'ap1', name: 'Rohan Sharma', room: 'Hostel B - Rm 302', slot: '11:00 AM - 11:30 AM', type: 'Hair Wash + Blow Dry' },
              { id: 'ap2', name: 'Vikram Grover', room: 'Hostel C - Rm 11', slot: '04:30 PM - 05:00 PM', type: 'Beard Trim + Shave' }
            ].map(ap => (
              <GlassCard key={ap.id} style={styles.scheduleCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{ap.name}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Requirement:  {ap.type} ({ap.room})</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={{ fontSize: 9, color: colors.primary, fontWeight: '900' }}>{ap.slot}</Text>
                  </View>
                </View>
                
                <View style={[styles.scheduleFooter, { borderTopColor: colors.border }]}>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>Coordination Desk: Seat Reserved</Text>
                  <TouchableOpacity 
                    style={[styles.scheduleBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={async () => {
                      if (!profile?.id) return;
                      const vacantChair = chairs.find(ch => ch.status === 'Vacant');
                      if (!vacantChair) {
                        Alert.alert('No Vacant Chair', 'Please wait or free up a stylist seat first.');
                        return;
                      }

                      const { error } = await supabase.from('barber_chairs').update({
                        customer_name: ap.name,
                        service: ap.type,
                        time_remaining: 30,
                        status: 'Occupied'
                      }).eq('id', vacantChair.id);

                      if (error) {
                        Alert.alert('Error', error.message);
                        return;
                      }

                      Alert.alert('Customer Seated', `Reserved seat has been assigned to walk-in ${ap.name}.`);
                      fetchData();
                    }}
                  >
                    <Text style={{ color: colors.text, fontSize: 10, fontWeight: '700' }}>Seat Customer Now</Text>
                  </TouchableOpacity>
                </View>
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
            { id: 'queue', label: 'Seat Desk & Queue', icon: Users },
            { id: 'allergies', label: 'Cosmetic Allergies', icon: AlertTriangle },
            { id: 'appointments', label: 'Slots Planner', icon: Clock },
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
  sectionTitleHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginVertical: 10,
  },
  chairsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  chairCard: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 16,
  },
  chairHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  miniStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  barberName: {
    fontSize: 9,
    fontWeight: '600',
  },
  clientName: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  smallSettleBtn: {
    height: 26,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  callNextBtn: {
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  billFormCard: {
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
  inlineInputsGrid: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 10,
    marginBottom: 2,
    fontWeight: '700',
  },
  selectBoxArea: {
    flexDirection: 'row',
    gap: 4,
    height: 40,
  },
  smallSelectChip: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
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
  queueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  miniAddBtn: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalFormCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  queueCard: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 16,
  },
  subCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  queueIndexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentNameText: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  queueActions: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  miniActionBtn: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allergyCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  severityBadge: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
  },
  allergyWarningPanel: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  warningInstructionText: {
    fontSize: 12,
    lineHeight: 16,
  },
  verifiedAllergyBtn: {
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  scheduleCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  scheduleFooter: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleBtn: {
    paddingHorizontal: 12,
    height: 28,
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
