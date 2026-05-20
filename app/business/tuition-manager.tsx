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
  GraduationCap,
  BookOpen,
  FileText,
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
  Award
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

import { CustomerBusinessView } from '@/components/CustomerBusinessView';

export default function TuitionManagerScreen() {
  const { userRole, businessType } = useApp();
  
  if (userRole === 'customer' || businessType !== 'Tuition') {
    return <CustomerBusinessView type="Tuition" />;
  }

  return <TuitionManagerScreenMerchant />;
}

function TuitionManagerScreenMerchant() {

  const { colors, theme, profile, userRole, businessType } = useApp();
  
  

  const [activeTab, setActiveTab] = useState<'slots' | 'tests' | 'resources'>('slots');

  // Dynamic Supabase State
  const [slots, setSlots] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const [slotsData, testsData, resourcesData] = await Promise.all([
        supabase.from('tuition_slots').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('tuition_tests').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('tuition_resources').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false })
      ]);
      let finalSlots = slotsData.data || [];
      if (!slotsData.data || slotsData.data.length === 0) {
        const defaultSlots = [
          { student_name: 'Pankaj Kumar', subject: 'Physics Clinic', topic: 'Rotational Dynamics Doubt', time_slot: '04:00 PM - 04:15 PM', status: 'Booked', date: 'Today' },
          { student_name: 'Sanya Gupta', subject: 'Chemistry Clinic', topic: 'Electrochemical Cell Redox', time_slot: '04:30 PM - 04:45 PM', status: 'In Session', date: 'Today' }
        ].map(s => ({ ...s, merchant_id: profile.id }));
        const seedRes = await supabase.from('tuition_slots').insert(defaultSlots).select();
        if (seedRes.data) finalSlots = seedRes.data;
      }

      const mappedSlots = finalSlots.map((row: any) => ({
        id: row.id,
        studentName: row.student_name,
        subject: row.subject,
        topic: row.topic,
        timeSlot: row.time_slot,
        status: row.status,
        date: row.date || 'Today'
      }));
      setSlots(mappedSlots);

      let finalTests = testsData.data || [];
      if (!testsData.data || testsData.data.length === 0) {
        const defaultTests = [
          { student_name: 'Pankaj Kumar', test_name: 'JEE Mock Test #08', physics_score: 95, chemistry_score: 90, math_score: 98, rank: 'AIR Mock Rank: 18' },
          { student_name: 'Sanya Gupta', test_name: 'JEE Mock Test #08', physics_score: 88, chemistry_score: 92, math_score: 85, rank: 'AIR Mock Rank: 104' }
        ].map(t => ({ ...t, merchant_id: profile.id }));
        const seedRes = await supabase.from('tuition_tests').insert(defaultTests).select();
        if (seedRes.data) finalTests = seedRes.data;
      }

      const mappedTests = finalTests.map((row: any) => ({
        id: row.id,
        studentName: row.student_name,
        testName: row.test_name,
        physicsScore: row.physics_score || 0,
        chemistryScore: row.chemistry_score || 0,
        mathScore: row.math_score || 0,
        rank: row.rank || 'AIR Mock Grade'
      }));
      setTests(mappedTests);

      let finalResources = resourcesData.data || [];
      if (!resourcesData.data || resourcesData.data.length === 0) {
        const defaultResources = [
          { title: 'Newtonian Mechanics Formulas PDF', category: 'Physics Notes', download_url: 'https://pdfhost.io/v/newtonian', active: true },
          { title: 'Organic Chemistry Reactions Summary', category: 'Chemistry Notes', download_url: 'https://pdfhost.io/v/organic', active: true },
          { title: 'Integration Short Tricks Sheet', category: 'Math Notes', download_url: 'https://pdfhost.io/v/integration', active: true }
        ].map(r => ({ ...r, merchant_id: profile.id }));
        const seedRes = await supabase.from('tuition_resources').insert(defaultResources).select();
        if (seedRes.data) finalResources = seedRes.data;
      }

      const mappedResources = finalResources.map((row: any) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        downloadUrl: row.download_url,
        active: row.active
      }));
      setResources(mappedResources);

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
  const [slotFilter, setSlotFilter] = useState<'All' | 'Booked' | 'In Session' | 'Doubt Cleared'>('All');

  // Add Doubt Slot state
  const [newSlotModal, setNewSlotModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSubject, setNewSubject] = useState('Physics Clinic');
  const [newTopic, setNewTopic] = useState('Newton Laws of Motion');
  const [newTime, setNewTime] = useState('05:00 PM - 05:15 PM');

  // Add Mock Test score state
  const [newTestModal, setNewTestModal] = useState(false);
  const [testStudent, setTestStudent] = useState('');
  const [testTitle, setTestTitle] = useState('JEE Mock Test #09');
  const [phyScore, setPhyScore] = useState('80');
  const [chemScore, setChemScore] = useState('85');
  const [mathScore, setMathScore] = useState('90');

  // Add resource state
  const [newResourceModal, setNewResourceModal] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resCat, setResCat] = useState('Physics Notes');
  const [resUrl, setResUrl] = useState('https://pdfhost.io/v/custom');

  // Add Doubt Slot
  const handleAddNewSlot = async () => {
    if (!newName || !newTopic) {
      Alert.alert('Missing Fields', 'Please complete student name and doubt details.');
      return;
    }
    if (!profile?.id) return;

    try {
      const { error } = await supabase.from('tuition_slots').insert([{
        merchant_id: profile.id,
        student_name: newName,
        subject: newSubject,
        topic: newTopic,
        time_slot: newTime,
        status: 'Booked',
        date: 'Today'
      }]);

      if (error) throw error;

      Alert.alert('Slot Tokenized', `Generated doubt clearing slot for ${newName}. Topic: ${newTopic}.`);
      setNewName('');
      setNewTopic('');
      setNewSlotModal(false);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  // Transition doubt slot stage
  const transitionSlotStatus = async (id: string, currentStatus: string) => {
    const statusSequence = ['Booked', 'In Session', 'Doubt Cleared'];
    const nextIdx = statusSequence.indexOf(currentStatus) + 1;
    if (nextIdx >= statusSequence.length) return;

    const nextStatus = statusSequence[nextIdx];

    try {
      const { error } = await supabase.from('tuition_slots').update({ status: nextStatus }).eq('id', id);
      if (error) throw error;

      if (nextStatus === 'Doubt Cleared') {
        const target = slots.find(s => s.id === id);
        Alert.alert('Slot Completed', `Doubt of ${target?.studentName || 'student'} marked as resolved successfully.`);
      }
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  // Save Mock Test Score
  const handleAddTestScore = async () => {
    if (!testStudent) {
      Alert.alert('Missing Name', 'Please complete student name.');
      return;
    }
    if (!profile?.id) return;

    try {
      const { error } = await supabase.from('tuition_tests').insert([{
        merchant_id: profile.id,
        student_name: testStudent,
        test_name: testTitle,
        physics_score: parseInt(phyScore) || 0,
        chemistry_score: parseInt(chemScore) || 0,
        math_score: parseInt(mathScore) || 0,
        rank: 'AIR Mock Grade'
      }]);

      if (error) throw error;

      Alert.alert('Scores Saved', `Mock scores for ${testStudent} logged under ${testTitle}.`);
      setTestStudent('');
      setNewTestModal(false);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  // Add study resource note
  const handleAddResource = async () => {
    if (!resTitle) {
      Alert.alert('Missing Title', 'Please complete resource title.');
      return;
    }
    if (!profile?.id) return;

    try {
      const { error } = await supabase.from('tuition_resources').insert([{
        merchant_id: profile.id,
        title: resTitle,
        category: resCat,
        download_url: resUrl,
        active: true
      }]);

      if (error) throw error;

      Alert.alert('Resource Shared', `Published "${resTitle}" inside resources drawer.`);
      setResTitle('');
      setNewResourceModal(false);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const filteredSlots = slots.filter(sl => {
    const matchesSearch = sl.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sl.topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sl.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = slotFilter === 'All' || sl.status === slotFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <Stack.Screen options={{ 
        title: 'Tuition & Coaching desk',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerShown: true
      }} />

      <ScrollView 
         showsVerticalScrollIndicator={false} 
         contentContainerStyle={styles.scrollContent}
         refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        
        {activeTab === 'slots' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Doubt Slot Clinic Booking</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Schedule 1-on-1 doubt clearing clinic slots for student PGS. Minimize doubt clusters, clear Physics/Chemistry questions.
              </Text>
            </View>

            {/* Quick Search and Add Slot */}
            <View style={styles.searchRow}>
              <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search student, clinic, topic..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.searchInput, { color: colors.text }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity 
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
                onPress={() => setNewSlotModal(!newSlotModal)}
              >
                <Plus size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Slot filters */}
            <View style={styles.filterRow}>
              {['All', 'Booked', 'In Session', 'Doubt Cleared'].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    slotFilter === f && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]}
                  onPress={() => setSlotFilter(f as any)}
                >
                  <Text style={[
                    styles.filterChipTxt,
                    { color: colors.textMuted },
                    slotFilter === f && { color: colors.primary, fontWeight: '700' }
                  ]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Add Doubt Slot form modal */}
            {newSlotModal && (
              <GlassCard style={styles.modalFormCard}>
                <View style={styles.formHeaderRow}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Book Doubt Slot</Text>
                  <TouchableOpacity onPress={() => setNewSlotModal(false)}>
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
                  placeholder="Clinic Subject (e.g. Physics Clinic)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newSubject}
                  onChangeText={setNewSubject}
                />

                <TextInput
                  placeholder="Doubt Topic Details..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newTopic}
                  onChangeText={setNewTopic}
                />

                <TextInput
                  placeholder="Time Block (e.g. 05:00 PM - 05:15 PM)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newTime}
                  onChangeText={setNewTime}
                />

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddNewSlot}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Confirm Slot Booking</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* List */}
            {filteredSlots.map(sl => (
              <GlassCard key={sl.id} style={styles.printCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{sl.studentName}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}> Slot: {sl.timeSlot} • {sl.date}</Text>
                  </View>
                  
                  <View style={[
                    styles.statusBadge, 
                    sl.status === 'Doubt Cleared' ? { backgroundColor: colors.success + '20' } : { backgroundColor: colors.accent + '20' }
                  ]}>
                    <GraduationCap size={11} color={sl.status === 'Doubt Cleared' ? colors.success : colors.accent} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 9, color: sl.status === 'Doubt Cleared' ? colors.success : colors.accent, fontWeight: '900' }}>
                      {sl.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={[styles.pdfDetailsPanel, { borderTopColor: colors.border }]}>
                  <BookOpen size={16} color={colors.primary} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pdfNameLabel, { color: colors.text }]}>{sl.subject}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>
                      Topic: {sl.topic}
                    </Text>
                  </View>
                </View>

                {/* Doubt Actions */}
                <View style={styles.printActionArea}>
                  <TouchableOpacity 
                    style={[styles.shareSlipBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Share.share({ message: `Hi ${sl.studentName}, your doubt slot for "${sl.subject}" on "${sl.topic}" is booked during ${sl.timeSlot}. Be on time! - Seva Tuition Clinic` })}
                  >
                    <Share2 size={13} color={colors.text} style={{ marginRight: 4 }} />
                    <Text style={{ color: colors.text, fontSize: 10, fontWeight: '700' }}>Remind Student</Text>
                  </TouchableOpacity>

                  {sl.status !== 'Doubt Cleared' && (
                    <TouchableOpacity 
                      style={[styles.transitionButton, { backgroundColor: colors.primary }]}
                      onPress={() => transitionSlotStatus(sl.id, sl.status)}
                    >
                      <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900' }}>
                        {sl.status === 'Booked' && 'Start Session '}
                        {sl.status === 'In Session' && 'Mark Doubt Cleared '}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'tests' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Mock Test Grade Performance Ledger</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Track mock exam physics, chemistry, and mathematics score splits. Plot progress and verify percentiles.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 }}>
              <TouchableOpacity 
                style={[styles.miniAddBtn, { backgroundColor: colors.primary }]}
                onPress={() => setNewTestModal(!newTestModal)}
              >
                <Plus size={14} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>Log Mock Grade</Text>
              </TouchableOpacity>
            </View>

            {/* Add Score Modal */}
            {newTestModal && (
              <GlassCard style={styles.modalFormCard}>
                <View style={styles.formHeaderRow}>
                  <Award size={16} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Record Score Card</Text>
                  <TouchableOpacity onPress={() => setNewTestModal(false)}>
                    <Text style={{ color: colors.error, fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Student Full Name"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={testStudent}
                  onChangeText={setTestStudent}
                />

                <TextInput
                  placeholder="Mock Exam Title (e.g. JEE Mock #09)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={testTitle}
                  onChangeText={setTestTitle}
                />

                <View style={styles.inlineInputsGrid}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Physics</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={phyScore}
                      onChangeText={setPhyScore}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Chemistry</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={chemScore}
                      onChangeText={setChemScore}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Maths</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={mathScore}
                      onChangeText={setMathScore}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddTestScore}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Save Score Card</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* List */}
            {tests.map(ts => (
              <GlassCard key={ts.id} style={styles.packCard}>
                <View style={styles.subCardHeader}>
                  <Award size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{ts.studentName}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Exam: {ts.testName}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={{ fontSize: 9, color: colors.success, fontWeight: '900' }}>{ts.rank}</Text>
                  </View>
                </View>

                {/* Score Split Grid */}
                <View style={[styles.fitGridArea, { borderTopColor: colors.border }]}>
                  {[
                    { label: 'PHYSICS', val: `${ts.physicsScore} / 100` },
                    { label: 'CHEMISTRY', val: `${ts.chemistryScore} / 100` },
                    { label: 'MATHEMATICS', val: ts.mathScore > 0 ? `${ts.mathScore} / 100` : 'N/A' },
                    { label: 'AVERAGE', val: ts.mathScore > 0 ? `${Math.round((ts.physicsScore + ts.chemistryScore + ts.mathScore) / 3)}%` : `${Math.round((ts.physicsScore + ts.chemistryScore) / 2)}%` }
                  ].map((stat, idx) => (
                    <View key={idx} style={styles.fitMeasureCell}>
                      <Text style={{ fontSize: 9, color: colors.textMuted }}>{stat.label}</Text>
                      <Text style={{ fontSize: 11, fontWeight: '900', color: colors.text, marginTop: 2 }}>{stat.val}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.surfaceLight, height: 32, marginTop: 12 }]}
                  onPress={() => Share.share({ message: `Student Report Alert! ${ts.studentName} Mock Score Card under ${ts.testName}: Physics: ${ts.physicsScore}, Chemistry: ${ts.chemistryScore}, Mathematics: ${ts.mathScore}. AIR rank: ${ts.rank}. keep it up!` })}
                >
                  <Text style={{ color: colors.text, fontSize: 10, fontWeight: '800' }}>Share Scorecard with parents</Text>
                </TouchableOpacity>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'resources' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> DPP & Handwritten Study Resources</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Share Daily Practice Problem sheets (DPPs), coaching booklets, and Organic Chemistry hand-written note links.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 }}>
              <TouchableOpacity 
                style={[styles.miniAddBtn, { backgroundColor: colors.primary }]}
                onPress={() => setNewResourceModal(!newResourceModal)}
              >
                <Plus size={14} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>Publish Resource</Text>
              </TouchableOpacity>
            </View>

            {/* Add Resource Modal */}
            {newResourceModal && (
              <GlassCard style={styles.modalFormCard}>
                <View style={styles.formHeaderRow}>
                  <FileText size={16} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Share Notes link</Text>
                  <TouchableOpacity onPress={() => setNewResourceModal(false)}>
                    <Text style={{ color: colors.error, fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Notes / DPP title (e.g. Electromagnetism DPP #05)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={resTitle}
                  onChangeText={setResTitle}
                />

                <TextInput
                  placeholder="Category (e.g. Physics Notes, Chemistry DPP)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={resCat}
                  onChangeText={setResCat}
                />

                <TextInput
                  placeholder="Downloadable Drive/PDF URL"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={resUrl}
                  onChangeText={setResUrl}
                />

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddResource}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Publish Notes PDF</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {resources.map(res => (
              <GlassCard key={res.id} style={styles.packCard}>
                <View style={styles.subCardHeader}>
                  <FileText size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{res.title}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Category: {res.category}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={{ fontSize: 9, color: colors.success, fontWeight: '900' }}>Published</Text>
                  </View>
                </View>

                <View style={[styles.fitGridArea, { borderTopColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '800' }}>
                      URL: {res.downloadUrl}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.payShareBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Share.share({ message: `Coaching Study Alert! Download the latest "${res.title}" study material here: ${res.downloadUrl}. All the best!` })}
                  >
                    <Text style={{ color: colors.text, fontSize: 9, fontWeight: '800' }}>Share PDF</Text>
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
            { id: 'slots', label: 'Doubt Clinic Slots', icon: GraduationCap },
            { id: 'tests', label: 'Mock Grades Tracker', icon: Award },
            { id: 'resources', label: 'DPP Notes Drawer', icon: FileText },
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
