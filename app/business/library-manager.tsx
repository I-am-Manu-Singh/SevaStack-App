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
  BookOpen,
  Users,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Share2,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  QrCode,
  ShieldAlert,
  VolumeX,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

import { CustomerBusinessView } from '@/components/CustomerBusinessView';

export default function LibraryManagerScreen() {
  const { userRole, businessType } = useApp();
  
  if (userRole === 'customer' || businessType !== 'Library') {
    return <CustomerBusinessView type="Library" />;
  }

  return <LibraryManagerScreenMerchant />;
}

function LibraryManagerScreenMerchant() {

  const { colors, theme, profile, userRole, businessType } = useApp();
  
  

  const [activeTab, setActiveTab] = useState<'seats' | 'silent' | 'passes'>('seats');

  // Dynamic Supabase State
  const [seats, setSeats] = useState<any[]>([]);
  const [silentLogs, setSilentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const [seatsData, silentLogsData] = await Promise.all([
        supabase.from('library_seats').select('*').eq('merchant_id', profile.id),
        supabase.from('library_silent_logs').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false })
      ]);
      
      let finalSeats = seatsData.data || [];
      if (!seatsData.data || seatsData.data.length === 0) {
        const defaultSeats = [
          { label: 'Desk A1', student_name: 'Vacant Desk', exam: 'None', time_left: 0, status: 'Vacant' },
          { label: 'Desk A2', student_name: 'Vacant Desk', exam: 'None', time_left: 0, status: 'Vacant' },
          { label: 'Desk A3', student_name: 'Vacant Desk', exam: 'None', time_left: 0, status: 'Vacant' },
          { label: 'Desk A4', student_name: 'Vacant Desk', exam: 'None', time_left: 0, status: 'Vacant' },
          { label: 'Desk B1', student_name: 'Vacant Desk', exam: 'None', time_left: 0, status: 'Vacant' },
          { label: 'Desk B2', student_name: 'Vacant Desk', exam: 'None', time_left: 0, status: 'Vacant' },
          { label: 'Desk B3', student_name: 'Vacant Desk', exam: 'None', time_left: 0, status: 'Vacant' },
          { label: 'Desk B4', student_name: 'Vacant Desk', exam: 'None', time_left: 0, status: 'Vacant' }
        ].map(s => ({ ...s, merchant_id: profile.id }));
        
        const seedRes = await supabase.from('library_seats').insert(defaultSeats).select();
        if (seedRes.data) finalSeats = seedRes.data;
      }

      const mappedSeats = finalSeats.map((row: any) => ({
        id: row.id,
        label: row.label,
        studentName: row.student_name || 'Vacant Desk',
        exam: row.exam || 'None',
        timeLeft: row.time_left || 0,
        status: row.status
      })).sort((a: any, b: any) => a.label.localeCompare(b.label));
      
      setSeats(mappedSeats);

      let finalSilent = silentLogsData.data || [];
      if (!silentLogsData.data || silentLogsData.data.length === 0) {
        const defaultSilent = [
          { student_name: 'Varun Sharma', warning: 'Talking on phone in silent zone.', focus_type: 'Mobile Call', severity: 'Alert (Level 1)', date: 'Today' },
          { student_name: 'Alia Bhatt', warning: 'Group discussion whispers at Desk A3.', focus_type: 'Group Whisper', severity: 'Final Warning', date: 'Yesterday' }
        ].map(s => ({ ...s, merchant_id: profile.id }));
        const seedRes = await supabase.from('library_silent_logs').insert(defaultSilent).select();
        if (seedRes.data) finalSilent = seedRes.data;
      }

      const mappedLogs = finalSilent.map((row: any) => ({
        id: row.id,
        studentName: row.student_name,
        warning: row.warning,
        focusType: row.focus_type,
        severity: row.severity,
        date: row.date
      }));
      setSilentLogs(mappedLogs);
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

  // Add Walk-in Modal states
  const [newSeatModal, setNewSeatModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newExam, setNewExam] = useState('UPSC Mains');
  const [newDuration, setNewDuration] = useState('180');
  const [newSilentAlert, setNewSilentAlert] = useState('');

  // Settle Pass State
  const [settlingSeat, setSettlingSeat] = useState<any | null>(null);
  const [billingCombo, setBillingCombo] = useState('Daily Study Pass');
  const [billAmount, setBillAmount] = useState('50');

  // Settle billing
  const handleSettlePassDues = async () => {
    if (!settlingSeat) return;
    try {
      const { error } = await supabase.from('library_seats').update({
        student_name: 'Vacant Desk',
        exam: 'None',
        time_left: 0,
        status: 'Vacant'
      }).eq('id', settlingSeat.id);

      if (error) throw error;

      Alert.alert('Study Pass Settle', `Setted ₹${billAmount} via UPI/Cash for ${settlingSeat.studentName}.`);
      setSettlingSeat(null);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  // Add Walkin Customer to Desk Seating
  const handleAddSeat = async () => {
    if (!newName) {
      Alert.alert('Missing Name', 'Please enter student name.');
      return;
    }
    if (!profile?.id) return;

    // Find first vacant seat
    const vacantSeat = seats.find(st => st.status === 'Vacant');
    if (!vacantSeat) {
      Alert.alert('Library Full', 'No study desks currently vacant.');
      return;
    }

    const durationMins = parseInt(newDuration) || 120;

    try {
      // 1. Update library_seats
      const seatPromise = supabase.from('library_seats').update({
        student_name: newName,
        exam: newExam,
        time_left: durationMins,
        status: 'Occupied'
      }).eq('id', vacantSeat.id);

      // 2. If Focus warning is present, log it
      let logPromise: any = Promise.resolve(null);
      if (newSilentAlert) {
        logPromise = supabase.from('library_silent_logs').insert([{
          merchant_id: profile.id,
          student_name: newName,
          warning: newSilentAlert,
          focus_type: newExam,
          severity: 'High',
          date: 'Today'
        }]);
      }

      const [seatRes, logRes] = await Promise.all([seatPromise, logPromise as any]);
      if (seatRes.error) throw seatRes.error;
      if (logRes?.error) throw logRes.error;

      Alert.alert('Seat Allocated', `Allocated ${vacantSeat.label} to ${newName} for ${newExam}.`);
      setNewName('');
      setNewExam('UPSC Mains');
      setNewDuration('180');
      setNewSilentAlert('');
      setNewSeatModal(false);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <Stack.Screen options={{ 
        title: 'Library & Study Hub',
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
        
        {activeTab === 'seats' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Visual Seat Map & Desk Allocator</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Monitor occupied study cubicles, allocate vacant seats to students, and clear pass limits.
              </Text>
            </View>

            {/* Live Seating map layout header */}
            <View style={styles.queueHeaderRow}>
              <Text style={[styles.sectionTitleHeader, { color: colors.textMuted, marginVertical: 0 }]}>CUBICLE MAP SHEETS</Text>
              <TouchableOpacity 
                style={[styles.miniAddBtn, { backgroundColor: colors.primary }]}
                onPress={() => setNewSeatModal(!newSeatModal)}
              >
                <Plus size={14} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>Allocate Seat</Text>
              </TouchableOpacity>
            </View>

            {/* Allocate seat walk-in form */}
            {newSeatModal && (
              <GlassCard style={styles.modalFormCard}>
                <View style={styles.formHeaderRow}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Allocate Study Seat</Text>
                  <TouchableOpacity onPress={() => setNewSeatModal(false)}>
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
                  placeholder="Aspirant Goal (e.g. UPSC Prelims, GATE CS, JEE)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newExam}
                  onChangeText={setNewExam}
                />

                <TextInput
                  placeholder="Pass Duration (in minutes, e.g. 180)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newDuration}
                  onChangeText={setNewDuration}
                  keyboardType="numeric"
                />

                <TextInput
                  placeholder="Strict Silence Alerts (optional, e.g. mock test active)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newSilentAlert}
                  onChangeText={setNewSilentAlert}
                />

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddSeat}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Confirm Seat Allocation</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* Study Cubicle Desk Seats Grid */}
            <View style={styles.chairsGrid}>
              {seats.map(st => (
                <GlassCard key={st.id} style={styles.chairCard}>
                  <View style={styles.chairHeader}>
                    <BookOpen size={18} color={st.status === 'Occupied' ? colors.primary : colors.textMuted} />
                    <View style={[styles.miniStatusBadge, { backgroundColor: st.status === 'Occupied' ? colors.primary + '20' : colors.border }]}>
                      <Text style={{ fontSize: 9, color: st.status === 'Occupied' ? colors.primary : colors.textMuted, fontWeight: '900' }}>
                        {st.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.clientName, { color: colors.text }]}>{st.studentName}</Text>
                  {st.status === 'Occupied' && (
                    <View>
                      <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '700', marginTop: 4 }}>
                         {st.exam}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                         {st.timeLeft} mins remaining
                      </Text>
                      
                      <TouchableOpacity 
                        style={[styles.smallSettleBtn, { backgroundColor: colors.success + '20', borderColor: colors.success }]}
                        onPress={() => setSettlingSeat(st)}
                      >
                        <Text style={{ color: colors.success, fontSize: 10, fontWeight: '800' }}>Settle Pass & Vacate </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {st.status === 'Vacant' && (
                    <TouchableOpacity 
                      style={[styles.callNextBtn, { backgroundColor: colors.surfaceLight }]}
                      onPress={() => {
                        // Open seat allocation form
                        setNewSeatModal(true);
                      }}
                    >
                      <Text style={{ color: colors.text, fontSize: 10, fontWeight: '800' }}>Allocate Now </Text>
                    </TouchableOpacity>
                  )}
                </GlassCard>
              ))}
            </View>

            {/* Settle Pass billing modal */}
            {settlingSeat && (
              <GlassCard style={styles.billFormCard}>
                <View style={styles.formHeaderRow}>
                  <QrCode size={18} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Settle Study Pass: {settlingSeat.studentName}</Text>
                  <TouchableOpacity onPress={() => setSettlingSeat(null)}>
                    <Text style={{ color: colors.error, fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inlineInputsGrid}>
                  <View style={{ flex: 2, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Choose pass category</Text>
                    <View style={styles.selectBoxArea}>
                      {['Daily Pass (₹50)', 'Hourly Card (₹20)', 'Monthly Premium (₹1200)'].map(c => (
                        <TouchableOpacity
                          key={c}
                          style={[
                            styles.smallSelectChip,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            billingCombo === c && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                          ]}
                          onPress={() => {
                            setBillingCombo(c);
                            if (c.includes('50')) setBillAmount('50');
                            else if (c.includes('20')) setBillAmount('20');
                            else setBillAmount('1200');
                          }}
                        >
                          <Text style={{ fontSize: 8, color: billingCombo === c ? colors.primary : colors.textMuted }}>{c}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Due Sum (₹)</Text>
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
                  onPress={handleSettlePassDues}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Confirm UPI & Settle Desk</Text>
                </TouchableOpacity>
              </GlassCard>
            )}
          </View>
        )}

        {activeTab === 'silent' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Focus Study Zone & Silence Warnings Ledger</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Ensure UPSC, GATE, and major competitive exam paper aspirants are not disturbed. Broadcast silent focus alarms.
              </Text>
            </View>

            {silentLogs.map(sl => (
              <GlassCard key={sl.id} style={styles.allergyCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{sl.studentName}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Logged: {sl.date} • {sl.focusType}</Text>
                  </View>
                  
                  <View style={[
                    styles.severityBadge, 
                    sl.severity === 'High' ? { backgroundColor: colors.error + '20' } : { backgroundColor: colors.accent + '20' }
                  ]}>
                    <ShieldAlert size={12} color={sl.severity === 'High' ? colors.error : colors.accent} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 9, color: sl.severity === 'High' ? colors.error : colors.accent, fontWeight: '900' }}>
                      STRICT SILENCE
                    </Text>
                  </View>
                </View>

                <View style={[styles.allergyWarningPanel, { borderTopColor: colors.border }]}>
                  <Text style={[styles.warningInstructionText, { color: colors.text }]}>
                    Focus Alarm: {sl.warning}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={[styles.verifiedAllergyBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
                  onPress={() => Share.share({ message: `Strict Focus alert at Study Hall Desk A2. Student ${sl.studentName} is writing a mock UPSC mains exam. Please maintain complete silence in this zone.` })}
                >
                  <Share2 size={13} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800' }}>Broadcast Silence Alert to Hall Channel</Text>
                </TouchableOpacity>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'passes' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Study Hall Monthly Pass Registry</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Track students with advance booked monthly study hall pass cards.
              </Text>
            </View>

            {[
              { id: 'p1', name: 'Rohan Sharma', goal: 'GATE CSE 2026', validity: 'Valid till 15 June 2026', room: 'Seat Desk B1' },
              { id: 'p2', name: 'Nisha Mehta', goal: 'UPSC IAS Prelims', validity: 'Valid till 30 May 2026', room: 'Seat Desk A4' }
            ].map(pass => (
              <GlassCard key={pass.id} style={styles.scheduleCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{pass.name}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Goal:  {pass.goal} ({pass.room})</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={{ fontSize: 9, color: colors.success, fontWeight: '900' }}>{pass.validity}</Text>
                  </View>
                </View>
                
                <View style={[styles.scheduleFooter, { borderTopColor: colors.border }]}>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>Desk Status: Pass Checked & Valid</Text>
                  <TouchableOpacity 
                    style={[styles.scheduleBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Alert.alert('Pass Verified', `${pass.name}'s monthly study pass successfully verified.`)}
                  >
                    <Text style={{ color: colors.text, fontSize: 10, fontWeight: '700' }}>Verify Student Card</Text>
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
            { id: 'seats', label: 'Study Seat Map', icon: BookOpen },
            { id: 'silent', label: 'Silent Focus Zone', icon: VolumeX },
            { id: 'passes', label: 'Study Passes', icon: Clock },
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
  allergyCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  studentNameText: {
    fontSize: 14,
    fontWeight: '800',
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
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
