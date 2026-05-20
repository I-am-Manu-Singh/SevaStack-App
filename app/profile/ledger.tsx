import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert, 
  RefreshControl, 
  TextInput,
  Modal
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  IndianRupee, 
  ArrowLeft, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  Building, 
  CreditCard,
  ChevronRight,
  ShieldAlert,
  Smartphone
} from 'lucide-react-native';
import { Spacing, Typography, Colors } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { MOCK_SESSION } from '@/constants/Auth';

interface LedgerItem {
  id: string;
  merchant_id: string;
  customer_name: string;
  service: string;
  time: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  business_type: string;
  created_at: string;
  merchant?: {
    business_name: string;
    business_type: string;
  };
}

export default function StudentLedgerScreen() {
  const { colors, session, t } = useApp();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ledgerItems, setLedgerItems] = useState<LedgerItem[]>([]);
  const [selectedBill, setSelectedBill] = useState<LedgerItem | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [upiPin, setUpiPin] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  const studentName = session?.user?.user_metadata?.full_name || MOCK_SESSION.name;

  const loadLedgerData = async () => {
    try {
      // 1. Fetch appointments where customer is the logged-in student
      const { data: aptData, error: aptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('customer_name', studentName)
        .order('created_at', { ascending: false });

      if (aptError) throw aptError;

      // 2. Fetch merchant info for these appointments to display business names
      const formattedItems: LedgerItem[] = [];
      
      if (aptData && aptData.length > 0) {
        const merchantIds = Array.from(new Set(aptData.map((a: any) => a.merchant_id).filter(Boolean)));
        
        let merchantsMap: Record<string, any> = {};
        if (merchantIds.length > 0) {
          const { data: merData } = await supabase
            .from('merchants')
            .select('id, business_name, business_type')
            .in('id', merchantIds);
            
          if (merData) {
            merData.forEach((m: any) => {
              merchantsMap[m.id] = m;
            });
          }
        }

        aptData.forEach((a: any) => {
          formattedItems.push({
            id: a.id,
            merchant_id: a.merchant_id,
            customer_name: a.customer_name,
            service: a.service,
            time: a.time,
            price: Number(a.price),
            status: a.status,
            business_type: a.business_type || 'General',
            created_at: a.created_at,
            merchant: merchantsMap[a.merchant_id] || {
              business_name: `${a.business_type || 'Local'} Partner`,
              business_type: a.business_type || 'General'
            }
          });
        });
      }

      setLedgerItems(formattedItems);
    } catch (e: any) {
      console.warn("Error fetching student ledger:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLedgerData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadLedgerData();
  }, []);

  // Filter only items that represent active credit (status !== 'completed' & status !== 'cancelled')
  const unpaidItems = ledgerItems.filter(item => item.status === 'confirmed' || item.status === 'pending');
  const paidItems = ledgerItems.filter(item => item.status === 'completed');

  const totalOutstanding = unpaidItems.reduce((sum, item) => sum + item.price, 0);

  const triggerPayment = (bill: LedgerItem) => {
    setSelectedBill(bill);
    setUpiPin('');
    setShowPayModal(true);
  };

  const handleProcessPayment = async () => {
    if (upiPin.length < 4) {
      Alert.alert("Invalid PIN", "Please enter your 4 or 6 digit UPI transaction PIN.");
      return;
    }

    setProcessingPayment(true);
    try {
      if (!selectedBill) return;

      // Update appointment status to 'completed' (Paid) in Supabase
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', selectedBill.id);

      if (error) throw error;

      // Log transaction entry to platform transactions
      await supabase.from('platform_transactions').insert([{
        merchant_id: selectedBill.merchant_id,
        order_id: selectedBill.id,
        amount: selectedBill.price,
        commission_amount: Number((selectedBill.price * 0.02).toFixed(2)),
        type: 'order',
        status: 'completed',
        description: `Student UPI Settlement for ${selectedBill.service}`
      }]);

      setShowPayModal(false);
      Alert.alert(
        "Settlement Completed",
        `Successfully transferred ₹${selectedBill.price} to ${selectedBill.merchant?.business_name || 'Merchant'}. Your ledger balance has been updated.`
      );
      loadLedgerData();
    } catch (err: any) {
      Alert.alert("Payment Failed", err.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ 
        title: 'My Ledger & Credit',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <ArrowLeft size={22} color={colors.primary} />
          </TouchableOpacity>
        )
      }} />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Balance Card */}
        <GlassCard style={styles.balanceCard}>
          <LinearGradient
            colors={[colors.primary + '25', colors.secondary + '12']}
            style={styles.gradientBg}
          >
            <View style={styles.balanceHeader}>
              <View>
                <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>Outstanding Dues (Khata)</Text>
                <Text style={[styles.balanceValue, { color: totalOutstanding > 0 ? colors.error : colors.success }]}>
                  ₹{totalOutstanding.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={[styles.avatarBadge, { backgroundColor: totalOutstanding > 0 ? colors.error + '15' : colors.success + '15' }]}>
                <IndianRupee size={28} color={totalOutstanding > 0 ? colors.error : colors.success} />
              </View>
            </View>
            
            <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />
            
            <View style={styles.limitRow}>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>Approved Credit Limit: ₹5,000</Text>
              <Text style={{ fontSize: 11, color: colors.text, fontWeight: '700' }}>
                ₹{(5000 - totalOutstanding).toLocaleString('en-IN')} Available
              </Text>
            </View>
          </LinearGradient>
        </GlassCard>

        {/* Info Box */}
        {totalOutstanding > 0 ? (
          <View style={[styles.infoBox, { backgroundColor: colors.secondary + '08', borderColor: colors.secondary + '20' }]}>
            <AlertCircle size={16} color={colors.secondary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Please settle outstanding balances before the end of the semester to maintain a high credit rating.
            </Text>
          </View>
        ) : null}

        {/* Unpaid bills list */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Unpaid Bills</Text>
        
        {unpaidItems.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <CheckCircle2 size={36} color={colors.success} style={{ marginBottom: 8 }} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>All Settled!</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>You do not have any pending merchant dues.</Text>
          </GlassCard>
        ) : (
          unpaidItems.map((bill) => (
            <GlassCard key={bill.id} style={styles.billCard}>
              <View style={styles.billHeader}>
                <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
                  <Building size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.businessName, { color: colors.text }]}>{bill.merchant?.business_name}</Text>
                  <Text style={[styles.serviceDetail, { color: colors.textMuted }]}>{bill.service}</Text>
                  <View style={styles.timeTag}>
                    <Clock size={11} color={colors.textMuted} />
                    <Text style={[styles.timeText, { color: colors.textMuted }]}>{bill.time}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <Text style={[styles.billPrice, { color: colors.text }]}>₹{bill.price}</Text>
                  <TouchableOpacity 
                    style={[styles.payBtn, { backgroundColor: colors.primary }]}
                    onPress={() => triggerPayment(bill)}
                  >
                    <Text style={styles.payBtnText}>Pay Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          ))
        )}

        {/* History / Settled receipts */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Recent Settled Transactions</Text>
        {paidItems.length === 0 ? (
          <Text style={[styles.noHistory, { color: colors.textMuted }]}>No settled transactions found.</Text>
        ) : (
          paidItems.map((bill) => (
            <GlassCard key={bill.id} style={[styles.billCard, { opacity: 0.8 }]}>
              <View style={styles.billHeader}>
                <View style={[styles.iconBox, { backgroundColor: colors.success + '10' }]}>
                  <CheckCircle2 size={20} color={colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.businessName, { color: colors.text }]}>{bill.merchant?.business_name}</Text>
                  <Text style={[styles.serviceDetail, { color: colors.textMuted }]}>{bill.service}</Text>
                  <Text style={{ fontSize: 10, color: colors.success, fontWeight: '700', marginTop: 2 }}>Settled via UPI</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.billPrice, { color: colors.textMuted, textDecorationLine: 'line-through' }]}>₹{bill.price}</Text>
                </View>
              </View>
            </GlassCard>
          ))
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Pay Modal */}
      <Modal
        visible={showPayModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>UPI Secure Checkout</Text>
            <Text style={[styles.modalSub, { color: colors.textMuted }]}>
              Transferring directly to {selectedBill?.merchant?.business_name}
            </Text>

            <View style={[styles.amountDisplay, { backgroundColor: colors.surface }]}>
              <Text style={[styles.amountText, { color: colors.text }]}>₹{selectedBill?.price}</Text>
            </View>

            <View style={styles.pinContainer}>
              <Text style={[styles.pinLabel, { color: colors.text }]}>Enter 4-Digit UPI PIN</Text>
              <TextInput
                style={[styles.pinInput, { color: colors.text, borderColor: colors.border }]}
                value={upiPin}
                onChangeText={setUpiPin}
                keyboardType="number-pad"
                secureTextEntry={true}
                maxLength={4}
                placeholder="••••"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, { borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setShowPayModal(false)}
                disabled={processingPayment}
              >
                <Text style={{ color: colors.text, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.success }]}
                onPress={handleProcessPayment}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Confirm Pay</Text>
                )}
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
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
  balanceCard: {
    padding: 0,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  gradientBg: {
    padding: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  avatarBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDivider: {
    height: 1,
    marginVertical: 16,
    opacity: 0.1,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 10,
    flex: 1,
    lineHeight: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  billCard: {
    padding: 12,
    marginBottom: 10,
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessName: {
    fontSize: 14,
    fontWeight: '800',
  },
  serviceDetail: {
    fontSize: 11,
    marginTop: 1,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
  },
  billPrice: {
    fontSize: 15,
    fontWeight: '900',
  },
  payBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  payBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  noHistory: {
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  modalSub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  amountDisplay: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  amountText: {
    fontSize: 28,
    fontWeight: '900',
  },
  pinContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  pinLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  pinInput: {
    width: 140,
    height: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 8,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
