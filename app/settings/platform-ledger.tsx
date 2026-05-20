import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  FlatList
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  IndianRupee, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  X, 
  Filter, 
  RefreshCw, 
  PlusCircle, 
  BookOpen,
  PieChart,
  Undo2,
  Truck,
  HelpCircle
} from 'lucide-react-native';
import { Spacing, Typography, Colors } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: string;
  order_id: string;
  amount: number;
  commission_amount: number;
  delivery_fee: number;
  refund_amount: number;
  type: 'order' | 'refund' | 'cancellation' | 'settlement' | 'delivery';
  status: 'completed' | 'pending' | 'reversed';
  description: string;
  created_at: string;
}

export default function PlatformLedgerScreen() {
  const { colors } = useApp();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<any>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [activeLedgerView, setActiveLedgerView] = useState<'all' | 'user' | 'merchant' | 'owner'>('all');

  // Simulation Modal
  const [showSimModal, setShowSimModal] = useState(false);
  const [simAmount, setSimAmount] = useState('800');
  const [simType, setSimType] = useState<'order' | 'refund' | 'cancellation' | 'delivery'>('order');
  const [simDesc, setSimDesc] = useState('Standard Tiffin delivery charge');
  const [simulating, setSimulating] = useState(false);

  async function loadLedger() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Load Merchant Profile
        const { data: merData } = await supabase
          .from('merchants')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (merData) {
          setProfile(merData);
          
          // Load Ledger
          const { data: txData, error: txErr } = await supabase
            .from('platform_transactions')
            .select('*')
            .eq('merchant_id', merData.id)
            .order('created_at', { ascending: false });

          if (!txErr && txData) {
            setTransactions(txData);
          }
        }
      }
    } catch (e: any) {
      console.warn("Error loading ledger:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadLedger();
  }, []);

  const handleSimulateTx = async () => {
    if (!simAmount.trim() || isNaN(parseFloat(simAmount))) {
      Alert.alert("Invalid Input", "Please enter a valid amount.");
      return;
    }

    setSimulating(true);
    try {
      const amt = parseFloat(simAmount);
      let comm = 0;
      let deliv = 0;
      let ref = 0;
      let status: 'completed' | 'reversed' | 'pending' = 'completed';

      if (simType === 'order') {
        comm = amt * 0.10; // 10% commission cut
        deliv = 50.00; // standard flat delivery fee
      } else if (simType === 'refund') {
        ref = amt;
        comm = -amt * 0.10; // reverse platform commission cut
      } else if (simType === 'cancellation') {
        ref = amt;
        status = 'reversed';
      } else if (simType === 'delivery') {
        deliv = amt;
      }

      if (profile) {
        const { error } = await supabase
          .from('platform_transactions')
          .insert([{
            merchant_id: profile.id,
            order_id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
            amount: amt,
            commission_amount: comm,
            delivery_fee: deliv,
            refund_amount: ref,
            type: simType,
            status: status,
            description: simDesc.trim() || `Simulated ${simType} transaction`
          }]);

        if (error) throw error;
        
        Alert.alert("Seeded Successfully", "A new ledger entry has been posted.");
        setShowSimModal(false);
        loadLedger();
      } else {
        Alert.alert("No Profile Found", "Could not simulate transaction in demo mode.");
      }
    } catch (err: any) {
      Alert.alert("Simulation Failed", err.message);
    } finally {
      setSimulating(false);
    }
  };

  // Calculations
  const totalVolume = transactions
    .filter(t => t.type === 'order' && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalRefunds = transactions
    .filter(t => (t.type === 'refund' || t.type === 'cancellation') && t.status !== 'pending')
    .reduce((sum, t) => sum + Number(t.refund_amount), 0);

  const totalOwnerCommission = transactions
    .reduce((sum, t) => sum + Number(t.commission_amount), 0);

  const totalOwnerDelivery = transactions
    .reduce((sum, t) => sum + Number(t.delivery_fee), 0);

  const totalMerchantPayouts = totalVolume - totalOwnerCommission - totalRefunds;

  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    
    // Filter based on View Target
    if (activeLedgerView === 'user') {
      return t.type === 'order' || t.type === 'refund';
    }
    if (activeLedgerView === 'merchant') {
      return t.type === 'order' || t.type === 'settlement' || t.type === 'refund';
    }
    if (activeLedgerView === 'owner') {
      return t.commission_amount !== 0 || t.delivery_fee !== 0;
    }
    return true;
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ 
        title: 'Platform Ledger',
        headerRight: () => (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => { setRefreshing(true); loadLedger(); }}>
              <RefreshCw size={22} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowSimModal(true)}>
              <PlusCircle size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )
      }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Entity Split Navigation Tabs */}
        <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {(['all', 'user', 'merchant', 'owner'] as const).map((view) => (
            <TouchableOpacity 
              key={view} 
              onPress={() => setActiveLedgerView(view)}
              style={[styles.tab, activeLedgerView === view && { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.tabText, { color: activeLedgerView === view ? '#FFF' : colors.textMuted }]}>
                {view === 'all' ? 'Universal' : view === 'user' ? 'Customer' : view === 'merchant' ? 'Merchant' : 'Admin'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dynamic Financial HUD Summary */}
        <View style={styles.hudGrid}>
          {activeLedgerView === 'all' && (
            <>
              <GlassCard style={styles.hudCard}>
                <TrendingUp size={20} color={colors.primary} />
                <Text style={[styles.hudLabel, { color: colors.textMuted }]}>TOTAL GROSS VOLUME</Text>
                <Text style={[styles.hudValue, { color: colors.text }]}>₹{totalVolume.toFixed(2)}</Text>
              </GlassCard>
              <GlassCard style={styles.hudCard}>
                <Undo2 size={20} color={colors.error} />
                <Text style={[styles.hudLabel, { color: colors.textMuted }]}>REFUNDS & REVERSALS</Text>
                <Text style={[styles.hudValue, { color: colors.text }]}>₹{totalRefunds.toFixed(2)}</Text>
              </GlassCard>
            </>
          )}

          {activeLedgerView === 'user' && (
            <>
              <GlassCard style={styles.hudCard}>
                <TrendingUp size={20} color={colors.primary} />
                <Text style={[styles.hudLabel, { color: colors.textMuted }]}>TOTAL PAID TO PLATFORM</Text>
                <Text style={[styles.hudValue, { color: colors.text }]}>₹{totalVolume.toFixed(2)}</Text>
              </GlassCard>
              <GlassCard style={styles.hudCard}>
                <Undo2 size={20} color={Colors.success} />
                <Text style={[styles.hudLabel, { color: colors.textMuted }]}>REFUNDED TO WALLET</Text>
                <Text style={[styles.hudValue, { color: colors.text }]}>₹{totalRefunds.toFixed(2)}</Text>
              </GlassCard>
            </>
          )}

          {activeLedgerView === 'merchant' && (
            <>
              <GlassCard style={styles.hudCard}>
                <TrendingUp size={20} color={Colors.success} />
                <Text style={[styles.hudLabel, { color: colors.textMuted }]}>ESTIMATED NET PAYOUTS</Text>
                <Text style={[styles.hudValue, { color: colors.text }]}>₹{totalMerchantPayouts.toFixed(2)}</Text>
              </GlassCard>
              <GlassCard style={styles.hudCard}>
                <PieChart size={20} color={colors.accent} />
                <Text style={[styles.hudLabel, { color: colors.textMuted }]}>COMMISSION CUT LOSS</Text>
                <Text style={[styles.hudValue, { color: colors.text }]}>₹{totalOwnerCommission.toFixed(2)}</Text>
              </GlassCard>
            </>
          )}

          {activeLedgerView === 'owner' && (
            <>
              <GlassCard style={styles.hudCard}>
                <TrendingUp size={20} color={colors.primary} />
                <Text style={[styles.hudLabel, { color: colors.textMuted }]}>ADMIN PLATFORM YIELD</Text>
                <Text style={[styles.hudValue, { color: colors.text }]}>₹{totalOwnerCommission.toFixed(2)}</Text>
              </GlassCard>
              <GlassCard style={styles.hudCard}>
                <Truck size={20} color={colors.accent} />
                <Text style={[styles.hudLabel, { color: colors.textMuted }]}>ADMIN DELIVERY POOL</Text>
                <Text style={[styles.hudValue, { color: colors.text }]}>₹{totalOwnerDelivery.toFixed(2)}</Text>
              </GlassCard>
            </>
          )}
        </View>

        {/* Filters and List */}
        <View style={styles.headerFiltersRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction History Log</Text>
          <View style={styles.filterChipRow}>
            {(['all', 'order', 'refund', 'cancellation'] as const).map((type) => (
              <TouchableOpacity 
                key={type} 
                onPress={() => setFilterType(type)}
                style={[
                  styles.filterChip, 
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  filterType === type && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
              >
                <Text style={[styles.filterChipText, { color: filterType === type ? '#FFF' : colors.textMuted }]}>
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {filteredTransactions.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <BookOpen size={36} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No records match this selection.</Text>
          </GlassCard>
        ) : (
          <View style={styles.ledgerList}>
            {filteredTransactions.map((tx) => {
              const dateStr = new Date(tx.created_at).toLocaleDateString();
              const isDebit = tx.type === 'refund' || tx.type === 'cancellation';
              
              return (
                <GlassCard key={tx.id} style={styles.txCard}>
                  <View style={styles.txHeader}>
                    <View>
                      <Text style={[styles.txTitle, { color: colors.text }]}>{tx.description}</Text>
                      <Text style={[styles.txMeta, { color: colors.textMuted }]}>{tx.order_id} • {dateStr}</Text>
                    </View>
                    <Text style={[styles.txAmount, { color: isDebit ? colors.error : Colors.success }]}>
                      {isDebit ? '-' : '+'} ₹{tx.amount}
                    </Text>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  {/* Splits detailed journal audit */}
                  <View style={styles.txSplitsGrid}>
                    <View style={styles.splitItem}>
                      <Text style={[styles.splitLabel, { color: colors.textMuted }]}>Platform Comm Cut</Text>
                      <Text style={[styles.splitValue, { color: colors.text }]}>₹{tx.commission_amount}</Text>
                    </View>
                    <View style={styles.splitItem}>
                      <Text style={[styles.splitLabel, { color: colors.textMuted }]}>Delivery Surcharge</Text>
                      <Text style={[styles.splitValue, { color: colors.text }]}>₹{tx.delivery_fee}</Text>
                    </View>
                    <View style={styles.splitItem}>
                      <Text style={[styles.splitLabel, { color: colors.textMuted }]}>Status</Text>
                      <Text style={[
                        styles.statusBadge, 
                        tx.status === 'completed' ? { color: '#10B981' } : 
                        tx.status === 'reversed' ? { color: '#EF4444' } : { color: '#F59E0B' }
                      ]}>
                        {tx.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Simulator Modal */}
      {showSimModal && (
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Simulate Platform Transaction</Text>
              <TouchableOpacity onPress={() => setShowSimModal(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Amount (₹)</Text>
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              value={simAmount}
              onChangeText={setSimAmount}
              keyboardType="numeric"
              placeholder="e.g. 500"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Transaction Type</Text>
            <View style={styles.typeSelectorRow}>
              {(['order', 'refund', 'cancellation', 'delivery'] as const).map((type) => (
                <TouchableOpacity 
                  key={type} 
                  onPress={() => setSimType(type)}
                  style={[
                    styles.typeSelectorBtn,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    simType === type && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                >
                  <Text style={[styles.typeSelectorBtnText, { color: simType === type ? '#FFF' : colors.text }]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>Description</Text>
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              value={simDesc}
              onChangeText={setSimDesc}
              placeholder="e.g. Hosteler food delivery commission"
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.border }]} 
                onPress={() => setShowSimModal(false)}
                disabled={simulating}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.primary }]} 
                onPress={handleSimulateTx}
                disabled={simulating}
              >
                {simulating ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Simulate</Text>
                )}
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '800',
  },
  hudGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  hudCard: {
    flex: 1,
    padding: 16,
    gap: 6,
  },
  hudLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hudValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  headerFiltersRow: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    marginLeft: 4,
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 9,
    fontWeight: '800',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
  },
  ledgerList: {
    gap: 12,
  },
  txCard: {
    padding: 16,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  txMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  txSplitsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  splitItem: {
    alignItems: 'flex-start',
  },
  splitLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 2,
  },
  splitValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: '800',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalInput: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 14,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeSelectorBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeSelectorBtnText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  modalBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
