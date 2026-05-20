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
  Printer,
  FileText,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Share2,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  QrCode,
  Layers,
  ArrowUpRight,
  Flame,
  Info
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

import { CustomerBusinessView } from '@/components/CustomerBusinessView';

export default function StationeryManagerScreen() {
  const { userRole, businessType } = useApp();
  
  if (userRole === 'customer' || businessType !== 'Stationery') {
    return <CustomerBusinessView type="Stationery" />;
  }

  return <StationeryManagerScreenMerchant />;
}

function StationeryManagerScreenMerchant() {

  const { colors, theme, profile, userRole, businessType } = useApp();
  
  

  const [activeTab, setActiveTab] = useState<'print' | 'packs' | 'slots'>('print');

  // Dynamic Supabase State
  const [printJobs, setPrintJobs] = useState<any[]>([]);
  const [coursePacks, setCoursePacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const [printJobsData, coursePacksData] = await Promise.all([
        supabase.from('stationery_print_jobs').select('*').eq('merchant_id', profile.id),
        supabase.from('stationery_course_packs').select('*').eq('merchant_id', profile.id)
      ]);

      let finalJobs = printJobsData.data || [];
      if (!printJobsData.data || printJobsData.data.length === 0) {
        const defaultJobs = [
          { student_name: 'Harsh Singh', hostel: 'Hostel A', pdf_name: 'lab_report_final.pdf', pages: 15, color: 'B/W', layout: 'Single-sided', binding: 'Spiral Binding', amount: 87, status: 'Pending', date: 'Today' },
          { student_name: 'Sneha Patel', hostel: 'Hostel C', pdf_name: 'thesis_chapters.pdf', pages: 120, color: 'B/W', layout: 'Double-sided', binding: 'Hard Bound Cover', amount: 480, status: 'Printing', date: 'Today' }
        ].map(j => ({ ...j, merchant_id: profile.id }));
        const seedRes = await supabase.from('stationery_print_jobs').insert(defaultJobs).select();
        if (seedRes.data) finalJobs = seedRes.data;
      }

      const mappedJobs = finalJobs.map((row: any) => ({
        id: row.id,
        studentName: row.student_name,
        hostel: row.hostel,
        pdfName: row.pdf_name,
        pages: row.pages,
        color: row.color,
        layout: row.layout,
        binding: row.binding,
        amount: row.amount,
        status: row.status,
        date: row.date
      }));
      setPrintJobs(mappedJobs);

      let finalPacks = coursePacksData.data || [];
      if (!coursePacksData.data || coursePacksData.data.length === 0) {
        const defaultPacks = [
          { course_name: 'CS-101 Introduction to Computing', stock_remaining: 12, exam_date: 'June 05', price: 150, status: 'In-Stock' },
          { course_name: 'MA-202 Linear Algebra Pack', stock_remaining: 3, exam_date: 'June 08', price: 220, status: 'Critical Low' }
        ].map(p => ({ ...p, merchant_id: profile.id }));
        const seedRes = await supabase.from('stationery_course_packs').insert(defaultPacks).select();
        if (seedRes.data) finalPacks = seedRes.data;
      }

      const mappedPacks = finalPacks.map((row: any) => ({
        id: row.id,
        courseName: row.course_name,
        stockRemaining: row.stock_remaining,
        examDate: row.exam_date,
        price: row.price,
        status: row.status
      }));
      setCoursePacks(mappedPacks);

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
  const [printFilter, setPrintFilter] = useState<'All' | 'Pending' | 'Printing' | 'Ready for Pick'>('All');

  // Add Print Job states
  const [newJobModal, setNewJobModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newHostel, setNewHostel] = useState('');
  const [newPdfName, setNewPdfName] = useState('');
  const [newPages, setNewPages] = useState('20');
  const [newColor, setNewColor] = useState('B/W');
  const [newBinding, setNewBinding] = useState('None');

  // Restock Course Pack
  const restockPack = async (id: string, qty: number) => {
    if (!profile?.id) return;
    const match = coursePacks.find(cp => cp.id === id);
    if (!match) return;
    const nextStock = match.stockRemaining + qty;
    const nextStatus = nextStock > 5 ? 'In-Stock' : 'Critical Low';

    try {
      const { error } = await supabase.from('stationery_course_packs').update({
        stock_remaining: nextStock,
        status: nextStatus
      }).eq('id', id);

      if (error) throw error;
      Alert.alert('Syllabus Printed', `Successfully printed +${qty} master copies for this course pack.`);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  // Add new print job
  const handleAddNewJob = async () => {
    if (!newName || !newPdfName) {
      Alert.alert('Missing Fields', 'Please complete student and PDF details.');
      return;
    }
    if (!profile?.id) return;

    const pages = parseInt(newPages) || 10;
    let pageRate = newColor === 'Color' ? 10 : 3; // Color costs ₹10, B/W costs ₹3
    let bindingPremium = 0;
    if (newBinding === 'Spiral Binding') bindingPremium = 42;
    else if (newBinding === 'Hard Bound Cover') bindingPremium = 120;

    const finalAmount = (pages * pageRate) + bindingPremium;

    try {
      const { error } = await supabase.from('stationery_print_jobs').insert([{
        merchant_id: profile.id,
        student_name: newName,
        hostel: newHostel || 'Walk-in',
        pdf_name: newPdfName,
        pages: pages,
        color: newColor,
        layout: 'Single-sided',
        binding: newBinding,
        amount: finalAmount,
        status: 'Pending',
        date: 'Today'
      }]);

      if (error) throw error;

      Alert.alert('Print Job Booked', `Queued printing for ${newPdfName} (Est. Price: ₹${finalAmount}).`);
      setNewName('');
      setNewHostel('');
      setNewPdfName('');
      setNewPages('20');
      setNewBinding('None');
      setNewJobModal(false);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  // Transition print timeline
  const transitionJobStatus = async (id: string, currentStatus: string) => {
    if (!profile?.id) return;
    const statusSequence = ['Pending', 'Printing', 'Ready for Pick', 'Completed'];
    const nextIdx = statusSequence.indexOf(currentStatus) + 1;
    if (nextIdx >= statusSequence.length) return;

    const nextStatus = statusSequence[nextIdx];

    try {
      const { error } = await supabase.from('stationery_print_jobs').update({
        status: nextStatus
      }).eq('id', id);

      if (error) throw error;

      if (nextStatus === 'Completed') {
        const match = printJobs.find(pj => pj.id === id);
        Alert.alert('Print Bag Settle', `Cleared payment for ₹${match?.amount || 0} and handed printed sheets to ${match?.studentName || 'Student'}.`);
      }
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  // Filter lists
  const filteredJobs = printJobs.filter(pj => {
    const matchesSearch = pj.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pj.pdfName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pj.hostel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = printFilter === 'All' || pj.status === printFilter;
    return matchesSearch && matchesFilter && pj.status !== 'Completed';
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <Stack.Screen options={{ 
        title: 'Stationery & Print Hub',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerShown: true
      }} />

      <ScrollView 
         showsVerticalScrollIndicator={false} 
         contentContainerStyle={styles.scrollContent}
         refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        
        {activeTab === 'print' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Digital Print Queue Desk</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Track digital PDF print jobs, configure double-sided layouts or spiral bindings, and manage student pick dispatches.
              </Text>
            </View>

            {/* Quick Search and Add Print */}
            <View style={styles.searchRow}>
              <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search student, syllabus, PDF file..."
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
              {['All', 'Pending', 'Printing', 'Ready for Pick'].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    printFilter === f && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]}
                  onPress={() => setPrintFilter(f as any)}
                >
                  <Text style={[
                    styles.filterChipTxt,
                    { color: colors.textMuted },
                    printFilter === f && { color: colors.primary, fontWeight: '700' }
                  ]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Add Print Job modal card */}
            {newJobModal && (
              <GlassCard style={styles.modalFormCard}>
                <View style={styles.formHeaderRow}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Book PDF Printing</Text>
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
                  placeholder="PDF Filename (e.g. lab_manual.pdf)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newPdfName}
                  onChangeText={setNewPdfName}
                />

                <View style={styles.inlineInputsGrid}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Page Count</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={newPages}
                      onChangeText={setNewPages}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Color Profile</Text>
                    <View style={styles.selectBoxArea}>
                      {['B/W', 'Color'].map(c => (
                        <TouchableOpacity
                          key={c}
                          style={[
                            styles.smallSelectChip,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            newColor === c && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                          ]}
                          onPress={() => setNewColor(c)}
                        >
                          <Text style={{ fontSize: 9, color: newColor === c ? colors.primary : colors.textMuted }}>{c}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={{ flex: 2 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Binding Finish</Text>
                    <View style={styles.selectBoxArea}>
                      {['None', 'Spiral', 'Hard Bound'].map(b => (
                        <TouchableOpacity
                          key={b}
                          style={[
                            styles.smallSelectChip,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            newBinding.startsWith(b) && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                          ]}
                          onPress={() => {
                            if (b === 'None') setNewBinding('None');
                            else if (b === 'Spiral') setNewBinding('Spiral Binding');
                            else setNewBinding('Hard Bound Cover');
                          }}
                        >
                          <Text style={{ fontSize: 8, color: newBinding.startsWith(b) ? colors.primary : colors.textMuted }}>{b}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddNewJob}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Confirm print queue</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* List */}
            {filteredJobs.map(pj => (
              <GlassCard key={pj.id} style={styles.printCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{pj.studentName}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}> {pj.hostel} • {pj.date}</Text>
                  </View>
                  
                  <View style={[
                    styles.statusBadge, 
                    pj.status === 'Ready for Pick' ? { backgroundColor: colors.success + '20' } : { backgroundColor: colors.accent + '20' }
                  ]}>
                    <Printer size={11} color={pj.status === 'Ready for Pick' ? colors.success : colors.accent} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 9, color: pj.status === 'Ready for Pick' ? colors.success : colors.accent, fontWeight: '900' }}>
                      {pj.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={[styles.pdfDetailsPanel, { borderTopColor: colors.border }]}>
                  <FileText size={16} color={colors.primary} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pdfNameLabel, { color: colors.text }]}>{pj.pdfName}</Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>
                      {pj.pages} Pages • {pj.color} • {pj.layout} • {pj.binding}
                    </Text>
                  </View>
                </View>

                <View style={[styles.invoiceRow, { borderTopColor: colors.border }]}>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>Est. Invoicing Price:</Text>
                  <Text style={[styles.qtyDisplayTxt, { color: colors.text }]}>₹{pj.amount}</Text>
                </View>

                {/* Print actions */}
                <View style={styles.printActionArea}>
                  <TouchableOpacity 
                    style={[styles.shareSlipBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Share.share({ message: `Hi ${pj.studentName}, your print job ${pj.pdfName} is ${pj.status}. Amount: ₹${pj.amount}. Please pick it up at the desk.` })}
                  >
                    <Share2 size={13} color={colors.text} style={{ marginRight: 4 }} />
                    <Text style={{ color: colors.text, fontSize: 10, fontWeight: '700' }}>Alert Student</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.transitionButton, { backgroundColor: colors.primary }]}
                    onPress={() => transitionJobStatus(pj.id, pj.status)}
                  >
                    <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900' }}>
                      {pj.status === 'Pending' && 'Start Printing '}
                      {pj.status === 'Printing' && 'Mark Ready for Pick '}
                      {pj.status === 'Ready for Pick' && 'Confirm Pickup & Settle '}
                    </Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'packs' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> High-Demand Course Pack Exam Alerts</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Pre-print curriculum study packs ahead of exam weeks. Keep critical booklet stocks active to avoid desk crashes.
              </Text>
            </View>

            {coursePacks.map(cp => (
              <GlassCard key={cp.id} style={styles.packCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{cp.courseName}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Booklet Cost: ₹{cp.price}</Text>
                  </View>
                  
                  <View style={[
                    styles.statusBadge, 
                    cp.status === 'Critical Low' ? { backgroundColor: colors.error + '20' } : { backgroundColor: colors.success + '20' }
                  ]}>
                    <AlertTriangle size={11} color={cp.status === 'Critical Low' ? colors.error : colors.success} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 9, color: cp.status === 'Critical Low' ? colors.error : colors.success, fontWeight: '900' }}>
                      {cp.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={[styles.packDetails, { borderTopColor: colors.border }]}>
                  <View>
                    <Text style={{ fontSize: 9, color: colors.textMuted }}>COPIES IN STOCK</Text>
                    <Text style={[styles.qtyDisplayTxt, { color: cp.stockRemaining <= 3 ? colors.error : colors.text }]}>
                      {cp.stockRemaining} Copies
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 9, color: colors.textMuted }}>NEXT SEMESTER EXAM</Text>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: colors.text, marginTop: 2 }}>{cp.examDate}</Text>
                  </View>
                </View>

                <View style={styles.restockControlsArea}>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>Print Master Copies:</Text>
                  <View style={styles.restockButtonsGroup}>
                    {[5, 10, 20].map(qty => (
                      <TouchableOpacity
                        key={qty}
                        style={[styles.restockButton, { backgroundColor: colors.primary }]}
                        onPress={() => restockPack(cp.id, qty)}
                      >
                        <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>+{qty}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'slots' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Pre-booked Print Pickup Time Slots</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Coordinated pick slots chosen by students from PG blocks to pick up thesis spiral files, preventing physical crowds.
              </Text>
            </View>

            {[
              { id: 's1', name: 'Devansh K.', file: 'Physics_Notes.pdf', time: '11:00 AM - 11:30 AM', items: '1 Spiral Book' },
              { id: 's2', name: 'Nisha Mehta', file: 'Thesis_Binder.pdf', time: '03:00 PM - 03:30 PM', items: '1 Hardbound copy' }
            ].map(slot => (
              <GlassCard key={slot.id} style={styles.scheduleCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{slot.name}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>File:  {slot.file} ({slot.items})</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={{ fontSize: 9, color: colors.primary, fontWeight: '900' }}>{slot.time}</Text>
                  </View>
                </View>
                
                <View style={[styles.scheduleFooter, { borderTopColor: colors.border }]}>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>Desk Status: Print Ready & Packed</Text>
                  <TouchableOpacity 
                    style={[styles.scheduleBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Alert.alert('Handover Logged', `Syllabus pack successfully handed over to ${slot.name}.`)}
                  >
                    <Text style={{ color: colors.text, fontSize: 10, fontWeight: '700' }}>Log Desk Handover</Text>
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
            { id: 'print', label: 'PDF Print Queue', icon: Printer },
            { id: 'packs', label: 'Exam Course Packs', icon: Flame },
            { id: 'slots', label: 'Collection Slots', icon: Clock },
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
  packCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  packDetails: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restockControlsArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  restockButtonsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  restockButton: {
    width: 38,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
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
