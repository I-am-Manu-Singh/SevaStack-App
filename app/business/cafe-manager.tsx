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
  Utensils,
  Coffee,
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
  Users,
  ChefHat,
  Percent
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { CustomerBusinessView } from '@/components/CustomerBusinessView';

export default function CafeManagerScreen() {
  const { userRole, businessType } = useApp();
  
  if (userRole === 'customer' || businessType !== 'Cafe') {
    return <CustomerBusinessView type="Cafe" />;
  }

  return <CafeManagerScreenMerchant />;
}

function CafeManagerScreenMerchant() {

  const { colors, theme, profile, userRole, businessType } = useApp();
  
  

  const [activeTab, setActiveTab] = useState<'tokens' | 'split' | 'promos'>('tokens');

  // Dynamic Supabase State
  const [tokens, setTokens] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const [tokensData, promosData] = await Promise.all([
        supabase.from('cafe_tokens').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('cafe_promos').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false })
      ]);
      let finalTokens = tokensData.data || [];
      if (!tokensData.data || tokensData.data.length === 0) {
        const defaultTokens = [
          { token_number: 'TK-102', table_id: 'Table 5', items: 'Cheese Maggi + Cold Drink', qty_summary: '2 items', status: 'Cooking', amount: 140, student_name: 'Varun Sharma' },
          { token_number: 'TK-101', table_id: 'Table 2', items: 'Grilled Sandwich + Oreo Shake', qty_summary: '2 items', status: 'Ready for Pickup', amount: 220, student_name: 'Alia Bhatt' }
        ].map(t => ({ ...t, merchant_id: profile.id }));
        const seedRes = await supabase.from('cafe_tokens').insert(defaultTokens).select();
        if (seedRes.data) finalTokens = seedRes.data;
      }

      const mappedTokens = finalTokens.map((row: any) => ({
        id: row.id,
        tokenNumber: row.token_number,
        tableId: row.table_id,
        items: row.items,
        qtySummary: row.qty_summary || 'Custom items',
        status: row.status,
        amount: parseFloat(row.amount),
        studentName: row.student_name,
        date: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just Now'
      }));
      setTokens(mappedTokens);

      let finalPromos = promosData.data || [];
      if (!promosData.data || promosData.data.length === 0) {
        const defaultPromos = [
          { title: 'Late Night Maggi Combo', timing: '11:00 PM - 02:00 AM', description: 'Get free tea with any double masala cheese maggi order.', code: 'NIGHTOWL', active: true },
          { title: 'Exam Week Stressbuster', timing: '04:00 PM - 07:00 PM', description: 'Flat 15% discount on all beverages and cold coffee.', code: 'STRESSFREE', active: true }
        ].map(p => ({ ...p, merchant_id: profile.id }));
        const seedRes = await supabase.from('cafe_promos').insert(defaultPromos).select();
        if (seedRes.data) finalPromos = seedRes.data;
      }

      const mappedPromos = finalPromos.map((row: any) => ({
        id: row.id,
        title: row.title,
        timing: row.timing,
        description: row.description,
        code: row.code,
        active: row.active
      }));
      setPromos(mappedPromos);
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
  const [tokenFilter, setTokenFilter] = useState<'All' | 'Cooking' | 'Ready for Pickup' | 'Served'>('All');

  // Add Token state
  const [newTokenModal, setNewTokenModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTable, setNewTable] = useState('Table 5');
  const [newItems, setNewItems] = useState('Cheese Maggi + Cold Drink');
  const [newAmount, setNewAmount] = useState('140');

  // Split billing state
  const [splitTable, setSplitTable] = useState('Table 4');
  const [splitTotal, setSplitTotal] = useState('450');
  const [splitCount, setSplitCount] = useState('3');
  const [friendsList, setFriendsList] = useState([
    { name: 'Vikram Grover', share: 150, paid: false },
    { name: 'Sameer Jha', share: 150, paid: false },
    { name: 'Kabir Malhotra', share: 150, paid: false }
  ]);

  // Settle split friend share
  const handlePayShare = (index: number) => {
    setFriendsList(prev => prev.map((fr, idx) => {
      if (idx === index) {
        return { ...fr, paid: true };
      }
      return fr;
    }));
    Alert.alert('Share Settle', `Setted ₹${friendsList[index].share} via UPI for ${friendsList[index].name}.`);
  };

  // Add New Cafe Token
  const handleAddNewToken = async () => {
    if (!newItems || !newAmount) {
      Alert.alert('Missing Fields', 'Please complete item details and total charge.');
      return;
    }
    if (!profile?.id) return;

    const nextTokenNum = 100 + tokens.length + 1;

    try {
      const { error } = await supabase.from('cafe_tokens').insert([{
        merchant_id: profile.id,
        token_number: `Token #${nextTokenNum}`,
        table_id: newTable,
        items: newItems,
        qty_summary: 'Custom items',
        status: 'Cooking',
        amount: parseInt(newAmount) || 120,
        student_name: newName || 'Walk-in Student'
      }]);

      if (error) throw error;

      Alert.alert('Token Placed', `Generated Token #${nextTokenNum} for ${newName || 'Walk-in Student'}. Kitchen queue initialized.`);
      setNewName('');
      setNewTable('Table 5');
      setNewItems('');
      setNewAmount('140');
      setNewTokenModal(false);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  // Transition token preparation status
  const transitionTokenStatus = async (id: string, currentStatus: string) => {
    const statusSequence = ['Cooking', 'Ready for Pickup', 'Served'];
    const nextIdx = statusSequence.indexOf(currentStatus) + 1;
    if (nextIdx >= statusSequence.length) return;

    const nextStatus = statusSequence[nextIdx];

    try {
      const { error } = await supabase.from('cafe_tokens').update({
        status: nextStatus
      }).eq('id', id);

      if (error) throw error;

      if (nextStatus === 'Served') {
        Alert.alert('Token Served', 'Order marked as served and payment completed.');
      }
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  // Auto-split logic when split count or total changes
  const handleRecalculateSplit = () => {
    const total = parseFloat(splitTotal) || 0;
    const count = parseInt(splitCount) || 1;
    const shareAmt = Math.round(total / count);

    const newFriends = Array.from({ length: count }, (_, i) => ({
      name: i === 0 ? 'Vikram Grover' : `Friend ${i + 1}`,
      share: shareAmt,
      paid: false
    }));

    setFriendsList(newFriends);
  };

  const filteredTokens = tokens.filter(tk => {
    const matchesSearch = tk.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tk.items.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tk.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = tokenFilter === 'All' || tk.status === tokenFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <Stack.Screen options={{ 
        title: 'Cafe & Quick-Bites Suite',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerShown: true
      }} />

      <ScrollView 
         showsVerticalScrollIndicator={false} 
         contentContainerStyle={styles.scrollContent}
         refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        
        {activeTab === 'tokens' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Prep Tokenizer Kitchen Queue</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Track quick-bites food tokens, notify students automatically when cooking ends, and clear tables.
              </Text>
            </View>

            {/* Quick Search and Add Token */}
            <View style={styles.searchRow}>
              <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search token, student, food..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.searchInput, { color: colors.text }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity 
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
                onPress={() => setNewTokenModal(!newTokenModal)}
              >
                <Plus size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Token status filters */}
            <View style={styles.filterRow}>
              {['All', 'Cooking', 'Ready for Pickup', 'Served'].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    tokenFilter === f && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]}
                  onPress={() => setTokenFilter(f as any)}
                >
                  <Text style={[
                    styles.filterChipTxt,
                    { color: colors.textMuted },
                    tokenFilter === f && { color: colors.primary, fontWeight: '700' }
                  ]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Add Token Modal Form */}
            {newTokenModal && (
              <GlassCard style={styles.modalFormCard}>
                <View style={styles.formHeaderRow}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Create Kitchen Token</Text>
                  <TouchableOpacity onPress={() => setNewTokenModal(false)}>
                    <Text style={{ color: colors.error, fontWeight: '700' }}>Close</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Student Name / Walk-in"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newName}
                  onChangeText={setNewName}
                />

                <TextInput
                  placeholder="Table No / Takeaway (e.g. Table 3)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newTable}
                  onChangeText={setNewTable}
                />

                <TextInput
                  placeholder="Appetizers / Meals (e.g. 2 Butter Toast, 1 Cold Coffee)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newItems}
                  onChangeText={setNewItems}
                />

                <TextInput
                  placeholder="Order Total Bill (₹)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={newAmount}
                  onChangeText={setNewAmount}
                  keyboardType="numeric"
                />

                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddNewToken}
                >
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Confirm Order Token</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* List */}
            {filteredTokens.map(tk => (
              <GlassCard key={tk.id} style={styles.printCard}>
                <View style={styles.subCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{tk.studentName} ({tk.tableId})</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Placed: {tk.date}</Text>
                  </View>
                  
                  <View style={[
                    styles.statusBadge, 
                    tk.status === 'Ready for Pickup' ? { backgroundColor: colors.success + '20' } : 
                    tk.status === 'Served' ? { backgroundColor: colors.border } : { backgroundColor: colors.accent + '20' }
                  ]}>
                    <ChefHat size={11} color={tk.status === 'Ready for Pickup' ? colors.success : tk.status === 'Served' ? colors.textMuted : colors.accent} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 9, color: tk.status === 'Ready for Pickup' ? colors.success : tk.status === 'Served' ? colors.textMuted : colors.accent, fontWeight: '900' }}>
                      {tk.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={[styles.pdfDetailsPanel, { borderTopColor: colors.border }]}>
                  <Coffee size={16} color={colors.primary} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pdfNameLabel, { color: colors.text }]}>{tk.tokenNumber}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>
                      {tk.items} ({tk.qtySummary})
                    </Text>
                  </View>
                </View>

                <View style={[styles.invoiceRow, { borderTopColor: colors.border }]}>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>Total Food Charges:</Text>
                  <Text style={[styles.qtyDisplayTxt, { color: colors.text }]}>₹{tk.amount}</Text>
                </View>

                {/* Token Actions */}
                <View style={styles.printActionArea}>
                  <TouchableOpacity 
                    style={[styles.shareSlipBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Share.share({ message: `Hi ${tk.studentName}, your cafe food token order for ${tk.items} is ${tk.status}. Please collect at the counter! - Seva Cafe` })}
                  >
                    <Share2 size={13} color={colors.text} style={{ marginRight: 4 }} />
                    <Text style={{ color: colors.text, fontSize: 10, fontWeight: '700' }}>Alert Student</Text>
                  </TouchableOpacity>

                  {tk.status !== 'Served' && (
                    <TouchableOpacity 
                      style={[styles.transitionButton, { backgroundColor: colors.primary }]}
                      onPress={() => transitionTokenStatus(tk.id, tk.status)}
                    >
                      <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900' }}>
                        {tk.status === 'Cooking' && 'Mark Ready '}
                        {tk.status === 'Ready for Pickup' && 'Mark Served & Settle '}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'split' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Shared PG Friends Split-Billing Calculator</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Allows a group of hostelers to easily split their hangout bills. Generate individual UPI checkout tabs in real-time.
              </Text>
            </View>

            <GlassCard style={styles.billFormCard}>
              <View style={styles.formHeaderRow}>
                <Utensils size={18} color={colors.primary} />
                <Text style={[styles.formTitle, { color: colors.text }]}>Split Tab Desk ({splitTable})</Text>
              </View>

              <View style={styles.inlineInputsGrid}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Table / Group Id</Text>
                  <TextInput
                    style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                    value={splitTable}
                    onChangeText={setSplitTable}
                  />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Total Bill (₹)</Text>
                  <TextInput
                    style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                    value={splitTotal}
                    onChangeText={setSplitTotal}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Friends count</Text>
                  <TextInput
                    style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                    value={splitCount}
                    onChangeText={setSplitCount}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, { backgroundColor: colors.primary, marginBottom: 12 }]}
                onPress={handleRecalculateSplit}
              >
                <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Divide Split Equally</Text>
              </TouchableOpacity>

              {/* Friends split shares list */}
              <Text style={[styles.inputLabel, { color: colors.text, marginVertical: 8 }]}>SPLIT SHARES CHECKLIST</Text>
              {friendsList.map((fr, idx) => (
                <View key={idx} style={[styles.friendRow, { borderBottomColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, color: colors.text, fontWeight: '700' }}>{fr.name}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Share: ₹{fr.share}</Text>
                  </View>
                  
                  {fr.paid ? (
                    <View style={[styles.miniStatusBadge, { backgroundColor: colors.success + '20' }]}>
                      <Text style={{ color: colors.success, fontSize: 10, fontWeight: '800' }}>PAID </Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.payShareBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handlePayShare(idx)}
                    >
                      <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '800' }}>Settle share UPI</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </GlassCard>
          </View>
        )}

        {activeTab === 'promos' && (
          <View>
            <View style={styles.introHeader}>
              <Text style={[styles.introTitle, { color: colors.text }]}> Study Hours Cafe Promo Planner</Text>
              <Text style={[styles.introSub, { color: colors.textMuted }]}>
                Publish happy hour discount codes and combos during student self-study hours to drive off-peak hangout crowd.
              </Text>
            </View>

            {promos.map(pr => (
              <GlassCard key={pr.id} style={styles.packCard}>
                <View style={styles.subCardHeader}>
                  <Percent size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentNameText, { color: colors.text }]}>{pr.title}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}> Timings: {pr.timing}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={{ fontSize: 9, color: colors.success, fontWeight: '900' }}>ACTIVE</Text>
                  </View>
                </View>

                <View style={[styles.fitGridArea, { borderTopColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: colors.text }}>{pr.description}</Text>
                    <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '800', marginTop: 4 }}>
                      CODE: {pr.code}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.payShareBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => Share.share({ message: `Cafe Discount Alert! Claim the "${pr.title}" during ${pr.timing}. Use Code: ${pr.code} to get this special offer!` })}
                  >
                    <Text style={{ color: colors.text, fontSize: 9, fontWeight: '800' }}>Share Code</Text>
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
            { id: 'tokens', label: 'Live Prep Tokens', icon: ChefHat },
            { id: 'split', label: 'Table Split Bills', icon: Users },
            { id: 'promos', label: 'Happy Hour Promos', icon: Percent },
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
