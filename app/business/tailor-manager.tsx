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
  Shirt,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Share2,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  QrCode,
  Sliders,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

import { CustomerBusinessView } from '@/components/CustomerBusinessView';

export default function TailorManagerScreen() {
  const { userRole, businessType } = useApp();
  
  if (userRole === 'customer' || businessType !== 'Tailor') {
    return <CustomerBusinessView type="Tailor" />;
  }

  return <TailorManagerScreenMerchant />;
}

function TailorManagerScreenMerchant() {

  const { colors, theme, profile, userRole, businessType } = useApp();
  
  

  const [activeTab, setActiveTab] = useState<'stitching' | 'measurements' | 'trials'>('stitching');

  // Supabase states
  const [stitchJobs, setStitchJobs] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const [jobsData, measuresData] = await Promise.all([
        supabase.from('tailor_jobs').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('tailor_measurements').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false })
      ]);

      let finalJobs = jobsData.data || [];
      if (!jobsData.data || jobsData.data.length === 0) {
        const defaultJobs = [
          { customer_name: 'Rahul K.', item_type: 'College Blazer', progress_status: 'Fabric Cutting', details: 'Dark Blue velvet buttons, standard fit', amount: 2200 },
          { customer_name: 'Riya Sharma', item_type: 'Ethnic Kurti Alteration', progress_status: 'Under Stitching', details: 'Shorten length by 2 inches, tighten waist', amount: 350 }
        ].map(j => ({ ...j, merchant_id: profile.id }));
        const seedRes = await supabase.from('tailor_jobs').insert(defaultJobs).select();
        if (seedRes.data) finalJobs = seedRes.data;
      }

      const mappedJobs = finalJobs.map((row: any) => ({
        id: row.id,
        studentName: row.customer_name,
        hostel: 'Hostel Block', // default display label since it isn't in DB columns
        itemType: row.item_type,
        progress: row.progress_status,
        details: row.details,
        amount: parseFloat(row.amount) || 0.0,
        date: 'Today'
      }));
      setStitchJobs(mappedJobs);

      let finalMeasures = measuresData.data || [];
      if (!measuresData.data || measuresData.data.length === 0) {
        const defaultMeasures = [
          { student_name: 'Rahul K.', chest: 39, waist: 33, shoulder: 18, sleeves: 25, collar: 15.5, length: 30 },
          { student_name: 'Riya Sharma', chest: 34, waist: 28, shoulder: 15, sleeves: 21, collar: 14, length: 26 }
        ].map(m => ({ ...m, merchant_id: profile.id }));
        const seedRes = await supabase.from('tailor_measurements').insert(defaultMeasures).select();
        if (seedRes.data) finalMeasures = seedRes.data;
      }

      const mappedMeasures = finalMeasures.map((row: any) => ({
        id: row.id,
        studentName: row.student_name,
        chest: parseFloat(row.chest) || 0,
        waist: parseFloat(row.waist) || 0,
        shoulder: parseFloat(row.shoulder) || 0,
        sleeves: parseFloat(row.sleeves) || 0,
        collar: parseFloat(row.collar) || 0,
        length: parseFloat(row.length) || 0
      }));
      setMeasurements(mappedMeasures);

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
  const [stitchFilter, setStitchFilter] = useState<'All' | 'Fabric Cutting' | 'Under Stitching' | 'Ready for Dispatch'>('All');

  // Add Stitch Job states
  const [newJobModal, setNewJobModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newHostel, setNewHostel] = useState('');
  const [newItemType, setNewItemType] = useState('Fest Suit');
  const [newDetails, setNewDetails] = useState('');
  const [newAmount, setNewAmount] = useState('1500');

  // Measurement form state
  const [newMeasureModal, setNewMeasureModal] = useState(false);
  const [measureName, setMeasureName] = useState('');
  const [mChest, setMChest] = useState('38');
  const [mWaist, setMWaist] = useState('32');
  const [mShoulder, setMShoulder] = useState('17');
  const [mSleeves, setMSleeves] = useState('24');
  const [mLength, setMLength] = useState('28');

  // Add Measurement Profile
  const handleAddMeasurement = async () => {
    if (!measureName) {
      Alert.alert('Missing Field', 'Please enter student name.');
      return;
    }
    if (!profile?.id) return;

    const chestVal = parseFloat(mChest) || 38;
    const waistVal = parseFloat(mWaist) || 32;
    const shoulderVal = parseFloat(mShoulder) || 17;
    const sleevesVal = parseFloat(mSleeves) || 24;
    const lengthVal = parseFloat(mLength) || 28;

    const { error } = await supabase.from('tailor_measurements').insert([{
      merchant_id: profile.id,
      student_name: measureName,
      chest: chestVal,
      waist: waistVal,
      shoulder: shoulderVal,
      sleeves: sleevesVal,
      collar: 15,
      length: lengthVal
    }]);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Profile Saved', `Measurements saved successfully for ${measureName}.`);
    setMeasureName('');
    setNewMeasureModal(false);
    fetchData();
  };

  // Add Stitching Job
  const handleAddNewJob = async () => {
    if (!newName || !newItemType) {
      Alert.alert('Missing Fields', 'Please complete student and item specifications.');
      return;
    }
    if (!profile?.id) return;

    const amtVal = parseFloat(newAmount) || 800;

    const { error } = await supabase.from('tailor_jobs').insert([{
      merchant_id: profile.id,
      customer_name: newName,
      item_type: newItemType,
      progress_status: 'Fabric Cutting',
      details: newDetails || 'Standard Fit',
      amount: amtVal
    }]);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Stitching Booked', `Registered new tailor job: ${newItemType} for ${newName}.`);
    setNewName('');
    setNewHostel('');
    setNewDetails('');
    setNewAmount('1500');
    setNewJobModal(false);
    fetchData();
  };

  // Transition stitching status
  const transitionStitchStatus = async (id: string, currentStatus: string) => {
    if (!profile?.id) return;
    const statusSequence = ['Fabric Cutting', 'Under Stitching', 'Ready for Dispatch', 'Delivered'];
    const nextIdx = statusSequence.indexOf(currentStatus) + 1;
    if (nextIdx >= statusSequence.length) return;

    const nextStatus = statusSequence[nextIdx];

    const { error } = await supabase.from('tailor_jobs').update({
      progress_status: nextStatus
    }).eq('id', id);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    if (nextStatus === 'Delivered') {
      const match = stitchJobs.find(sj => sj.id === id);
      Alert.alert('Stitch Delivery Completed', `Cleared ₹${match?.amount || 0} balance and handed apparel over.`);
    }

    fetchData();
  };

  // Filter lists
  const filteredJobs = stitchJobs.filter(sj => {
    const matchesSearch = sj.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sj.itemType.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sj.hostel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = stitchFilter === 'All' || sj.progress === stitchFilter;
    return matchesSearch && matchesFilter && sj.progress !== 'Delivered';
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <Stack.Screen options={{ 
        title: 'Boutique & Tailor Hub',
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
        {activeTab === 'stitching' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Stitching Timelines Desk</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Track customized garment orders, progress stitching timelines, and log pick deliveries.
              </Text>
            </View>

            {/* Quick Search and Add Stitch */}
            <View style={styles.searchRow}>
              <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search student, garment item..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.searchInput, { color: colors.text }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity 
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
                onPress={() => setNewJobModal(!newJobModal)}
              >
                <Plus size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Status Filter Row */}
            <View style={styles.filterRow}>
              {['All', 'Fabric Cutting', 'Under Stitching', 'Ready for Dispatch'].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    stitchFilter === f && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]}
                  onPress={() => setStitchFilter(f as any)}
                >
                  <Text style={[
                    styles.filterChipTxt,
                    { color: colors.textMuted },
                    stitchFilter === f && { color: colors.primary, fontWeight: '700' }
                  ]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Add Stitching Job Form Card */}
            {newJobModal && (
              <GlassCard style={styles.modalFormCard}>
                <View style={styles.formHeaderRow}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Stitch Garment Order</Text>
                  <TouchableOpacity onPress={() => setNewJobModal(false)}>
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
                  placeholder="Apparel Garment (e.g. Blazers, Kurta Alteration)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newItemType}
                  onChangeText={setNewItemType}
                />

                <TextInput
                  placeholder="Custom Styling Details (buttons, fitment style)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newDetails}
                  onChangeText={setNewDetails}
                />

                <TextInput
                  placeholder="Total Stitching Charges (₹)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newAmount}
                  onChangeText={setNewAmount}
                  keyboardType="numeric"
                />

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddNewJob}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Confirm Stitching Order</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* List */}
            {filteredJobs.map(sj => (
              <GlassCard key={sj.id} style={styles.printCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{sj.studentName}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}> {sj.hostel} • {sj.date}</Text>
                  </View>
                  
                  <View style={[
                    styles.statusBadge, 
                    sj.progress === 'Ready for Dispatch' ? { backgroundColor: colors.success + '20' } : { backgroundColor: colors.accent + '20' }
                  ]}>
                    <Scissors size={11} color={sj.progress === 'Ready for Dispatch' ? colors.success : colors.accent} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 9, color: sj.progress === 'Ready for Dispatch' ? colors.success : colors.accent, fontWeight: '900' }}>
                      {sj.progress.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={[styles.pdfDetailsPanel, { borderTopColor: colors.border }]}>
                  <Shirt size={16} color={colors.primary} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pdfNameLabel, { color: colors.text }]}>{sj.itemType}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>
                      {sj.details}
                    </Text>
                  </View>
                </View>

                <View style={[styles.invoiceRow, { borderTopColor: colors.border }]}>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>Stitching Invoiced Fee:</Text>
                  <Text style={[styles.qtyDisplayTxt, { color: colors.text }]}>₹{sj.amount}</Text>
                </View>

                {/* Tailor Actions */}
                <View style={styles.printActionArea}>
                  <TouchableOpacity 
                    style={[styles.shareSlipBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Share.share({ message: `Hi ${sj.studentName}, your apparel stitching order for ${sj.itemType} is now ${sj.progress}. Balance due: ₹${sj.amount}. Please collect at the boutique desk.` })}
                  >
                    <Share2 size={13} color={colors.text} style={{ marginRight: 4 }} />
                    <Text style={{ color: colors.text, fontSize: 10, fontWeight: '700' }}>Alert Client</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.transitionButton, { backgroundColor: colors.primary }]}
                    onPress={() => transitionStitchStatus(sj.id, sj.progress)}
                  >
                    <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900' }}>
                      {sj.progress === 'Fabric Cutting' && 'Start Stitching '}
                      {sj.progress === 'Under Stitching' && 'Mark Ready for Trial '}
                      {sj.progress === 'Ready for Dispatch' && 'Confirm Fitting & Settle '}
                    </Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'measurements' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Custom Fit Measurement Cards</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Store permanent body size records for student clients. Avoid taking measurements repeatedly for new college orders.
              </Text>
            </View>

            {/* Quick add Measurement */}
            <TouchableOpacity 
              style={[styles.miniAddBtn, { backgroundColor: colors.primary, marginBottom: 12, alignSelf: 'flex-end' }]}
              onPress={() => setNewMeasureModal(!newMeasureModal)}
            >
              <Plus size={14} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>Create Size Card</Text>
            </TouchableOpacity>

            {newMeasureModal && (
              <GlassCard style={styles.modalFormCard}>
                <View style={styles.formHeaderRow}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>New Measurement Card</Text>
                  <TouchableOpacity onPress={() => setNewMeasureModal(false)}>
                    <Text style={{ color: colors.error, fontWeight: '700' }}>Close</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Student Full Name"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={measureName}
                  onChangeText={setMeasureName}
                />

                <View style={styles.inlineInputsGrid}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Chest (in)</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={mChest}
                      onChangeText={setMChest}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Waist (in)</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={mWaist}
                      onChangeText={setMWaist}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Sleeves (in)</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={mSleeves}
                      onChangeText={setMSleeves}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddMeasurement}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Save Size Card</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {measurements.map(m => (
              <GlassCard key={m.id} style={styles.packCard}>
                <View style={styles.subCardHeader}>
                  <Shirt size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={[styles.studentNameText, { color: colors.text, flex: 1 }]}>{m.studentName}</Text>
                  <TouchableOpacity 
                    style={{ padding: 4 }}
                    onPress={() => Share.share({ message: `Fitting Card - Name: ${m.studentName}, Chest: ${m.chest}", Waist: ${m.waist}", Shoulder: ${m.shoulder}", Sleeves: ${m.sleeves}", Length: ${m.length}"` })}
                  >
                    <Share2 size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Measurements stats grid */}
                <View style={[styles.fitGridArea, { borderTopColor: colors.border }]}>
                  {[
                    { label: 'CHEST', val: `${m.chest}"` },
                    { label: 'WAIST', val: `${m.waist}"` },
                    { label: 'SHOULDER', val: `${m.shoulder}"` },
                    { label: 'SLEEVES', val: `${m.sleeves}"` },
                    { label: 'LENGTH', val: `${m.length}"` }
                  ].map((stat, idx) => (
                    <View key={idx} style={styles.fitMeasureCell}>
                      <Text style={{ fontSize: 9, color: colors.textMuted }}>{stat.label}</Text>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: colors.text, marginTop: 2 }}>{stat.val}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'trials' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Pre-booked Fitting Trial Slots</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Fitting slots scheduled by student clients to test apparel fitment, preventing overlapping trial desk crowds.
              </Text>
            </View>

            {[
              { id: 't1', name: 'Vikram Grover', apparel: 'College Fest Blazer', time: '12:30 PM - 01:00 PM', status: 'Booked' },
              { id: 't2', name: 'Sneha Jain', apparel: 'Traditional Kurta Alteration', time: '04:00 PM - 04:30 PM', status: 'Completed' }
            ].map(trial => (
              <GlassCard key={trial.id} style={styles.scheduleCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{trial.name}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Fitment:  {trial.apparel}</Text>
                  </View>
                  <View style={[styles.statusBadge, trial.status === 'Completed' ? { backgroundColor: colors.success + '20' } : { backgroundColor: colors.primary + '20' }]}>
                    <Text style={{ fontSize: 9, color: trial.status === 'Completed' ? colors.success : colors.primary, fontWeight: '900' }}>{trial.time}</Text>
                  </View>
                </View>
                
                <View style={[styles.scheduleFooter, { borderTopColor: colors.border }]}>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>Trial State: {trial.status}</Text>
                  {trial.status === 'Booked' && (
                    <TouchableOpacity 
                      style={[styles.scheduleBtn, { backgroundColor: colors.surfaceLight }]}
                      onPress={() => Alert.alert('Trial Logged', `Fitting trial successfully completed for ${trial.name}.`)}
                    >
                      <Text style={{ color: colors.text, fontSize: 10, fontWeight: '700' }}>Log Trial Done</Text>
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
            { id: 'stitching', label: 'Stitching Desk', icon: Scissors },
            { id: 'measurements', label: 'Measurement Cards', icon: Sliders },
            { id: 'trials', label: 'Fitting Trial Slots', icon: Clock },
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
