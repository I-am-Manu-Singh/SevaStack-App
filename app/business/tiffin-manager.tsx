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
  ActivityIndicator,
  Share,
  RefreshControl
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { 
  Utensils,
  Calendar,
  Pause,
  Play,
  CheckCircle2,
  MapPin,
  User,
  Users,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Clock,
  Phone,
  Check,
  Cpu,
  Bookmark,
  Share2,
  Trash2,
  ChevronRight,
  Printer
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { CustomerBusinessView } from '@/components/CustomerBusinessView';

export default function TiffinManagerScreen() {
  const { userRole, businessType } = useApp();
  
  if (userRole === 'customer' || businessType !== 'Tiffin') {
    return <CustomerBusinessView type="Tiffin" />;
  }

  return <TiffinManagerScreenMerchant />;
}

function TiffinManagerScreenMerchant() {

  const { colors, theme, profile, userRole, businessType } = useApp();
  
  

  const [activeTab, setActiveTab] = useState<'subs' | 'menu' | 'scanner' | 'kitchen' | 'dispatch'>('subs');

  // Supabase states
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [weeklyMenu, setWeeklyMenu] = useState<any[]>([]);
  const [dispatchJobs, setDispatchJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const [subsData, menuData, dispatchData] = await Promise.all([
        supabase.from('tiffin_subscriptions').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('tiffin_weekly_menu').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: true }),
        supabase.from('tiffin_dispatch_jobs').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false })
      ]);

      let finalSubs = subsData.data || [];
      if (!subsData.data || subsData.data.length === 0) {
        const defaultSubs = [
          { student_name: 'Rahul Khanna', hostel_address: 'Hostel 3, Room 102', plan_type: 'Premium Veg (3 Meals)', status: 'Active', days_left: 24, spice_level: 'Medium', allergies: 'None', phone: '+919876543210' },
          { student_name: 'Aditi Sharma', hostel_address: 'Hostel 1, Room 405', plan_type: 'Basic Veg (2 Meals)', status: 'Active', days_left: 18, spice_level: 'Low Spicy', allergies: 'Peanuts', phone: '+918765432109' },
          { student_name: 'Rohit Verma', hostel_address: 'PG Royal, Room 12', plan_type: 'Standard Veg (2 Meals)', status: 'Paused', days_left: 5, spice_level: 'Spicy', allergies: 'None', phone: '+917654321098' }
        ].map(s => ({ ...s, merchant_id: profile.id }));
        const seedRes = await supabase.from('tiffin_subscriptions').insert(defaultSubs).select();
        if (seedRes.data) finalSubs = seedRes.data;
      }

      const mappedSubs = finalSubs.map((row: any) => ({
        id: row.id,
        studentName: row.student_name,
        hostel: row.hostel_address,
        plan: row.plan_type,
        status: row.status,
        daysLeft: row.days_left,
        spicy: row.spice_level,
        allergy: row.allergies || 'None',
        phone: row.phone || '+919876543210',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&q=80'
      }));
      setSubscriptions(mappedSubs);

      let finalMenu = menuData.data || [];
      if (!menuData.data || menuData.data.length === 0) {
        const defaultMenu = [
          { day: 'Monday', lunch: 'Aloo Gobhi, Yellow Dal, Roti, Rice, Salad', dinner: 'Matar Paneer, Mix Dal, Roti, Rice, Kheer' },
          { day: 'Tuesday', lunch: 'Bhindi Masala, Kadhi Pakoda, Roti, Rice', dinner: 'Kofta Curry, Chana Dal, Roti, Rice, Halwa' },
          { day: 'Wednesday', lunch: 'Mix Veg, Dal Tadka, Roti, Rice, Boondi Raita', dinner: 'Paneer Butter Masala, Dal Makhani, Butter Naan, Rice' },
          { day: 'Thursday', lunch: 'Rajma Chawal, Roti, Jeera Aloo, Curd', dinner: 'Kadhai Veg, Masoor Dal, Roti, Rice, Gulab Jamun' },
          { day: 'Friday', lunch: 'Chole Bhature, Pulao, Onion Salad, Pickle', dinner: 'Shahi Paneer, Dal Fry, Roti, Rice, Ice Cream' },
          { day: 'Saturday', lunch: 'Veg Biryani, Raita, Papad, Salad', dinner: 'Kadi Chawal, Roti, Dry Aloo, Pickle' },
          { day: 'Sunday', lunch: 'Special Thali (Poori, Paneer, Dal, Sweet)', dinner: 'Jeera Rice, Yellow Dal, Roti, Salad' }
        ].map(m => ({ ...m, merchant_id: profile.id }));
        const seedRes = await supabase.from('tiffin_weekly_menu').insert(defaultMenu).select();
        if (seedRes.data) finalMenu = seedRes.data;
      }
      setWeeklyMenu(finalMenu);

      let finalDispatch = dispatchData.data || [];
      if (!dispatchData.data || dispatchData.data.length === 0) {
        const defaultDispatches = [
          { student_name: 'Rahul Khanna', hostel: 'Hostel 3, Room 102', tiffin_no: 'T-102', meal: 'Lunch Run', status: 'Pending', runner: 'Ramesh Kumar' },
          { student_name: 'Aditi Sharma', hostel: 'Hostel 1, Room 405', tiffin_no: 'T-405', meal: 'Lunch Run', status: 'Dispatched', runner: 'Suresh Singh' }
        ].map(d => ({ ...d, merchant_id: profile.id }));
        const seedRes = await supabase.from('tiffin_dispatch_jobs').insert(defaultDispatches).select();
        if (seedRes.data) finalDispatch = seedRes.data;
      }

      const mappedDispatch = finalDispatch.map((row: any) => ({
        id: row.id,
        studentName: row.student_name,
        hostel: row.hostel,
        tiffinNo: row.tiffin_no,
        meal: row.meal,
        status: row.status,
        runner: row.runner
      }));
      setDispatchJobs(mappedDispatch);

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
  const [activeStatusFilter, setActiveStatusFilter] = useState<'All' | 'Active' | 'Paused'>('All');

  // Menu ratings mock state
  const [menuLikes, setMenuLikes] = useState(42);
  const [menuDislikes, setMenuDislikes] = useState(3);
  const [ratedToday, setRatedToday] = useState(false);

  // New Subscription Form states
  const [newSubModal, setNewSubModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formHostel, setFormHostel] = useState('');
  const [formPlan, setFormPlan] = useState('Basic Veg (2 Meals)');
  const [formSpicy, setFormSpicy] = useState('Medium');
  const [formAllergy, setFormAllergy] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDays, setFormDays] = useState('30');

  // QR scanner simulation states
  const [isScanning, setIsScanning] = useState(false);
  const [scanInputCode, setScanInputCode] = useState('');
  const [scanResult, setScanResult] = useState<any | null>(null);

  // Pause / Resume subscription toggler
  const toggleSubscriptionStatus = async (id: string) => {
    if (!profile?.id) return;
    const match = subscriptions.find(sub => sub.id === id);
    if (!match) return;
    const newStatus = match.status === 'Active' ? 'Paused' : 'Active';

    const { error } = await supabase.from('tiffin_subscriptions').update({
      status: newStatus
    }).eq('id', id);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert(
      `${newStatus} Mess Plan`, 
      `Tiffin meal delivery and daily billing credit tracker for ${match.studentName} has been set to ${newStatus}.`
    );
    fetchData();
  };

  // Add new subscription
  const handleAddSubscription = async () => {
    if (!formName || !formHostel || !formPhone) {
      Alert.alert('Missing Fields', 'Please enter Name, Hostel/PG Address, and Contact Number.');
      return;
    }
    if (!profile?.id) return;

    const daysVal = parseInt(formDays, 10) || 30;

    const { error } = await supabase.from('tiffin_subscriptions').insert([{
      merchant_id: profile.id,
      student_name: formName,
      hostel_address: formHostel,
      plan_type: formPlan,
      status: 'Active',
      days_left: daysVal,
      spice_level: formSpicy,
      allergies: formAllergy || 'None',
      phone: formPhone
    }]);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Success', `Registered ${formName}'s Mess plan successfully!`);
    resetSubForm();
    fetchData();
  };

  const resetSubForm = () => {
    setFormName('');
    setFormHostel('');
    setFormSpicy('Medium');
    setFormAllergy('');
    setFormPhone('');
    setFormDays('30');
    setNewSubModal(false);
  };

  // Scan simulation
  const handleSimulateScan = (code: string) => {
    const input = code || scanInputCode;
    if (!input) {
      Alert.alert('Scan Error', 'Please enter a valid student QR Token code.');
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    setTimeout(async () => {
      setIsScanning(false);
      // Try to find the student in subscription database
      const match = subscriptions.find(sub => sub.id.toLowerCase() === input.toLowerCase() || sub.studentName.toLowerCase().includes(input.toLowerCase()));
      
      if (match) {
        if (match.status === 'Paused') {
          setScanResult({
            success: false,
            message: 'SUSPENDED/PAUSED PLAN',
            reason: `${match.studentName}'s tiffin subscription is currently PAUSED. Unpause before check-in.`,
            student: match
          });
        } else if (match.daysLeft <= 0) {
          setScanResult({
            success: false,
            message: 'PLAN EXPIRED',
            reason: `${match.studentName} has 0 days left on their monthly plan. Renew subscription.`,
            student: match
          });
        } else {
          setScanResult({
            success: true,
            message: 'MEAL CHECK-IN SUCCESSFUL',
            reason: `Meal logged for today's slot. Active Plan: ${match.plan}. ${match.daysLeft - 1} days remaining.`,
            student: match
          });

          // Deduct one day in database
          await supabase.from('tiffin_subscriptions').update({
            days_left: Math.max(0, match.daysLeft - 1)
          }).eq('id', match.id);
          fetchData();
        }
      } else {
        setScanResult({
          success: false,
          message: 'TOKEN UNRECOGNIZED',
          reason: 'No active student subscription matching this token barcode. Verify student ID card.',
          student: null
        });
      }
    }, 1500);
  };

  // Dispatch Runner Update
  const updateDispatchStatus = async (id: string, newStatus: string) => {
    if (!profile?.id) return;
    const { error } = await supabase.from('tiffin_dispatch_jobs').update({
      status: newStatus
    }).eq('id', id);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    fetchData();
  };

  // Filters
  const filteredSubs = subscriptions.filter(sub => {
    const matchesSearch = sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.hostel.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.plan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeStatusFilter === 'All' || sub.status === activeStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <Stack.Screen options={{ 
        title: 'Tiffin & Mess Manager',
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
        {activeTab === 'subs' && (
          <View>
            {/* Search and Quick Add */}
            <View style={styles.searchRow}>
              <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search students, plans, hostel..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.searchInput, { color: colors.text }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity 
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
                onPress={() => setNewSubModal(!newSubModal)}
              >
                <Plus size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Quick Status Filters */}
            <View style={styles.filterRow}>
              {['All', 'Active', 'Paused'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    activeStatusFilter === status && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]}
                  onPress={() => setActiveStatusFilter(status as any)}
                >
                  <Text style={[
                    styles.filterChipTxt,
                    { color: colors.textMuted },
                    activeStatusFilter === status && { color: colors.primary, fontWeight: '700' }
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* New Subscription Modal / Card Form */}
            {newSubModal && (
              <GlassCard style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Add New Mess Student</Text>
                  <TouchableOpacity onPress={() => setNewSubModal(false)}>
                    <Text style={{ color: colors.error, fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Student Full Name"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={formName}
                  onChangeText={setFormName}
                />

                <TextInput
                  placeholder="Hostel / PG Address (e.g. Hostel A - Rm 104)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={formHostel}
                  onChangeText={setFormHostel}
                />

                <TextInput
                  placeholder="Contact Mobile Number (+91)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={formPhone}
                  onChangeText={setFormPhone}
                  keyboardType="phone-pad"
                />

                <View style={styles.formRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Tiffin Plan Type</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={formPlan}
                      onChangeText={setFormPlan}
                    />
                  </View>

                  <View style={{ width: 100 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Duration Days</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={formDays}
                      onChangeText={setFormDays}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Spiciness Grade</Text>
                    <View style={styles.optionRow}>
                      {['Mild', 'Medium', 'Spicy'].map(s => (
                        <TouchableOpacity
                          key={s}
                          style={[
                            styles.smallOptionChip,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            formSpicy === s && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                          ]}
                          onPress={() => setFormSpicy(s)}
                        >
                          <Text style={{ fontSize: 11, color: formSpicy === s ? colors.primary : colors.textMuted }}>{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Allergies / Requests</Text>
                    <TextInput
                      placeholder="e.g. Peanuts, No Onion"
                      placeholderTextColor={colors.textMuted}
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={formAllergy}
                      onChangeText={setFormAllergy}
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddSubscription}
                >
                  <Text style={styles.submitBtnTxt}>Register Plan & Generate ID</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* List of subscriptions */}
            {filteredSubs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <AlertCircle size={40} color={colors.textMuted} />
                <Text style={[styles.emptyTxt, { color: colors.textMuted }]}>No active mess subscribers found.</Text>
              </View>
            ) : (
              filteredSubs.map(sub => (
                <GlassCard key={sub.id} style={styles.subCard}>
                  <View style={styles.subCardHeader}>
                    <Image source={{ uri: sub.avatar }} style={styles.avatar} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.studentName, { color: colors.text }]}>{sub.studentName}</Text>
                      <Text style={[styles.hostelText, { color: colors.textMuted }]}>{sub.hostel}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: sub.status === 'Active' ? colors.success + '20' : colors.error + '20' }]}>
                      <Text style={[styles.statusText, { color: sub.status === 'Active' ? colors.success : colors.error }]}>
                        {sub.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.planDetailsPanel, { borderTopColor: colors.border }]}>
                    <View>
                      <Text style={{ fontSize: 10, color: colors.textMuted }}>CURRENT PLAN</Text>
                      <Text style={[styles.planText, { color: colors.text }]}>{sub.plan}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 10, color: colors.textMuted }}>DAYS REMAINING</Text>
                      <Text style={[
                        styles.daysText, 
                        { color: colors.text },
                        sub.daysLeft <= 5 && { color: colors.error, fontWeight: '800' }
                      ]}>
                        {sub.daysLeft} Days
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.preferencesRow, { borderTopColor: colors.border }]}>
                    <Text style={[styles.prefTag, { backgroundColor: colors.surfaceLight, color: colors.text }]}> {sub.spicy}</Text>
                    {sub.allergy !== 'None' && (
                      <Text style={[styles.prefTag, { backgroundColor: colors.error + '10', color: colors.error }]}> Allergy: {sub.allergy}</Text>
                    )}
                  </View>

                  <View style={[styles.subActionsRow, { borderTopColor: colors.border }]}>
                    {/* Share/Send check-in barcode token to student */}
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: colors.surfaceLight }]}
                      onPress={() => Share.share({ message: `Hi ${sub.studentName}, here is your SevaStack Mess Check-in Token ID: ${sub.id}. Scan at check-in counter for meals!` })}
                    >
                      <Share2 size={14} color={colors.text} style={{ marginRight: 4 }} />
                      <Text style={{ color: colors.text, fontSize: 11, fontWeight: '600' }}>Share Token</Text>
                    </TouchableOpacity>

                    {/* Pause or Resume toggle */}
                    <TouchableOpacity 
                      style={[
                        styles.actionBtn, 
                        sub.status === 'Active' ? { backgroundColor: colors.error + '15' } : { backgroundColor: colors.success + '15' }
                      ]}
                      onPress={() => toggleSubscriptionStatus(sub.id)}
                    >
                      {sub.status === 'Active' ? (
                        <View style={styles.flexRow}>
                          <Pause size={14} color={colors.error} style={{ marginRight: 4 }} />
                          <Text style={{ color: colors.error, fontSize: 11, fontWeight: '700' }}>Pause Plan</Text>
                        </View>
                      ) : (
                        <View style={styles.flexRow}>
                          <Play size={14} color={colors.success} style={{ marginRight: 4 }} />
                          <Text style={{ color: colors.success, fontSize: 11, fontWeight: '700' }}>Resume Plan</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              ))
            )}
          </View>
        )}

        {activeTab === 'menu' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Weekly Mess Menu & Ratings</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Modify the daily lunch and dinner items. Students vote in real-time to express feedback about today's meal taste.
              </Text>
            </View>

            {/* Live Meal Upvote feedback card */}
            <GlassCard style={styles.feedbackPromoCard}>
              <View style={styles.feedbackHeaderRow}>
                <TrendingUp size={24} color={colors.success} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.feedbackTitle, { color: colors.text }]}>Today's Meal Satisfaction</Text>
                  <Text style={[styles.feedbackSub, { color: colors.textMuted }]}>Based on student barcode check-in logs</Text>
                </View>
              </View>
              
              <View style={styles.ratingVoteRow}>
                <View style={styles.voteColumn}>
                  <Text style={[styles.voteVal, { color: colors.success }]}> {menuLikes}</Text>
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>Liked Taste</Text>
                </View>
                <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
                <View style={styles.voteColumn}>
                  <Text style={[styles.voteVal, { color: colors.error }]}> {menuDislikes}</Text>
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>Needs Improvement</Text>
                </View>
              </View>

              {!ratedToday ? (
                <View style={styles.voteTriggerBox}>
                  <Text style={{ fontSize: 11, color: colors.text, fontWeight: '700', marginBottom: 8 }}>Test Food Quality feedback (Demo Simulation):</Text>
                  <View style={styles.flexRow}>
                    <TouchableOpacity 
                      style={[styles.voteBtn, { backgroundColor: colors.success + '20', borderColor: colors.success }]}
                      onPress={() => { setMenuLikes(menuLikes + 1); setRatedToday(true); }}
                    >
                      <Text style={{ color: colors.success, fontSize: 11, fontWeight: '700' }}>Simulate Upvote</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.voteBtn, { backgroundColor: colors.error + '20', borderColor: colors.error, marginLeft: 8 }]}
                      onPress={() => { setMenuDislikes(menuDislikes + 1); setRatedToday(true); }}
                    >
                      <Text style={{ color: colors.error, fontSize: 11, fontWeight: '700' }}>Simulate Downvote</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <Text style={styles.votedNotice}>Quality rating logged into SevaStack satisfaction tracker.</Text>
              )}
            </GlassCard>

            {/* Weekly calendar scroll list */}
            {weeklyMenu.map((m, idx) => (
              <GlassCard key={idx} style={styles.menuDayPlanCard}>
                <View style={styles.menuDayHeader}>
                  <Calendar size={16} color={colors.primary} />
                  <Text style={[styles.menuDayTitle, { color: colors.text }]}>{m.day} Menu</Text>
                </View>
                
                <View style={styles.mealDisplayRow}>
                  <View style={styles.mealTimeIconBox}>
                    <Text style={styles.mealTimeLabel}>LUNCH</Text>
                  </View>
                  <TextInput
                    multiline
                    numberOfLines={2}
                    style={[styles.menuEditorInput, { color: colors.text, borderColor: colors.border }]}
                    value={m.lunch}
                    onChangeText={(txt) => {
                      setWeeklyMenu(prev => prev.map((item, i) => i === idx ? { ...item, lunch: txt } : item));
                    }}
                  />
                </View>

                <View style={styles.mealDisplayRow}>
                  <View style={styles.mealTimeIconBox}>
                    <Text style={styles.mealTimeLabel}>DINNER</Text>
                  </View>
                  <TextInput
                    multiline
                    numberOfLines={2}
                    style={[styles.menuEditorInput, { color: colors.text, borderColor: colors.border }]}
                    value={m.dinner}
                    onChangeText={(txt) => {
                      setWeeklyMenu(prev => prev.map((item, i) => i === idx ? { ...item, dinner: txt } : item));
                    }}
                  />
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                    paddingVertical: 8,
                    marginTop: 8,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onPress={async () => {
                    try {
                      const { error } = await supabase.from('tiffin_weekly_menu').update({
                        lunch: m.lunch,
                        dinner: m.dinner
                      }).eq('id', m.id);
                      if (error) throw error;
                      Alert.alert('Success', `${m.day} menu saved successfully.`);
                    } catch (e: any) {
                      Alert.alert('Error', e.message);
                    }
                  }}
                >
                  <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>Save {m.day} Menu</Text>
                </TouchableOpacity>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'scanner' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Visual QR Check-in Terminal</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Simulate scanning the student mess card barcode or ID token. Validates their plan availability and records their meal check-in.
              </Text>
            </View>

            <GlassCard style={styles.scannerWrapper}>
              <View style={styles.scannerOutline}>
                <Cpu size={36} color={colors.primary} />
                <Text style={[styles.scannerHintText, { color: colors.textMuted }]}>CHECK-IN TERMINAL RUNNING</Text>
              </View>

              <View style={styles.scanFormRow}>
                <TextInput
                  placeholder="Enter Student ID / Token (e.g. sub1, Rohan)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.scanInputField, { color: colors.text, borderColor: colors.border }]}
                  value={scanInputCode}
                  onChangeText={setScanInputCode}
                />
                
                <TouchableOpacity 
                  style={[styles.triggerScanBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handleSimulateScan('')}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Scan ID</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.fastSimulationShortcuts}>
                <Text style={{ fontSize: 10, color: colors.textMuted, marginBottom: 6 }}>Fast Simulation Shortcuts:</Text>
                <View style={styles.flexRow}>
                  <TouchableOpacity style={styles.fastBtn} onPress={() => handleSimulateScan('sub1')}>
                    <Text style={{ fontSize: 9, color: colors.text }}>Rohan (Active)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.fastBtn} onPress={() => handleSimulateScan('sub3')}>
                    <Text style={{ fontSize: 9, color: colors.text }}>Riya (Paused)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.fastBtn} onPress={() => handleSimulateScan('unknown')}>
                    <Text style={{ fontSize: 9, color: colors.text }}>Invalid ID</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Scan Results Display */}
              {scanResult && (
                <View style={[
                  styles.scanResultCard,
                  { borderColor: scanResult.success ? colors.success : colors.error },
                  { backgroundColor: scanResult.success ? colors.success + '03' : colors.error + '03' }
                ]}>
                  <View style={styles.resultHeader}>
                    {scanResult.success ? (
                      <CheckCircle2 size={20} color={colors.success} />
                    ) : (
                      <AlertCircle size={20} color={colors.error} />
                    )}
                    <Text style={[
                      styles.resultHeaderTxt, 
                      { color: scanResult.success ? colors.success : colors.error }
                    ]}>
                      {scanResult.message}
                    </Text>
                  </View>

                  <Text style={[styles.resultBodyText, { color: colors.textMuted }]}>{scanResult.reason}</Text>

                  {scanResult.student && (
                    <View style={[styles.resultStudentDetail, { backgroundColor: colors.surface }]}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: colors.text }}>Student: {scanResult.student.studentName}</Text>
                      <Text style={{ fontSize: 10, color: colors.textMuted }}>Hostel Address: {scanResult.student.hostel}</Text>
                      <Text style={{ fontSize: 10, color: colors.textMuted }}>Dietary Preferences:  {scanResult.student.spicy} | Allergy: {scanResult.student.allergy}</Text>
                    </View>
                  )}
                </View>
              )}
            </GlassCard>
          </View>
        )}

        {activeTab === 'kitchen' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Diet & Kitchen Prep Hub</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Prepares a summary of student dietary customized requirements for the kitchen chef to print and prepare batch cooking pans.
              </Text>
            </View>

            {/* Diet distribution metrics */}
            <GlassCard style={styles.kitchenSummaryCard}>
              <View style={styles.formHeader}>
                <TrendingUp size={16} color={colors.primary} />
                <Text style={[styles.formTitle, { color: colors.text }]}>Dietary Distribution Metrics</Text>
                <TouchableOpacity onPress={() => Alert.alert('Kitchen Log Printed', 'Dispatched batch order sheet to thermal printer.')}>
                  <Printer size={16} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.metricGrid}>
                <View style={styles.metricBox}>
                  <Text style={[styles.metricVal, { color: colors.primary }]}>
                    {subscriptions.filter(s => s.plan.toLowerCase().includes('veg')).length}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>Pure Veg</Text>
                </View>
                
                <View style={styles.metricBox}>
                  <Text style={[styles.metricVal, { color: colors.accent }]}>
                    {subscriptions.filter(s => s.spicy === 'Spicy').length}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>Extra Spicy</Text>
                </View>

                <View style={styles.metricBox}>
                  <Text style={[styles.metricVal, { color: colors.error }]}>
                    {subscriptions.filter(s => s.allergy !== 'None').length}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>Special Allergy</Text>
                </View>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.text, marginVertical: 12 }]}>Chef Special Prep Directives:</Text>
              {subscriptions.map(sub => (
                <View key={sub.id} style={[styles.chefRow, { borderBottomColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.chefStudentName, { color: colors.text }]}>{sub.studentName} ({sub.hostel.split(' ')[0]})</Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>Plan: {sub.plan}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: colors.accent }}> {sub.spicy}</Text>
                    {sub.allergy !== 'None' && (
                      <Text style={{ fontSize: 9, color: colors.error, fontWeight: '700' }}>No {sub.allergy}</Text>
                    )}
                  </View>
                </View>
              ))}
            </GlassCard>
          </View>
        )}

        {activeTab === 'dispatch' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Delivery Runs & Courier Dispatch</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Track and organize hostel delivery runs for tiffins dispatched to rooms. Keep runners accountable for dispatch status.
              </Text>
            </View>

            {dispatchJobs.map(job => (
              <GlassCard key={job.id} style={styles.dispatchCard}>
                <View style={styles.dispatchHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.dispatchStudent, { color: colors.text }]}>{job.studentName}</Text>
                    <Text style={[styles.dispatchHostel, { color: colors.textMuted }]}>{job.hostel}</Text>
                  </View>
                  <View style={[styles.tiffinBadge, { backgroundColor: colors.surfaceLight }]}>
                    <Text style={[styles.tiffinBadgeTxt, { color: colors.primary }]}>{job.tiffinNo}</Text>
                  </View>
                </View>

                <View style={styles.runnerDetailRow}>
                  <View>
                    <Text style={{ fontSize: 9, color: colors.textMuted }}>ASSIGNED COURIER</Text>
                    <Text style={[styles.runnerName, { color: colors.text }]}> {job.runner}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 9, color: colors.textMuted }}>MEAL SLOT</Text>
                    <Text style={[styles.runnerName, { color: colors.text }]}>{job.meal}</Text>
                  </View>
                </View>

                <View style={[styles.dispatchActionFooter, { borderTopColor: colors.border }]}>
                  <View style={styles.statusDisplay}>
                    <Text style={{ fontSize: 9, color: colors.textMuted }}>STATUS</Text>
                    <Text style={[
                      styles.statusValText,
                      job.status === 'Pending' && { color: colors.accent },
                      job.status === 'Dispatched' && { color: colors.primary },
                      job.status === 'Delivered' && { color: colors.success }
                    ]}>
                      {job.status.toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.dispatchControls}>
                    {job.status === 'Pending' && (
                      <TouchableOpacity 
                        style={[styles.dispatchStatusBtn, { backgroundColor: colors.primary }]}
                        onPress={() => updateDispatchStatus(job.id, 'Dispatched')}
                      >
                        <Text style={styles.statusBtnTxt}>Dispatch</Text>
                      </TouchableOpacity>
                    )}
                    {job.status === 'Dispatched' && (
                      <TouchableOpacity 
                        style={[styles.dispatchStatusBtn, { backgroundColor: colors.success }]}
                        onPress={() => updateDispatchStatus(job.id, 'Delivered')}
                      >
                        <Text style={styles.statusBtnTxt}>Mark Delivered</Text>
                      </TouchableOpacity>
                    )}
                    {job.status === 'Delivered' && (
                      <View style={styles.deliveredCheckBadge}>
                        <CheckCircle2 size={16} color={colors.success} style={{ marginRight: 4 }} />
                        <Text style={{ color: colors.success, fontSize: 10, fontWeight: '700' }}>Drop Verified</Text>
                      </View>
                    )}
                  </View>
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
            { id: 'subs', label: 'Mess Subs', icon: Users },
            { id: 'menu', label: 'Menu Planner', icon: Utensils },
            { id: 'scanner', label: 'QR Check-in', icon: Cpu },
            { id: 'kitchen', label: 'Kitchen Hub', icon: Sparkles },
            { id: 'dispatch', label: 'Delivery runs', icon: MapPin },
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
  formCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 10,
    marginBottom: 2,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 4,
    height: 40,
  },
  smallOptionChip: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtn: {
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnTxt: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTxt: {
    fontSize: 13,
  },
  subCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  subCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F172A',
  },
  studentName: {
    fontSize: 15,
    fontWeight: '800',
  },
  hostelText: {
    fontSize: 11,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },
  planDetailsPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  planText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  daysText: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  preferencesRow: {
    flexDirection: 'row',
    gap: 6,
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 10,
  },
  prefTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: '700',
  },
  subActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 10,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  feedbackPromoCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  feedbackHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedbackTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  feedbackSub: {
    fontSize: 11,
    marginTop: 1,
  },
  ratingVoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  voteColumn: {
    alignItems: 'center',
    gap: 2,
  },
  voteVal: {
    fontSize: 22,
    fontWeight: '900',
  },
  verticalDivider: {
    width: 1,
    height: '100%',
    opacity: 0.1,
  },
  voteTriggerBox: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  voteBtn: {
    flex: 1,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  votedNotice: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    textAlign: 'center',
    marginTop: 12,
  },
  menuDayPlanCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  menuDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  menuDayTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  mealDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  mealTimeIconBox: {
    width: 56,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealTimeLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#6366F1',
  },
  menuEditorInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    minHeight: 36,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  scannerWrapper: {
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
  },
  scannerOutline: {
    width: 140,
    height: 140,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  scannerHintText: {
    fontSize: 9,
    fontWeight: '900',
  },
  scanFormRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginBottom: 12,
  },
  scanInputField: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  triggerScanBtn: {
    width: 80,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fastSimulationShortcuts: {
    width: '100%',
    marginBottom: 16,
  },
  fastBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 6,
  },
  scanResultCard: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  resultHeaderTxt: {
    fontSize: 12,
    fontWeight: '900',
  },
  resultBodyText: {
    fontSize: 11,
    lineHeight: 15,
  },
  resultStudentDetail: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    gap: 2,
  },
  kitchenSummaryCard: {
    padding: 16,
    borderRadius: 16,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  metricBox: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '900',
  },
  chefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  chefStudentName: {
    fontSize: 12,
    fontWeight: '800',
  },
  dispatchCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  dispatchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dispatchStudent: {
    fontSize: 15,
    fontWeight: '800',
  },
  dispatchHostel: {
    fontSize: 11,
    marginTop: 1,
  },
  tiffinBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tiffinBadgeTxt: {
    fontSize: 11,
    fontWeight: '900',
  },
  runnerDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  runnerName: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  dispatchActionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  statusDisplay: {
    justifyContent: 'center',
  },
  statusValText: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 1,
  },
  dispatchControls: {
    justifyContent: 'center',
  },
  dispatchStatusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBtnTxt: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  deliveredCheckBadge: {
    flexDirection: 'row',
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
