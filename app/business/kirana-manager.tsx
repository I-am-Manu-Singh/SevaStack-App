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
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  Plus,
  Search,
  Share2,
  Trash2,
  ChevronRight,
  UserPlus,
  Sparkles,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
  Printer,
  QrCode,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { CustomerBusinessView } from '@/components/CustomerBusinessView';

export default function KiranaManagerScreen() {
  const { userRole, businessType } = useApp();
  
  if (userRole === 'customer' || businessType !== 'Kirana') {
    return <CustomerBusinessView type="Kirana" />;
  }

  return <KiranaManagerScreenMerchant />;
}

function KiranaManagerScreenMerchant() {

  const { colors, theme, profile, userRole, businessType } = useApp();
  
  

  const [activeTab, setActiveTab] = useState<'khata' | 'inventory' | 'expiry' | 'pos'>('khata');

  // Dynamic Supabase State
  const [khataRecords, setKhataRecords] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [expiringItems, setExpiringItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const [khataRes, invRes] = await Promise.all([
        supabase.from('khata_records').select('*').eq('merchant_id', profile.id),
        supabase.from('inventory').select('*').eq('merchant_id', profile.id)
      ]);

      let finalKhata = khataRes.data || [];
      if (!khataRes.data || khataRes.data.length === 0) {
        const defaultKhata = [
          { amount: 1500, description: JSON.stringify({ studentName: 'Rohan Gupta', hostel: 'Hostel 4, Room 101', creditLimit: 3000 }) },
          { amount: 3200, description: JSON.stringify({ studentName: 'Deepak Kumar', hostel: 'PG Royal, Room 4', creditLimit: 3000 }) }
        ].map(k => ({ ...k, merchant_id: profile.id }));
        const seedRes = await supabase.from('khata_records').insert(defaultKhata).select();
        if (seedRes.data) finalKhata = seedRes.data;
      }

      const mappedKhata = finalKhata.map((rec: any) => {
        let meta = { studentName: 'Student Ledger', hostel: 'PG Block-A', creditLimit: 3000 };
        try {
          if (rec.description && (rec.description.startsWith('{') || rec.description.startsWith('['))) {
            meta = JSON.parse(rec.description);
          } else if (rec.description) {
            meta.studentName = rec.description;
          }
        } catch (err) {}
        return {
          id: rec.id,
          studentName: meta.studentName || 'Student Ledger',
          hostel: meta.hostel || 'PG Block-A',
          amountDue: parseFloat(rec.amount || '0'),
          creditLimit: meta.creditLimit || 3000,
          status: parseFloat(rec.amount || '0') >= (meta.creditLimit || 3000) ? 'Warning' : 'Approved',
          lastUpdated: rec.created_at ? new Date(rec.created_at).toLocaleDateString() : 'Just Now'
        };
      });
      setKhataRecords(mappedKhata);

      let finalInv = invRes.data || [];
      if (!invRes.data || invRes.data.length === 0) {
        const defaultInv = [
          { name: 'Maggie Noodles 12-Pack', stock: 45, threshold: 10, unit: 'packet', category: 'Packaged Food' },
          { name: 'Mother Dairy Toned Milk', stock: 30, threshold: 15, unit: 'packet', category: 'Dairy' },
          { name: 'Lays Potato Chips Classic', stock: 55, threshold: 12, unit: 'packet', category: 'Snacks' },
          { name: 'Coca Cola Bottle 750ml', stock: 8, threshold: 10, unit: 'bottle', category: 'Beverages' }
        ].map(item => ({ ...item, merchant_id: profile.id }));
        const seedRes = await supabase.from('inventory').insert(defaultInv).select();
        if (seedRes.data) finalInv = seedRes.data;
      }

      const mappedInv = finalInv.map((item: any) => ({
        id: item.id,
        itemName: item.name,
        stock: item.stock || 0,
        threshold: item.threshold || 10,
        unit: item.unit || 'piece',
        category: item.category || 'General'
      }));
      setInventory(mappedInv);

      setExpiringItems([
        { id: 'exp-1', itemName: 'Amul Taaza Milk 1L', originalPrice: 66, discount: 30, daysLeft: 1, activeSale: false },
        { id: 'exp-2', itemName: 'Britannia Sliced Bread', originalPrice: 45, discount: 25, daysLeft: 2, activeSale: false },
        { id: 'exp-3', itemName: 'Mother Dairy Curd 400g', originalPrice: 35, discount: 20, daysLeft: 3, activeSale: false }
      ]);
    } catch (e) {
      console.error("Error loading Kirana data:", e);
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

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeKhataFilter, setActiveKhataFilter] = useState<'All' | 'Dues' | 'Exceeded'>('All');

  // POS / Settle State
  const [settlingRecord, setSettlingRecord] = useState<any | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleMethod, setSettleMethod] = useState<'Cash' | 'UPI'>('UPI');
  const [qrGenerated, setQrGenerated] = useState(false);

  // Add Dues Form states
  const [addDueModal, setAddDueModal] = useState(false);
  const [addDueCustomer, setAddDueCustomer] = useState<any | null>(null);
  const [dueAmountInput, setDueAmountInput] = useState('');
  const [dueRemarks, setDueRemarks] = useState('');

  // Add Item to Khata Record Modal
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerHostel, setNewCustomerHostel] = useState('');
  const [newCustomerLimit, setNewCustomerLimit] = useState('3000');
  const [newCustomerModal, setNewCustomerModal] = useState(false);

  // Log manual repayment/dues transaction
  const handleRecordRepayment = async () => {
    if (!settleAmount || parseFloat(settleAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    const amount = parseFloat(settleAmount);
    const newDue = Math.max(0, settlingRecord.amountDue - amount);

    try {
      const { error } = await supabase
        .from('khata_records')
        .update({
          amount: newDue
        })
        .eq('id', settlingRecord.id);

      if (error) throw error;

      Alert.alert(
        'Payment Settled', 
        `Logged ₹${amount} repayment via ${settleMethod} for ${settlingRecord.studentName}. Remaining Dues: ₹${newDue}.`
      );

      setSettlingRecord(null);
      setSettleAmount('');
      setQrGenerated(false);
      fetchData();
    } catch (e: any) {
      Alert.alert("Repayment Failed", e.message);
    }
  };

  // Add fresh dues
  const handleAddDues = async () => {
    if (!dueAmountInput || parseFloat(dueAmountInput) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid due amount.');
      return;
    }

    const amount = parseFloat(dueAmountInput);
    const newDue = addDueCustomer.amountDue + amount;

    try {
      const { error } = await supabase
        .from('khata_records')
        .update({
          amount: newDue
        })
        .eq('id', addDueCustomer.id);

      if (error) throw error;

      if (newDue > addDueCustomer.creditLimit) {
        Alert.alert(
          'Credit Limit Approached', 
          `${addDueCustomer.studentName} has crossed their defined credit limit. Dues: ₹${newDue}.`
        );
      } else {
        Alert.alert('Dues Logged', `Added ₹${amount} due entry successfully for ${addDueCustomer.studentName}.`);
      }

      setAddDueCustomer(null);
      setDueAmountInput('');
      setDueRemarks('');
      fetchData();
    } catch (e: any) {
      Alert.alert("Failed to add dues", e.message);
    }
  };

  // Register New Student Ledger
  const handleAddNewCustomer = async () => {
    if (!newCustomerName || !newCustomerHostel) {
      Alert.alert('Missing Info', 'Please enter both student Name and Hostel/PG address.');
      return;
    }

    const meta = {
      studentName: newCustomerName,
      hostel: newCustomerHostel,
      creditLimit: parseFloat(newCustomerLimit) || 3000
    };

    try {
      const { error } = await supabase
        .from('khata_records')
        .insert([{
          merchant_id: profile.id,
          amount: 0,
          type: 'income',
          description: JSON.stringify(meta)
        }]);

      if (error) throw error;

      Alert.alert('Ledger Generated', `Created Khata ledger account for ${newCustomerName}.`);
      setNewCustomerName('');
      setNewCustomerHostel('');
      setNewCustomerLimit('3000');
      setNewCustomerModal(false);
      fetchData();
    } catch (e: any) {
      Alert.alert("Failed to open ledger", e.message);
    }
  };

  // Restock Inventory item
  const restockItem = async (id: string, qty: number) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    const newStock = item.stock + qty;

    try {
      const { error } = await supabase
        .from('inventory')
        .update({ stock: newStock })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (e: any) {
      Alert.alert("Failed to restock item", e.message);
    }
  };

  // Toggle Expiry Clearance sale
  const toggleClearanceSale = (id: string) => {
    setExpiringItems(prev => prev.map(item => {
      if (item.id === id) {
        const newState = !item.activeSale;
        Alert.alert(
          newState ? 'Clearance Active' : 'Clearance Halted', 
          newState ? `Broadcasting ${item.discount}% discount for ${item.itemName} on student marketplace!` : `Halted clearance sale broadcast.`
        );
        return { ...item, activeSale: newState };
      }
      return item;
    }));
  };

  // Filters
  const filteredKhata = khataRecords.filter(rec => {
    const matchesSearch = rec.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rec.hostel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = 
      activeKhataFilter === 'All' || 
      (activeKhataFilter === 'Dues' && rec.amountDue > 0) || 
      (activeKhataFilter === 'Exceeded' && rec.amountDue >= rec.creditLimit);
    return matchesSearch && matchesStatus;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <Stack.Screen options={{ 
        title: 'Kirana & Khata Manager',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerShown: true
      }} />

      {/* Sub-Tabs */}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {activeTab === 'khata' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Student Khata & Credit Caps</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Manage credit accounts, record dynamic due purchases, and trigger repayments. Define custom credit ceilings to restrict outstanding limits.
              </Text>
            </View>

            {/* Quick search and Add customer ledger */}
            <View style={styles.searchRow}>
              <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search students, PG, hostel..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.searchInput, { color: colors.text }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity 
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
                onPress={() => setNewCustomerModal(!newCustomerModal)}
              >
                <Plus size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Khata Status filters */}
            <View style={styles.filterRow}>
              {['All', 'Dues', 'Exceeded'].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    activeKhataFilter === f && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]}
                  onPress={() => setActiveKhataFilter(f as any)}
                >
                  <Text style={[
                    styles.filterChipTxt,
                    { color: colors.textMuted },
                    activeKhataFilter === f && { color: colors.primary, fontWeight: '700' }
                  ]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Create Customer ledger modal card */}
            {newCustomerModal && (
              <GlassCard style={styles.modalFormCard}>
                <View style={styles.formHeaderRow}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Generate Student Ledger</Text>
                  <TouchableOpacity onPress={() => setNewCustomerModal(false)}>
                    <Text style={{ color: colors.error, fontWeight: '700' }}>Close</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Student Name"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newCustomerName}
                  onChangeText={setNewCustomerName}
                />

                <TextInput
                  placeholder="Hostel / Room (e.g. PG Block 3 - Room 10)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newCustomerHostel}
                  onChangeText={setNewCustomerHostel}
                />

                <View style={{ marginBottom: 12 }}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Credit Limit Ceiling (₹)</Text>
                  <TextInput
                    placeholder="e.g. 3000"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                    value={newCustomerLimit}
                    onChangeText={setNewCustomerLimit}
                    keyboardType="numeric"
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddNewCustomer}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Open Ledger Account</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* Settle repayment workspace card */}
            {settlingRecord && (
              <GlassCard style={styles.posPanel}>
                <View style={styles.formHeaderRow}>
                  <QrCode size={18} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Settle Dues: {settlingRecord.studentName}</Text>
                  <TouchableOpacity onPress={() => setSettlingRecord(null)}>
                    <Text style={{ color: colors.error, fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
                  Total Dues outstanding: <Text style={{ color: colors.error, fontWeight: '800' }}>₹{settlingRecord.amountDue}</Text>
                </Text>

                <TextInput
                  placeholder="Enter repayment amount (₹)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={settleAmount}
                  onChangeText={setSettleAmount}
                  keyboardType="numeric"
                />

                <View style={styles.methodChoiceRow}>
                  {['UPI', 'Cash'].map(m => (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.methodChip,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        settleMethod === m && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                      ]}
                      onPress={() => {
                        setSettleMethod(m as any);
                        setQrGenerated(false);
                      }}
                    >
                      <Text style={{ fontSize: 11, color: settleMethod === m ? colors.primary : colors.textMuted }}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {settleMethod === 'UPI' && (
                  <View style={{ marginBottom: 12 }}>
                    {!qrGenerated ? (
                      <TouchableOpacity 
                        style={[styles.subActionBtn, { backgroundColor: colors.surfaceLight }]}
                        onPress={() => setQrGenerated(true)}
                      >
                        <QrCode size={14} color={colors.text} style={{ marginRight: 4 }} />
                        <Text style={{ color: colors.text, fontSize: 11, fontWeight: '800' }}>Generate Dynamic UPI QR Code</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.qrSandbox}>
                        <View style={[styles.qrMockPlaceholder, { borderColor: colors.border }]}>
                          <QrCode size={70} color={colors.text} />
                        </View>
                        <Text style={{ fontSize: 9, color: colors.textMuted, marginTop: 4 }}>Dynamic QR code for ₹{settleAmount || '0'} generated</Text>
                      </View>
                    )}
                  </View>
                )}

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.success }]}
                  onPress={handleRecordRepayment}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Finalize Repayment Ledger</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* Add dues modal workspace card */}
            {addDueCustomer && (
              <GlassCard style={styles.posPanel}>
                <View style={styles.formHeaderRow}>
                  <ArrowUpRight size={18} color={colors.error} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Add Dues Entry: {addDueCustomer.studentName}</Text>
                  <TouchableOpacity onPress={() => setAddDueCustomer(null)}>
                    <Text style={{ color: colors.error, fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Purchase Value / Due Amount (₹)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={dueAmountInput}
                  onChangeText={setDueAmountInput}
                  keyboardType="numeric"
                />

                <TextInput
                  placeholder="Remarks (e.g. Maggie packets, milk soap)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={dueRemarks}
                  onChangeText={setDueRemarks}
                />

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.error }]}
                  onPress={handleAddDues}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Log Outstanding Dues</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* List */}
            {filteredKhata.map(rec => (
              <GlassCard key={rec.id} style={styles.khataCard}>
                <View style={styles.subCardHeader}>
                  <View style={[styles.khataAvatar, { backgroundColor: colors.surface }]}>
                    <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 16 }}>{rec.studentName[0]}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.studentName, { color: colors.text }]}>{rec.studentName}</Text>
                    <Text style={[styles.hostelText, { color: colors.textMuted }]}>{rec.hostel}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: rec.status === 'Approved' ? colors.success + '20' : colors.error + '20' }]}>
                    <Text style={{ fontSize: 9, color: rec.status === 'Approved' ? colors.success : colors.error, fontWeight: '900' }}>
                      {rec.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Ledger metrics */}
                <View style={[styles.khataDetailsRow, { borderTopColor: colors.border }]}>
                  <View>
                    <Text style={{ fontSize: 9, color: colors.textMuted }}>OUTSTANDING DUES</Text>
                    <Text style={[
                      styles.dueValue, 
                      { color: rec.amountDue > 0 ? colors.error : colors.text },
                      rec.amountDue >= rec.creditLimit && { color: colors.error, fontWeight: '900' }
                    ]}>
                      ₹{rec.amountDue}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 9, color: colors.textMuted }}>CREDIT CEILING LIMIT</Text>
                    <Text style={[styles.limitValue, { color: colors.text }]}>₹{rec.creditLimit}</Text>
                  </View>
                </View>

                {/* Bottom Actions */}
                <View style={[styles.khataActionsRow, { borderTopColor: colors.border }]}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: colors.error + '12' }]}
                    onPress={() => setAddDueCustomer(rec)}
                  >
                    <ArrowUpRight size={13} color={colors.error} style={{ marginRight: 4 }} />
                    <Text style={{ color: colors.error, fontSize: 11, fontWeight: '700' }}>Log Purchase</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: colors.success + '12' }]}
                    onPress={() => setSettlingRecord(rec)}
                  >
                    <ArrowDownLeft size={13} color={colors.success} style={{ marginRight: 4 }} />
                    <Text style={{ color: colors.success, fontSize: 11, fontWeight: '700' }}>Repay/Settle</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.circleActionBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Share.share({ message: `Hi ${rec.studentName}, your outstanding Kirana Khata balance is ₹${rec.amountDue}. Please clear outstanding bills when possible!` })}
                  >
                    <Share2 size={13} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'inventory' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Fast-Stock & Low-Supply Alerts</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Track hot student demands. Products dropping below the minimum threshold trigger instant supply warnings.
              </Text>
            </View>

            {inventory.map(item => {
              const isLow = item.stock <= item.threshold;
              return (
                <GlassCard key={item.id} style={styles.invCard}>
                  <View style={styles.subCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.studentName, { color: colors.text }]}>{item.itemName}</Text>
                      <Text style={{ fontSize: 10, color: colors.textMuted }}>Category: {item.category}</Text>
                    </View>
                    
                    {isLow && (
                      <View style={[styles.statusBadge, { backgroundColor: colors.error + '20' }]}>
                        <ShieldAlert size={12} color={colors.error} style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 9, color: colors.error, fontWeight: '900' }}>LOW STOCK</Text>
                      </View>
                    )}
                  </View>

                  <View style={[styles.stockStatusPanel, { borderTopColor: colors.border }]}>
                    <View>
                      <Text style={{ fontSize: 9, color: colors.textMuted }}>CURRENT SUPPLY</Text>
                      <Text style={[
                        styles.qtyDisplayTxt, 
                        { color: colors.text },
                        isLow && { color: colors.error, fontWeight: '900' }
                      ]}>
                        {item.stock} {item.unit}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 9, color: colors.textMuted }}>MINIMUM THRESHOLD</Text>
                      <Text style={[styles.qtyDisplayTxt, { color: colors.text }]}>{item.threshold} {item.unit}</Text>
                    </View>
                  </View>

                  <View style={[styles.restockArea, { borderTopColor: colors.border }]}>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>Quick Restock:</Text>
                    <View style={styles.flexRow}>
                      <TouchableOpacity style={[styles.restockBtn, { backgroundColor: colors.primary }]} onPress={() => restockItem(item.id, 5)}>
                        <Text style={styles.restockBtnTxt}>+5</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.restockBtn, { backgroundColor: colors.primary, marginLeft: 6 }]} onPress={() => restockItem(item.id, 10)}>
                        <Text style={styles.restockBtnTxt}>+10</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.restockBtn, { backgroundColor: colors.primary, marginLeft: 6 }]} onPress={() => restockItem(item.id, 20)}>
                        <Text style={styles.restockBtnTxt}>+20</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </GlassCard>
              );
            })}
          </View>
        )}

        {activeTab === 'expiry' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Expiry clearance sale journal</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Track food products approaching expiry dates. Broadcast discounted clearance prices to student groups to clean shelves quickly.
              </Text>
            </View>

            {expiringItems.map(item => (
              <GlassCard key={item.id} style={styles.expiryCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentName, { color: colors.text }]}>{item.itemName}</Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>Original Retail: ₹{item.originalPrice}</Text>
                  </View>
                  
                  <View style={[styles.daysLeftBadge, { backgroundColor: item.daysLeft <= 2 ? colors.error + '20' : colors.accent + '20' }]}>
                    <Clock size={12} color={item.daysLeft <= 2 ? colors.error : colors.accent} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 9, color: item.daysLeft <= 2 ? colors.error : colors.accent, fontWeight: '900' }}>
                      {item.daysLeft} DAYS LEFT
                    </Text>
                  </View>
                </View>

                {/* Expiry detail metrics */}
                <View style={[styles.expiryPricingRow, { borderTopColor: colors.border }]}>
                  <View>
                    <Text style={{ fontSize: 9, color: colors.textMuted }}>CLEARANCE OFFER</Text>
                    <Text style={[styles.discountValue, { color: colors.primary }]}>{item.discount}% DISCOUNT</Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 9, color: colors.textMuted }}>CLEARANCE SALE PRICE</Text>
                    <Text style={[styles.qtyDisplayTxt, { color: colors.text }]}>₹{Math.round(item.originalPrice * (1 - item.discount / 100))}</Text>
                  </View>
                </View>

                {/* Broadcast actions */}
                <View style={[styles.broadcastActionArea, { borderTopColor: colors.border }]}>
                  <TouchableOpacity 
                    style={[
                      styles.clearanceTriggerBtn, 
                      item.activeSale ? { backgroundColor: colors.success + '20', borderColor: colors.success } : { backgroundColor: colors.primary }
                    ]}
                    onPress={() => toggleClearanceSale(item.id)}
                  >
                    {item.activeSale ? (
                      <View style={styles.flexRow}>
                        <CheckCircle2 size={13} color={colors.success} style={{ marginRight: 4 }} />
                        <Text style={{ color: colors.success, fontSize: 11, fontWeight: '800' }}>Broadcast active on student Feed</Text>
                      </View>
                    ) : (
                      <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>Activate 48h clearance broadcast</Text>
                    )}
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
            { id: 'khata', label: 'Khata Ledger', icon: UserPlus },
            { id: 'inventory', label: 'Stock Alerts', icon: ShoppingBag },
            { id: 'expiry', label: 'Expiry clearance', icon: Percent },
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
  inputLabel: {
    fontSize: 10,
    marginBottom: 2,
    fontWeight: '700',
  },
  submitBtn: {
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  posPanel: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  methodChoiceRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  methodChip: {
    flex: 1,
    height: 34,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subActionBtn: {
    flexDirection: 'row',
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrSandbox: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  qrMockPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  khataCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  subCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  khataAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
  },
  khataDetailsRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dueValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  limitValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  khataActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 10,
    gap: 6,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  stockStatusPanel: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qtyDisplayTxt: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  restockArea: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  restockBtn: {
    width: 42,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restockBtnTxt: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  expiryCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  daysLeftBadge: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignItems: 'center',
  },
  expiryPricingRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  discountValue: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  broadcastActionArea: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 10,
  },
  clearanceTriggerBtn: {
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
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
