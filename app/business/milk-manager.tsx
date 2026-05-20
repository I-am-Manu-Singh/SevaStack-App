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
  Truck,
  Calendar,
  Pause,
  Play,
  CheckCircle2,
  MapPin,
  Users,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  Cpu,
  Bookmark,
  Share2,
  Trash2,
  ChevronRight,
  ClipboardList,
  Flame,
  Award
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

import { CustomerBusinessView } from '@/components/CustomerBusinessView';

export default function MilkManagerScreen() {
  const { userRole, businessType } = useApp();
  
  if (userRole === 'customer' || businessType !== 'Milk') {
    return <CustomerBusinessView type="Milk" />;
  }

  return <MilkManagerScreenMerchant />;
}

function MilkManagerScreenMerchant() {

  const { colors, theme, profile, userRole, businessType } = useApp();
  
  

  const [activeTab, setActiveTab] = useState<'subs' | 'bottles' | 'quality' | 'routes'>('subs');

  // Supabase state
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [qualityLog, setQualityLog] = useState<any[]>([]);
  const [dispatchRuns, setDispatchRuns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const [subsData, qualityData, runsData] = await Promise.all([
        supabase.from('milk_customers').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('milk_quality_log').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('milk_dispatch_runs').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: true })
      ]);

      let finalSubs = subsData.data || [];
      if (!subsData.data || subsData.data.length === 0) {
        const defaultSubs = [
          { customer_name: 'Varun Dhawan', address: 'Hostel A, Room 108', milk_type: 'Full Cream Milk', quantity_liters: 1.5, status: 'Active', bottles_due: 3 },
          { customer_name: 'Alia Bhatt', address: 'Hostel C, Room 204', milk_type: 'Toned Milk', quantity_liters: 1.0, status: 'Active', bottles_due: 1 },
          { customer_name: 'Siddharth M.', address: 'PG Royal, Room 12', milk_type: 'Cow Milk', quantity_liters: 2.0, status: 'Paused', bottles_due: 0 }
        ].map(s => ({ ...s, merchant_id: profile.id }));
        const seedRes = await supabase.from('milk_customers').insert(defaultSubs).select();
        if (seedRes.data) finalSubs = seedRes.data;
      }

      const mappedSubs = finalSubs.map((row: any) => ({
        id: row.id,
        customerName: row.customer_name,
        address: row.address,
        milkType: row.milk_type,
        quantity: parseFloat(row.quantity_liters) || 0.0,
        status: row.status,
        bottlesDue: row.bottles_due,
        bottlesReturnedToday: 0,
        phone: '+9199999 88888',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80'
      }));
      setSubscriptions(mappedSubs);

      let finalQuality = qualityData.data || [];
      if (!qualityData.data || qualityData.data.length === 0) {
        const defaultQuality = [
          { date: 'Today', fat: '4.8%', snf: '8.5%', lacto: '28.5', temp: '4.0°C', status: 'Approved' },
          { date: 'Yesterday', fat: '4.5%', snf: '8.2%', lacto: '28.0', temp: '4.2°C', status: 'Approved' }
        ].map(q => ({ ...q, merchant_id: profile.id }));
        const seedRes = await supabase.from('milk_quality_log').insert(defaultQuality).select();
        if (seedRes.data) finalQuality = seedRes.data;
      }
      setQualityLog(finalQuality);

      let finalRuns = runsData.data || [];
      if (!runsData.data || runsData.data.length === 0) {
        const defaultRuns = [
          { zone: 'North Campus (Hostel A-D)', runner: 'Ramesh Courier', milk_litres: 45, completed: 18, total: 30, status: 'In Progress' },
          { zone: 'South Campus (PGs & Flats)', runner: 'Suresh Runner', milk_litres: 35, completed: 25, total: 25, status: 'Completed' }
        ].map(r => ({ ...r, merchant_id: profile.id }));
        const seedRes = await supabase.from('milk_dispatch_runs').insert(defaultRuns).select();
        if (seedRes.data) finalRuns = seedRes.data;
      }

      const mappedRuns = finalRuns.map((row: any) => ({
        id: row.id,
        zone: row.zone,
        runner: row.runner,
        milkLitres: row.milk_litres,
        completed: row.completed,
        total: row.total,
        status: row.status
      }));
      setDispatchRuns(mappedRuns);

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
  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Paused'>('All');

  // Quality log inputs
  const [inputFat, setInputFat] = useState('4.8%');
  const [inputSnf, setInputSnf] = useState('8.5%');
  const [inputLacto, setInputLacto] = useState('28.5');
  const [inputTemp, setInputTemp] = useState('4.0°C');

  // Subscription volume modifier
  const adjustVolume = async (id: string, delta: number) => {
    if (!profile?.id) return;
    const match = subscriptions.find(sub => sub.id === id);
    if (!match) return;
    const newQty = Math.max(0.5, match.quantity + delta);

    const { error } = await supabase.from('milk_customers').update({
      quantity_liters: newQty
    }).eq('id', id);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    fetchData();
  };

  // Pause / Resume plan
  const toggleSubscriptionStatus = async (id: string) => {
    if (!profile?.id) return;
    const match = subscriptions.find(sub => sub.id === id);
    if (!match) return;
    const newStatus = match.status === 'Active' ? 'Paused' : 'Active';

    const { error } = await supabase.from('milk_customers').update({
      status: newStatus
    }).eq('id', id);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert(
      `${newStatus} Dairy Subscription`, 
      `Milk dispatch deliveries and daily billing ledgers for ${match.customerName} have been set to ${newStatus}.`
    );
    fetchData();
  };

  // Bottle returns logging
  const logReturnedBottle = async (id: string, count: number) => {
    if (!profile?.id) return;
    const match = subscriptions.find(sub => sub.id === id);
    if (!match) return;
    const newDue = Math.max(0, match.bottlesDue - count);

    const { error } = await supabase.from('milk_customers').update({
      bottles_due: newDue
    }).eq('id', id);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    fetchData();
  };

  // Add Quality log
  const handleAddQualityLog = async () => {
    if (!inputFat || !inputSnf || !inputLacto) {
      Alert.alert('Missing Fields', 'Please complete all quality test metrics.');
      return;
    }
    if (!profile?.id) return;

    const { error } = await supabase.from('milk_quality_log').insert([{
      merchant_id: profile.id,
      date: 'Today',
      fat: inputFat,
      snf: inputSnf,
      lacto: inputLacto,
      temp: inputTemp,
      status: 'Approved'
    }]);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Quality Verified', 'Lactometer & fat composition log submitted to SevaStack transparency journal.');
    fetchData();
  };

  // Filters
  const filteredSubs = subscriptions.filter(sub => {
    const matchesSearch = sub.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.address.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.milkType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeFilter === 'All' || sub.status === activeFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <Stack.Screen options={{ 
        title: 'Milk & Dairy Manager',
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
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Tomorrow's Milk Subscriptions</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Modify tomorrow's volume directly if customers request extra milk, or temporarily pause daily dispatches.
              </Text>
            </View>

            {/* Search */}
            <View style={styles.searchRow}>
              <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search houses, name, milk type..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.searchInput, { color: colors.text }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* Filter Row */}
            <View style={styles.filterRow}>
              {['All', 'Active', 'Paused'].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    activeFilter === f && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]}
                  onPress={() => setActiveFilter(f as any)}
                >
                  <Text style={[
                    styles.filterChipTxt,
                    { color: colors.textMuted },
                    activeFilter === f && { color: colors.primary, fontWeight: '700' }
                  ]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* List */}
            {filteredSubs.map(sub => (
              <GlassCard key={sub.id} style={styles.subCard}>
                <View style={styles.subCardHeader}>
                  <Image source={{ uri: sub.avatar }} style={styles.avatar} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.studentName, { color: colors.text }]}>{sub.customerName}</Text>
                    <Text style={[styles.hostelText, { color: colors.textMuted }]}> {sub.address}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: sub.status === 'Active' ? colors.success + '20' : colors.error + '20' }]}>
                    <Text style={[styles.statusText, { color: sub.status === 'Active' ? colors.success : colors.error }]}>
                      {sub.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Sub details */}
                <View style={[styles.detailPanel, { borderTopColor: colors.border }]}>
                  <View>
                    <Text style={{ fontSize: 9, color: colors.textMuted }}>MILK VARIANT</Text>
                    <Text style={[styles.boldLabel, { color: colors.text }]}>{sub.milkType}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 9, color: colors.textMuted }}>TOMORROW'S VOLUME</Text>
                    <View style={styles.quantityControlRow}>
                      <TouchableOpacity 
                        onPress={() => adjustVolume(sub.id, -0.5)}
                        disabled={sub.status !== 'Active'}
                        style={{ opacity: sub.status === 'Active' ? 1 : 0.4 }}
                      >
                        <MinusCircle size={22} color={colors.accent} />
                      </TouchableOpacity>
                      <Text style={[styles.qtyDisplayTxt, { color: colors.text }]}>{sub.quantity} L</Text>
                      <TouchableOpacity 
                        onPress={() => adjustVolume(sub.id, 0.5)}
                        disabled={sub.status !== 'Active'}
                        style={{ opacity: sub.status === 'Active' ? 1 : 0.4 }}
                      >
                        <PlusCircle size={22} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Share.share({ message: `Hi ${sub.customerName}, your SevaStack Dairy credit status: Premium Milk Sub quantity: ${sub.quantity} Litres. Pause/Resume changes can be toggled by SMS.` })}
                  >
                    <Share2 size={13} color={colors.text} style={{ marginRight: 4 }} />
                    <Text style={{ color: colors.text, fontSize: 11, fontWeight: '700' }}>Notify Customer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.actionBtn, 
                      sub.status === 'Active' ? { backgroundColor: colors.error + '15' } : { backgroundColor: colors.success + '15' }
                    ]}
                    onPress={() => toggleSubscriptionStatus(sub.id)}
                  >
                    {sub.status === 'Active' ? (
                      <View style={styles.flexRow}>
                        <Pause size={13} color={colors.error} style={{ marginRight: 4 }} />
                        <Text style={{ color: colors.error, fontSize: 11, fontWeight: '700' }}>Pause Milk</Text>
                      </View>
                    ) : (
                      <View style={styles.flexRow}>
                        <Play size={13} color={colors.success} style={{ marginRight: 4 }} />
                        <Text style={{ color: colors.success, fontSize: 11, fontWeight: '700' }}>Resume Milk</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'bottles' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Empty Bottle Returns Audit</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Track premium glass bottle ledgers returned by residences to avoid container leakages and deposit losses.
              </Text>
            </View>

            {subscriptions.filter(s => s.bottlesDue > 0).map(sub => (
              <GlassCard key={sub.id} style={styles.bottleCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentName, { color: colors.text }]}>{sub.customerName}</Text>
                    <Text style={[styles.hostelText, { color: colors.textMuted }]}> {sub.address}</Text>
                  </View>
                  <View style={styles.bottleStatsBlock}>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>BOTTLES PENDING</Text>
                    <Text style={[styles.pendingBottleVal, { color: colors.error }]}>
                      {sub.bottlesDue - sub.bottlesReturnedToday} Bottles
                    </Text>
                  </View>
                </View>

                <View style={[styles.bottleLoggerArea, { borderTopColor: colors.border }]}>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>Log Bottle Returned Today:</Text>
                  <View style={styles.flexRow}>
                    <TouchableOpacity 
                      style={[styles.returnLogBtn, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
                      onPress={() => logReturnedBottle(sub.id, 1)}
                      disabled={sub.bottlesReturnedToday >= sub.bottlesDue}
                    >
                      <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>+1 Bottle Returned</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.returnLogBtn, { backgroundColor: colors.success + '20', borderColor: colors.success, marginLeft: 8 }]}
                      onPress={() => {
                        logReturnedBottle(sub.id, sub.bottlesDue);
                      }}
                      disabled={sub.bottlesReturnedToday >= sub.bottlesDue}
                    >
                      <Text style={{ color: colors.success, fontSize: 11, fontWeight: '800' }}>Mark All Returned</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'quality' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Fat & SNF Quality Audit Journal</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Log and broadcast fat percentages and Lactometer purity scores to retain student and professor mess trust.
              </Text>
            </View>

            {/* Quality testing form */}
            <GlassCard style={styles.qualityForm}>
              <View style={styles.formHeaderRow}>
                <Award size={18} color={colors.primary} />
                <Text style={[styles.formTitle, { color: colors.text }]}>Log Daily Milk Quality Score</Text>
              </View>

              <View style={styles.formInputsGrid}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Fat Percentage</Text>
                  <TextInput
                    style={[styles.qualityField, { color: colors.text, borderColor: colors.border }]}
                    value={inputFat}
                    onChangeText={setInputFat}
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>SNF percentage</Text>
                  <TextInput
                    style={[styles.qualityField, { color: colors.text, borderColor: colors.border }]}
                    value={inputSnf}
                    onChangeText={setInputSnf}
                  />
                </View>
              </View>

              <View style={styles.formInputsGrid}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Lactometer Score</Text>
                  <TextInput
                    style={[styles.qualityField, { color: colors.text, borderColor: colors.border }]}
                    value={inputLacto}
                    onChangeText={setInputLacto}
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Chiller Temp</Text>
                  <TextInput
                    style={[styles.qualityField, { color: colors.text, borderColor: colors.border }]}
                    value={inputTemp}
                    onChangeText={setInputTemp}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.submitQualityBtn, { backgroundColor: colors.primary }]}
                onPress={handleAddQualityLog}
              >
                <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Certify Quality Audit</Text>
              </TouchableOpacity>
            </GlassCard>

            {/* Quality Log lists */}
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Transparency Quality Journal Logs:</Text>
            {qualityLog.map((log, idx) => (
              <GlassCard key={idx} style={styles.qualityLogCard}>
                <View style={styles.logHeaderRow}>
                  <Text style={[styles.logDate, { color: colors.text }]}>{log.date} Batch</Text>
                  <View style={[styles.approvedBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={{ fontSize: 9, color: colors.success, fontWeight: '900' }}>{log.status.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.logMetricsGrid}>
                  <View style={styles.logMetricColumn}>
                    <Text style={{ fontSize: 9, color: colors.textMuted }}>FAT CONTENT</Text>
                    <Text style={[styles.logMetricValue, { color: colors.text }]}>{log.fat}</Text>
                  </View>
                  <View style={styles.logMetricColumn}>
                    <Text style={{ fontSize: 9, color: colors.textMuted }}>SNF SOLIDS</Text>
                    <Text style={[styles.logMetricValue, { color: colors.text }]}>{log.snf}</Text>
                  </View>
                  <View style={styles.logMetricColumn}>
                    <Text style={{ fontSize: 9, color: colors.textMuted }}>LACTOMETER</Text>
                    <Text style={[styles.logMetricValue, { color: colors.text }]}>{log.lacto}</Text>
                  </View>
                  <View style={styles.logMetricColumn}>
                    <Text style={{ fontSize: 9, color: colors.textMuted }}>TEMP</Text>
                    <Text style={[styles.logMetricValue, { color: colors.text }]}>{log.temp}</Text>
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'routes' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Morning Delivery Dispatch Runs</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Monitor morning runners delivering raw milk packets to hostels and professor quarters. Keeps runners accountable for logistics.
              </Text>
            </View>

            {dispatchRuns.map(run => (
              <GlassCard key={run.id} style={styles.routeCard}>
                <View style={styles.dispatchHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.zoneName, { color: colors.text }]}>{run.zone}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Assigned Runner:  {run.runner}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: run.status === 'Delivered' ? colors.success + '20' : colors.accent + '20' }]}>
                    <Text style={{ fontSize: 9, color: run.status === 'Delivered' ? colors.success : colors.accent, fontWeight: '900' }}>
                      {run.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Progress details */}
                <View style={[styles.routeVolumePanel, { borderTopColor: colors.border }]}>
                  <View>
                    <Text style={{ fontSize: 9, color: colors.textMuted }}>TOTAL VOLUME DISPATCHED</Text>
                    <Text style={[styles.boldLabel, { color: colors.text }]}>{run.milkLitres} Litres</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 9, color: colors.textMuted }}>DISPATCH COMPLETED</Text>
                    <Text style={[styles.boldLabel, { color: colors.text }]}>{run.completed} / {run.total} houses</Text>
                  </View>
                </View>

                <View style={[styles.progressBarArea, { backgroundColor: colors.border }]}>
                  <View style={[
                    styles.progressBarInner, 
                    { 
                      backgroundColor: colors.primary,
                      width: `${(run.completed / run.total) * 100}%`
                    }
                  ]} />
                </View>

                <View style={styles.runnerActions}>
                  <TouchableOpacity 
                    style={[styles.routeDetailsBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Alert.alert('Runner Coordinates', `Ravi is currently at ${run.zone}. Contact: +919876543210.`)}
                  >
                    <MapPin size={13} color={colors.text} style={{ marginRight: 4 }} />
                    <Text style={{ color: colors.text, fontSize: 10, fontWeight: '700' }}>Trace Runner GPS</Text>
                  </TouchableOpacity>

                  {run.status !== 'Delivered' && (
                    <TouchableOpacity 
                      style={[styles.routeDetailsBtn, { backgroundColor: colors.primary }]}
                      onPress={async () => {
                        if (!profile?.id) return;
                        const { error } = await supabase.from('milk_dispatch_runs').update({
                          completed: run.total,
                          status: 'Delivered'
                        }).eq('id', run.id);

                        if (error) {
                          Alert.alert('Error', error.message);
                          return;
                        }

                        Alert.alert('Delivery Verified', 'Dispatched logs finalized for this sector.');
                        fetchData();
                      }}
                    >
                      <CheckCircle2 size={13} color="#FFF" style={{ marginRight: 4 }} />
                      <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}>Mark Delivered</Text>
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
            { id: 'subs', label: 'Active Subs', icon: Users },
            { id: 'bottles', label: 'Bottle Returns', icon: RefreshCw },
            { id: 'quality', label: 'Fat & Fat Audit', icon: Flame },
            { id: 'routes', label: 'Delivery Runs', icon: Truck },
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
  detailPanel: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boldLabel: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  quantityControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  qtyDisplayTxt: {
    fontSize: 14,
    fontWeight: '900',
  },
  actionsRow: {
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
  bottleCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  bottleStatsBlock: {
    alignItems: 'flex-end',
  },
  pendingBottleVal: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  bottleLoggerArea: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 10,
    gap: 8,
  },
  returnLogBtn: {
    flex: 1,
    height: 32,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qualityForm: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  formInputsGrid: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 10,
    marginBottom: 2,
    fontWeight: '700',
  },
  qualityField: {
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 12,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  submitQualityBtn: {
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 10,
  },
  qualityLogCard: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 14,
  },
  logHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logDate: {
    fontSize: 12,
    fontWeight: '800',
  },
  approvedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  logMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logMetricColumn: {
    gap: 2,
  },
  logMetricValue: {
    fontSize: 12,
    fontWeight: '900',
  },
  routeCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  dispatchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoneName: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  routeVolumePanel: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressBarArea: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 12,
  },
  progressBarInner: {
    height: '100%',
    borderRadius: 3,
  },
  runnerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  routeDetailsBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 32,
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
