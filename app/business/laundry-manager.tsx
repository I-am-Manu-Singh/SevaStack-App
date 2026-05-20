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
  Waves,
  Timer,
  Shirt,
  Calendar,
  AlertTriangle,
  Plus,
  Search,
  Share2,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  UserPlus,
  Printer,
  QrCode,
  Flame,
  ArrowUpRight
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { CustomerBusinessView } from '@/components/CustomerBusinessView';

export default function LaundryManagerScreen() {
  const { userRole, businessType } = useApp();
  
  if (userRole === 'customer' || businessType !== 'Laundry') {
    return <CustomerBusinessView type="Laundry" />;
  }

  return <LaundryManagerScreenMerchant />;
}

function LaundryManagerScreenMerchant() {

  const { colors, theme, profile, userRole, businessType } = useApp();
  
  

  const [activeTab, setActiveTab] = useState<'orders' | 'delicate' | 'schedule'>('orders');

  // Dynamic Supabase State
  const [orders, setOrders] = useState<any[]>([]);
  const [delicateWarnings, setDelicateWarnings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const { data, error } = await supabase
        .from('laundry_orders')
        .select('*')
        .eq('merchant_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped = data.map((row: any) => ({
          id: row.id,
          customerName: row.customer_name,
          room: row.room,
          items: row.items,
          serviceType: row.service_type,
          amount: parseFloat(row.amount),
          status: row.status,
          delicateTag: row.delicate_tag,
          date: row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Just Now'
        }));
        setOrders(mapped);

        // Extract delicate warnings dynamically
        const warnings = mapped
          .filter((ord: any) => ord.delicateTag)
          .map((ord: any) => ({
            id: ord.id,
            itemName: `${ord.serviceType} clothes bag`,
            owner: `${ord.customerName} (${ord.room})`,
            dangerTag: 'Special Care Required',
            warning: ord.delicateTag,
            verified: ord.status !== 'Received'
          }));
        setDelicateWarnings(warnings);
      }
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
  const [activeStatusFilter, setActiveStatusFilter] = useState<'All' | 'Received' | 'In-Wash' | 'Ironing' | 'Ready for Pick'>('All');

  // Add Order Modal Form states
  const [newOrderModal, setNewOrderModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newItemsCount, setNewItemsCount] = useState('6');
  const [newService, setNewService] = useState('Wash & Iron');
  const [newDelicateTag, setNewDelicateTag] = useState('');
  
  // Transition order processing timeline
  const transitionOrderStatus = async (id: string, currentStatus: string) => {
    const statusSequence = ['Received', 'In-Wash', 'Ironing', 'Ready for Pick', 'Completed'];
    const nextIdx = statusSequence.indexOf(currentStatus) + 1;
    if (nextIdx >= statusSequence.length) return;

    const nextStatus = statusSequence[nextIdx];

    try {
      const { error } = await supabase
        .from('laundry_orders')
        .update({ status: nextStatus })
        .eq('id', id);

      if (error) throw error;

      if (nextStatus === 'Completed') {
        Alert.alert('Order Settled', 'Laundry bag has been picked up by customer and payment cleared!');
      }
      fetchData();
    } catch (e: any) {
      Alert.alert("Failed to update status", e.message);
    }
  };

  // Add fresh laundry order
  const handleAddNewOrder = async () => {
    if (!newName || !newRoom) {
      Alert.alert('Missing Fields', 'Please complete customer details.');
      return;
    }
    if (!profile?.id) return;

    const items = parseInt(newItemsCount) || 5;
    let rate = 20; // Default rate per item
    if (newService.includes('Dry Clean')) rate = 70;
    else if (newService.includes('Iron')) rate = 30;

    try {
      const { error } = await supabase
        .from('laundry_orders')
        .insert([{
          merchant_id: profile.id,
          customer_name: newName,
          room: newRoom,
          items: items,
          service_type: newService,
          amount: items * rate,
          status: 'Received',
          delicate_tag: newDelicateTag || null
        }]);

      if (error) throw error;

      Alert.alert('Order Booked', `Registered laundry bag with ${items} items under ${newService}.`);
      setNewName('');
      setNewRoom('');
      setNewItemsCount('6');
      setNewDelicateTag('');
      setNewOrderModal(false);
      fetchData();
    } catch (e: any) {
      Alert.alert("Failed to book order", e.message);
    }
  };

  // Verify garment damage warning tag
  const verifyWarning = async (id: string) => {
    try {
      const { error } = await supabase
        .from('laundry_orders')
        .update({ status: 'In-Wash' })
        .eq('id', id);

      if (error) throw error;

      Alert.alert('Garment Safe-checked', 'Delicate laundry item marked as checked and moved to In-Wash.');
      fetchData();
    } catch (e: any) {
      Alert.alert("Failed to check item", e.message);
    }
  };

  // Filtered lists
  const filteredOrders = orders.filter(ord => {
    const matchesSearch = ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ord.room.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ord.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeStatusFilter === 'All' || ord.status === activeStatusFilter;
    return matchesSearch && matchesStatus && ord.status !== 'Completed';
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <Stack.Screen options={{ 
        title: 'Laundry & Dry Cleaning Hub',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerShown: true
      }} />

      <ScrollView 
         showsVerticalScrollIndicator={false} 
         contentContainerStyle={styles.scrollContent}
         refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        
        {activeTab === 'orders' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Active Laundry Processing Bags</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Monitor wash cycles and iron dispatches. Transition bags along the timeline: Received  In-Wash  Ironing  Ready for Pick.
              </Text>
            </View>

            {/* Quick Search and Add Order */}
            <View style={styles.searchRow}>
              <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search students, PG, room, service..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.searchInput, { color: colors.text }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity 
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
                onPress={() => setNewOrderModal(!newOrderModal)}
              >
                <Plus size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Status Filter Row */}
            <View style={styles.filterRow}>
              {['All', 'Received', 'In-Wash', 'Ironing', 'Ready for Pick'].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    activeStatusFilter === f && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]}
                  onPress={() => setActiveStatusFilter(f as any)}
                >
                  <Text style={[
                    styles.filterChipTxt,
                    { color: colors.textMuted },
                    activeStatusFilter === f && { color: colors.primary, fontWeight: '700' }
                  ]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Add Order form workspace card */}
            {newOrderModal && (
              <GlassCard style={styles.modalFormCard}>
                <View style={styles.formHeaderRow}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Book Laundry Bag</Text>
                  <TouchableOpacity onPress={() => setNewOrderModal(false)}>
                    <Text style={{ color: colors.error, fontWeight: '700' }}>Close</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Student Name / Professor Name"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newName}
                  onChangeText={setNewName}
                />

                <TextInput
                  placeholder="PG Hostel Room (e.g. PG Block 3 Rm 202)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newRoom}
                  onChangeText={setNewRoom}
                />

                <View style={styles.inlineInputsGrid}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Clothes Count</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                      value={newItemsCount}
                      onChangeText={setNewItemsCount}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={{ flex: 2 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Wash Treatment</Text>
                    <View style={styles.selectBoxArea}>
                      {['Wash & Iron', 'Premium Dry Clean', 'Wash Only'].map(serv => (
                        <TouchableOpacity
                          key={serv}
                          style={[
                            styles.smallSelectChip,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            newService === serv && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                          ]}
                          onPress={() => setNewService(serv)}
                        >
                          <Text style={{ fontSize: 9, color: newService === serv ? colors.primary : colors.textMuted }}>{serv}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <TextInput
                  placeholder="Garment instructions (e.g. woolens, avoid steam)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newDelicateTag}
                  onChangeText={setNewDelicateTag}
                />

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddNewOrder}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Confirm Wash Order</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* List */}
            {filteredOrders.map(ord => (
              <GlassCard key={ord.id} style={styles.orderCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentName, { color: colors.text }]}>{ord.customerName}</Text>
                    <Text style={[styles.hostelText, { color: colors.textMuted }]}> {ord.room} • {ord.date}</Text>
                  </View>
                  
                  <View style={[
                    styles.statusBadge, 
                    ord.status === 'Ready for Pick' ? { backgroundColor: colors.success + '20' } : { backgroundColor: colors.accent + '20' }
                  ]}>
                    <Timer size={11} color={ord.status === 'Ready for Pick' ? colors.success : colors.accent} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 9, color: ord.status === 'Ready for Pick' ? colors.success : colors.accent, fontWeight: '900' }}>
                      {ord.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Processing particulars */}
                <View style={[styles.particularsPanel, { borderTopColor: colors.border }]}>
                  <View>
                    <Text style={{ fontSize: 9, color: colors.textMuted }}>WASH CATEGORY & SERVICE</Text>
                    <Text style={[styles.boldLabel, { color: colors.text }]}>{ord.serviceType}</Text>
                  </View>
                  
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 9, color: colors.textMuted }}>QUANTITY</Text>
                    <Text style={[styles.boldLabel, { color: colors.text }]}>{ord.items} Items</Text>
                  </View>
                </View>

                {ord.delicateTag && (
                  <View style={[styles.delicateBanner, { backgroundColor: colors.error + '10', borderColor: colors.error + '30' }]}>
                    <AlertTriangle size={12} color={colors.error} style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 10, color: colors.error, fontWeight: '700' }}>
                      Delicate item warning: {ord.delicateTag}
                    </Text>
                  </View>
                )}

                {/* Settle total cost */}
                <View style={[styles.invoiceRow, { borderTopColor: colors.border }]}>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>Est. Processing Dues:</Text>
                  <Text style={[styles.qtyDisplayTxt, { color: colors.text }]}>₹{ord.amount}</Text>
                </View>

                {/* Actions timeline transition */}
                <View style={styles.timelineTransitionArea}>
                  <TouchableOpacity 
                    style={[styles.shareSlipBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Share.share({ message: `Hi ${ord.customerName}, your SevaStack Laundry Order is ${ord.status}. Outstanding amount: ₹${ord.amount}.` })}
                  >
                    <Share2 size={13} color={colors.text} style={{ marginRight: 4 }} />
                    <Text style={{ color: colors.text, fontSize: 11, fontWeight: '700' }}>Share Invoice</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.transitionButton, { backgroundColor: colors.primary }]}
                    onPress={() => transitionOrderStatus(ord.id, ord.status)}
                  >
                    <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900' }}>
                      {ord.status === 'Received' && 'Start Washing '}
                      {ord.status === 'In-Wash' && 'Move to Ironing '}
                      {ord.status === 'Ironing' && 'Mark Ready for Pick '}
                      {ord.status === 'Ready for Pick' && 'Settle Dues & Picked up '}
                    </Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'delicate' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Sensitive Fabrics Damage Control Ledger</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Ensure safety compliance for premium designer student silks or heavy professor woolens. Cross-check fabric tags before loading dryers.
              </Text>
            </View>

            {delicateWarnings.map(dw => (
              <GlassCard key={dw.id} style={styles.delicateCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentName, { color: colors.text }]}> {dw.itemName}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Owner: {dw.owner}</Text>
                  </View>
                  
                  <View style={[styles.statusBadge, { backgroundColor: dw.verified ? colors.success + '20' : colors.error + '20' }]}>
                    <Text style={{ fontSize: 9, color: dw.verified ? colors.success : colors.error, fontWeight: '900' }}>
                      {dw.verified ? 'VERIFIED SAFE' : 'PENDING CHECK'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.delicateAlertPanel, { borderTopColor: colors.border }]}>
                  <View style={[styles.fabricTagBadge, { backgroundColor: colors.error + '20' }]}>
                    <AlertTriangle size={12} color={colors.error} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 10, color: colors.error, fontWeight: '900' }}>{dw.dangerTag.toUpperCase()}</Text>
                  </View>
                  
                  <Text style={[styles.warningInstructionText, { color: colors.text }]}>
                    Handling Guide: {dw.warning}
                  </Text>
                </View>

                {!dw.verified && (
                  <TouchableOpacity 
                    style={[styles.verifyButton, { backgroundColor: colors.success }]}
                    onPress={() => verifyWarning(dw.id)}
                  >
                    <CheckCircle2 size={13} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>Garment Checked: Safe to Process</Text>
                  </TouchableOpacity>
                )}
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'schedule' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Scheduled PG Pickup & Drop Slots</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Track laundry collection runs requested by students from hostels.
              </Text>
            </View>

            {[
              { id: 's1', house: 'Hostel B - Rm 212', slots: '10:00 AM - 12:00 PM', runner: 'Ravi Pal', action: 'Pickup Clothes Bag' },
              { id: 's2', house: 'PG Block 4 - Rm 5', slots: '02:00 PM - 04:00 PM', runner: 'Amit Yadav', action: 'Drop Ironed Clothes' }
            ].map(slot => (
              <GlassCard key={slot.id} style={styles.scheduleCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentName, { color: colors.text }]}>{slot.house}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Action:  {slot.action}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={{ fontSize: 9, color: colors.primary, fontWeight: '900' }}>{slot.slots}</Text>
                  </View>
                </View>
                
                <View style={[styles.scheduleFooter, { borderTopColor: colors.border }]}>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>Assigned Runner:  {slot.runner}</Text>
                  <TouchableOpacity 
                    style={[styles.scheduleBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Alert.alert('Runner Dispatched', `${slot.runner} is notified of the ${slot.action} run.`)}
                  >
                    <Text style={{ color: colors.text, fontSize: 10, fontWeight: '700' }}>Dispatch Runner</Text>
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
            { id: 'orders', label: 'Wash Orders', icon: Shirt },
            { id: 'delicate', label: 'Delicate Safety', icon: AlertTriangle },
            { id: 'schedule', label: 'Pickup Slots', icon: Calendar },
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
  orderCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
  },
  particularsPanel: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  boldLabel: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  delicateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
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
  timelineTransitionArea: {
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
  delicateCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  delicateAlertPanel: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 6,
    gap: 8,
  },
  fabricTagBadge: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  warningInstructionText: {
    fontSize: 12,
    lineHeight: 16,
  },
  verifyButton: {
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
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
