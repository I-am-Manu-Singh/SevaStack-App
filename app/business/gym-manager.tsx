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
  Activity,
  Apple,
  Lock,
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
  HeartPulse,
  Award
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

import { CustomerBusinessView } from '@/components/CustomerBusinessView';

export default function GymManagerScreen() {
  const { userRole, businessType } = useApp();
  
  if (userRole === 'customer' || (businessType as string) !== 'Gym') {
    return <CustomerBusinessView type="Gym" />;
  }

  return <GymManagerScreenMerchant />;
}

function GymManagerScreenMerchant() {

  const { colors, theme, profile, userRole, businessType } = useApp();
  
  

  const [activeTab, setActiveTab] = useState<'members' | 'diets' | 'slots'>('members');

  // Supabase state
  const [members, setMembers] = useState<any[]>([]);
  const [diets, setDiets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const [membersData, dietsData] = await Promise.all([
        supabase.from('gym_members').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('gym_diets').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false })
      ]);

      let finalMembers = membersData.data || [];
      if (!membersData.data || membersData.data.length === 0) {
        const defaultMembers = [
          { student_name: 'Anuj Mishra', hostel: 'Hostel H-2', plan_type: '3-Month Premium', slot_time: 'Evening (5:00 PM - 7:00 PM)', locker: 'Locker 42', status: 'Active', days_left: 45, amount: 2500, date: 'Today' },
          { student_name: 'Rohit K.', hostel: 'Hostel H-1', plan_type: '1-Month Standard', slot_time: 'Morning (6:00 AM - 8:00 AM)', locker: 'Locker 12', status: 'Expired', days_left: 0, amount: 1000, date: 'Today' }
        ].map(m => ({ ...m, merchant_id: profile.id }));
        const seedRes = await supabase.from('gym_members').insert(defaultMembers).select();
        if (seedRes.data) finalMembers = seedRes.data;
      }

      const mappedMembers = finalMembers.map((row: any) => ({
        id: row.id,
        studentName: row.student_name,
        hostel: row.hostel,
        planType: row.plan_type,
        slotTime: row.slot_time,
        locker: row.locker,
        status: row.status,
        daysLeft: row.days_left,
        amount: row.amount,
        date: row.date
      }));
      setMembers(mappedMembers);

      let finalDiets = dietsData.data || [];
      if (!dietsData.data || dietsData.data.length === 0) {
        const defaultDiets = [
          { student_name: 'Anuj Mishra', plan_name: 'High Protein Bulk', protein: 160, carbs: 280, fats: 80, target_weight: 78, goal: 'Muscle Gain', progress: 40 },
          { student_name: 'Rohit K.', plan_name: 'Lean Cut Diet Plan', protein: 140, carbs: 120, fats: 50, target_weight: 70, goal: 'Fat Loss', progress: 75 }
        ].map(d => ({ ...d, merchant_id: profile.id }));
        const seedRes = await supabase.from('gym_diets').insert(defaultDiets).select();
        if (seedRes.data) finalDiets = seedRes.data;
      }

      const mappedDiets = finalDiets.map((row: any) => ({
        id: row.id,
        studentName: row.student_name,
        planName: row.plan_name,
        protein: row.protein,
        carbs: row.carbs,
        fats: row.fats,
        targetWeight: row.target_weight,
        goal: row.goal,
        progress: row.progress
      }));
      setDiets(mappedDiets);

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
  const [memberFilter, setMemberFilter] = useState<'All' | 'Active' | 'Expired'>('All');

  // Add Member states
  const [newMemberModal, setNewMemberModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newHostel, setNewHostel] = useState('');
  const [newPlan, setNewPlan] = useState('1-Month Standard');
  const [newLocker, setNewLocker] = useState('Locker 15');
  const [newSlot, setNewSlot] = useState('Evening (5:00 PM - 7:00 PM)');
  const [newAmount, setNewAmount] = useState('1000');

  // Add Diet states
  const [newDietModal, setNewDietModal] = useState(false);
  const [dietName, setDietName] = useState('');
  const [dPlan, setDPlan] = useState('High Protein Bulk');
  const [dProtein, setDProtein] = useState('150');
  const [dCarbs, setDCarbs] = useState('250');
  const [dFats, setDFats] = useState('70');
  const [dGoal, setDGoal] = useState('Muscle Gain');

  // Settle & Renew Pass State
  const [settlingMember, setSettlingMember] = useState<any | null>(null);
  const [renewAmount, setRenewAmount] = useState('1000');

  // Add New Member
  const handleAddNewMember = async () => {
    if (!newName) {
      Alert.alert('Missing Name', 'Please complete student name.');
      return;
    }
    if (!profile?.id) return;

    const days = newPlan.includes('3-Month') ? 90 : 30;
    const amountVal = parseInt(newAmount) || 1000;
    const lockerVal = newLocker || 'None';
    const dateVal = 'Renewed Just Now';

    const { data, error } = await supabase.from('gym_members').insert([{
      merchant_id: profile.id,
      student_name: newName,
      hostel: newHostel || 'Walk-in',
      plan_type: newPlan,
      slot_time: newSlot,
      locker: lockerVal,
      status: 'Active',
      days_left: days,
      amount: amountVal,
      date: dateVal
    }]).select();

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Member Enrolled', `Enrolled ${newName} on ${newPlan} with locker key ${lockerVal}.`);
    setNewName('');
    setNewHostel('');
    setNewMemberModal(false);
    fetchData();
  };

  // Add Nutrition Diet Chart Plan
  const handleAddDiet = async () => {
    if (!dietName) {
      Alert.alert('Missing Field', 'Please enter student name.');
      return;
    }
    if (!profile?.id) return;

    const { error } = await supabase.from('gym_diets').insert([{
      merchant_id: profile.id,
      student_name: dietName,
      plan_name: dPlan,
      protein: parseInt(dProtein) || 140,
      carbs: parseInt(dCarbs) || 200,
      fats: parseInt(dFats) || 60,
      target_weight: '75 kg',
      goal: dGoal,
      progress: 'On-Track'
    }]);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Diet Saved', `Custom diet saved successfully for ${dietName}.`);
    setDietName('');
    setNewDietModal(false);
    fetchData();
  };

  // Settle membership dues
  const handleRenewPass = async () => {
    if (!profile?.id || !settlingMember) return;
    const amountVal = parseInt(renewAmount) || 1000;

    const { error } = await supabase.from('gym_members').update({
      status: 'Active',
      days_left: 30,
      amount: amountVal,
      date: 'Renewed Today'
    }).eq('id', settlingMember.id);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Membership Renewed', `Settle check complete for ₹${amountVal} via UPI. Pass renewed for 30 days.`);
    setSettlingMember(null);
    fetchData();
  };

  // Filter lists
  const filteredMembers = members.filter(gm => {
    const matchesSearch = gm.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          gm.hostel.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          gm.locker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = memberFilter === 'All' || gm.status === memberFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <Stack.Screen options={{ 
        title: 'Gym & Fitness Hub',
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
        {activeTab === 'members' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Gym Subscriptions & Locker Desk</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Track monthly membership validities, allocate locker keys, and check scheduled workout hour slots.
              </Text>
            </View>

            {/* Quick Search and Add Member */}
            <View style={styles.searchRow}>
              <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search student, locker number..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.searchInput, { color: colors.text }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity 
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
                onPress={() => setNewMemberModal(!newMemberModal)}
              >
                <Plus size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Status Filter Row */}
            <View style={styles.filterRow}>
              {['All', 'Active', 'Expired'].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    memberFilter === f && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]}
                  onPress={() => setMemberFilter(f as any)}
                >
                  <Text style={[
                    styles.filterChipTxt,
                    { color: colors.textMuted },
                    memberFilter === f && { color: colors.primary, fontWeight: '700' }
                  ]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Add Member form modal */}
            {newMemberModal && (
              <GlassCard style={styles.modalFormCard}>
                <View style={styles.formHeaderRow}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Enroll Gym Member</Text>
                  <TouchableOpacity onPress={() => setNewMemberModal(false)}>
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
                  placeholder="Hostel / Room No"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newHostel}
                  onChangeText={setNewHostel}
                />

                <TextInput
                  placeholder="Workout slot (e.g. Evening 5-7 PM)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newSlot}
                  onChangeText={setNewSlot}
                />

                <View style={styles.inlineInputsGrid}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Choose Membership Plan</Text>
                    <View style={styles.selectBoxArea}>
                      {['1-Month', '3-Month'].map(p => (
                        <TouchableOpacity
                          key={p}
                          style={[
                            styles.smallSelectChip,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            newPlan.startsWith(p) && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                          ]}
                          onPress={() => {
                            setNewPlan(p === '1-Month' ? '1-Month Standard' : '3-Month Premium');
                            setNewAmount(p === '1-Month' ? '1000' : '2400');
                          }}
                        >
                          <Text style={{ fontSize: 9, color: newPlan.startsWith(p) ? colors.primary : colors.textMuted }}>{p}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Locker Key</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={newLocker}
                      onChangeText={setNewLocker}
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddNewMember}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Confirm Enrollment</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* List */}
            {filteredMembers.map(gm => (
              <GlassCard key={gm.id} style={styles.printCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{gm.studentName}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}> {gm.hostel} • {gm.date}</Text>
                  </View>
                  
                  <View style={[
                    styles.statusBadge, 
                    gm.status === 'Active' ? { backgroundColor: colors.success + '20' } : { backgroundColor: colors.error + '20' }
                  ]}>
                    <Activity size={11} color={gm.status === 'Active' ? colors.success : colors.error} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 9, color: gm.status === 'Active' ? colors.success : colors.error, fontWeight: '900' }}>
                      {gm.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={[styles.pdfDetailsPanel, { borderTopColor: colors.border }]}>
                  <HeartPulse size={16} color={colors.primary} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pdfNameLabel, { color: colors.text }]}>{gm.planType}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>
                      Slot: {gm.slotTime} • Key:  {gm.locker}
                    </Text>
                  </View>
                </View>

                <View style={[styles.invoiceRow, { borderTopColor: colors.border }]}>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>
                    {gm.status === 'Active' ? `Membership Validity:` : `Expired Balance Dues:`}
                  </Text>
                  <Text style={[styles.qtyDisplayTxt, { color: gm.status === 'Active' ? colors.success : colors.error }]}>
                    {gm.status === 'Active' ? `${gm.daysLeft} Days Remaining` : `₹${gm.amount} Due`}
                  </Text>
                </View>

                {/* Gym Actions */}
                <View style={styles.printActionArea}>
                  <TouchableOpacity 
                    style={[styles.shareSlipBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Share.share({ message: `Hi ${gm.studentName}, your gym fitness card for ${gm.planType} is ${gm.status}. Days Left: ${gm.daysLeft}. Settle due dues to continue workout slots.` })}
                  >
                    <Share2 size={13} color={colors.text} style={{ marginRight: 4 }} />
                    <Text style={{ color: colors.text, fontSize: 10, fontWeight: '700' }}>Alert Member</Text>
                  </TouchableOpacity>

                  {gm.status === 'Expired' && (
                    <TouchableOpacity 
                      style={[styles.transitionButton, { backgroundColor: colors.primary }]}
                      onPress={() => setSettlingMember(gm)}
                    >
                      <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900' }}>
                        Renew Subscription 
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </GlassCard>
            ))}

            {/* Settle Membership card modal */}
            {settlingMember && (
              <GlassCard style={styles.billFormCard}>
                <View style={styles.formHeaderRow}>
                  <QrCode size={18} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Renew Card: {settlingMember.studentName}</Text>
                  <TouchableOpacity onPress={() => setSettlingMember(null)}>
                    <Text style={{ color: colors.error, fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inlineInputsGrid}>
                  <View style={{ flex: 2, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Choose Renewal Package</Text>
                    <View style={styles.selectBoxArea}>
                      {['1-Month Pass (₹1000)', '3-Month Pass (₹2400)'].map(c => (
                        <TouchableOpacity
                          key={c}
                          style={[
                            styles.smallSelectChip,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            newPlan === c && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                          ]}
                          onPress={() => {
                            setNewPlan(c);
                            if (c.includes('1000')) setRenewAmount('1000');
                            else setRenewAmount('2400');
                          }}
                        >
                          <Text style={{ fontSize: 8, color: colors.primary }}>{c}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Price Settle (₹)</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={renewAmount}
                      onChangeText={setRenewAmount}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.success }]}
                  onPress={handleRenewPass}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Settle Dues & Renew Card</Text>
                </TouchableOpacity>
              </GlassCard>
            )}
          </View>
        )}

        {activeTab === 'diets' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Student Diet & Workout Nutrition Plans</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Design tailored diet macro plans (Protein, Carbs, Fats) and targeted muscle gain goals for college fitness aspirants.
              </Text>
            </View>

            {/* Quick add Diet */}
            <TouchableOpacity 
              style={[styles.miniAddBtn, { backgroundColor: colors.primary, marginBottom: 12, alignSelf: 'flex-end' }]}
              onPress={() => setNewDietModal(!newDietModal)}
            >
              <Plus size={14} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>Create Diet Plan</Text>
            </TouchableOpacity>

            {newDietModal && (
              <GlassCard style={styles.modalFormCard}>
                <View style={styles.formHeaderRow}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>New Nutrition Sheet</Text>
                  <TouchableOpacity onPress={() => setNewDietModal(false)}>
                    <Text style={{ color: colors.error, fontWeight: '700' }}>Close</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Student Full Name"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={dietName}
                  onChangeText={setDietName}
                />

                <TextInput
                  placeholder="Diet Plan Name (e.g. High Protein Gain)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={dPlan}
                  onChangeText={setDPlan}
                />

                <View style={styles.inlineInputsGrid}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Protein (g)</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={dProtein}
                      onChangeText={setDProtein}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Carbs (g)</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={dCarbs}
                      onChangeText={setDCarbs}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Fats (g)</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={dFats}
                      onChangeText={setDFats}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddDiet}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Save Nutrition Card</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {diets.map(d => (
              <GlassCard key={d.id} style={styles.packCard}>
                <View style={styles.subCardHeader}>
                  <Apple size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{d.studentName}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}> {d.goal} • Target Weight: {d.targetWeight}</Text>
                  </View>
                  <TouchableOpacity 
                    style={{ padding: 4 }}
                    onPress={() => Share.share({ message: `Nutrition Plan for ${d.studentName}: ${d.planName} (Protein: ${d.protein}g, Carbs: ${d.carbs}g, Fats: ${d.fats}g). Goal: ${d.goal}. Target: ${d.targetWeight}.` })}
                  >
                    <Share2 size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Macro Split Grid */}
                <View style={[styles.fitGridArea, { borderTopColor: colors.border }]}>
                  {[
                    { label: 'PLAN', val: d.planName },
                    { label: 'PROTEIN', val: `${d.protein}g` },
                    { label: 'CARBS', val: `${d.carbs}g` },
                    { label: 'FATS', val: `${d.fats}g` },
                    { label: 'PROGRESS', val: d.progress }
                  ].map((stat, idx) => (
                    <View key={idx} style={styles.fitMeasureCell}>
                      <Text style={{ fontSize: 9, color: colors.textMuted }}>{stat.label}</Text>
                      <Text style={{ fontSize: 11, fontWeight: '900', color: colors.text, marginTop: 2 }}>{stat.val}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'slots' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> trainer Assessments & Workout Blocks</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Fitness slot assessments pre-booked by students to check body fat metrics or receive active personal coaching.
              </Text>
            </View>

            {[
              { id: 't1', name: 'Vikram Grover', goal: 'Personal Workout Checkup', time: '07:00 AM - 07:30 AM', status: 'Booked' },
              { id: 't2', name: 'Sneha Jain', goal: 'Fat Percentage Assessment', time: '06:00 PM - 06:30 PM', status: 'Completed' }
            ].map(trial => (
              <GlassCard key={trial.id} style={styles.scheduleCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{trial.name}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Fit Goal:  {trial.goal}</Text>
                  </View>
                  <View style={[styles.statusBadge, trial.status === 'Completed' ? { backgroundColor: colors.success + '20' } : { backgroundColor: colors.primary + '20' }]}>
                    <Text style={{ fontSize: 9, color: trial.status === 'Completed' ? colors.success : colors.primary, fontWeight: '900' }}>{trial.time}</Text>
                  </View>
                </View>
                
                <View style={[styles.scheduleFooter, { borderTopColor: colors.border }]}>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>Status: {trial.status}</Text>
                  {trial.status === 'Booked' && (
                    <TouchableOpacity 
                      style={[styles.scheduleBtn, { backgroundColor: colors.surfaceLight }]}
                      onPress={() => Alert.alert('Assessment Completed', `Workout slot coaching completed successfully for ${trial.name}.`)}
                    >
                      <Text style={{ color: colors.text, fontSize: 10, fontWeight: '700' }}>Log Workout Completed</Text>
                    </TouchableOpacity>
                  )}
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
            { id: 'members', label: 'Active Subscriptions', icon: Activity },
            { id: 'diets', label: 'Diet & Macro Plans', icon: Apple },
            { id: 'slots', label: 'Trainer Workouts', icon: Clock },
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
  },
  fitMeasureCell: {
    alignItems: 'center',
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
  inlineInputsGrid: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 10,
    marginBottom: 2,
    fontWeight: '700',
  },
  billFormCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
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
