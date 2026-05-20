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
  FlatList,
  ActivityIndicator,
  Share,
  RefreshControl
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter } from 'expo-router';
import { 
  Pill, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  User, 
  Stethoscope, 
  Activity, 
  Search, 
  Plus, 
  Minus,
  Trash2, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  Calculator, 
  AlertCircle, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  Phone,
  Check,
  RotateCcw,
  Smartphone,
  ShieldAlert,
  Cpu
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

import { CustomerBusinessView } from '@/components/CustomerBusinessView';

export default function ChemistShopScreen() {
  const { userRole, businessType } = useApp();
  
  if (userRole === 'customer' || businessType !== 'Pharmacy') {
    return <CustomerBusinessView type="Chemist" />;
  }

  return <ChemistShopScreenMerchant />;
}

function ChemistShopScreenMerchant() {

  const { colors, theme, profile, userRole, businessType } = useApp();
  
  

  const [activeTab, setActiveTab] = useState<'directory' | 'rx' | 'refills' | 'billing' | 'checker'>('directory');
  
  // State variables for dynamic operations
  const [medicines, setMedicines] = useState<any[]>([]);
  const [uploadedRxs, setUploadedRxs] = useState<any[]>([]);
  const [refills, setRefills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const [medsData, rxData, refillsData] = await Promise.all([
        supabase.from('chemist_medicines').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('chemist_prescriptions').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('chemist_refills').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false })
      ]);

      let finalMeds = medsData.data || [];
      if (!medsData.data || medsData.data.length === 0) {
        const defaultMeds = [
          { name: 'Dolo 650', category: 'Analgesics', salt: 'Paracetamol 650mg', warning: 'OTC', batch: 'B-DL390', stock: 120, price: 30, expiry: '12/2028', rx_required: false },
          { name: 'Amoxicillin 500mg', category: 'Antibiotics', salt: 'Amoxicillin Trihydrate', warning: 'Schedule H', batch: 'B-AM201', stock: 45, price: 85, expiry: '06/2027', rx_required: true },
          { name: 'Cetirizine 10mg', category: 'Anti-Allergic', salt: 'Cetirizine Hydrochloride', warning: 'OTC', batch: 'B-CT502', stock: 90, price: 20, expiry: '09/2028', rx_required: false }
        ].map(m => ({ ...m, merchant_id: profile.id }));
        const seedRes = await supabase.from('chemist_medicines').insert(defaultMeds).select();
        if (seedRes.data) finalMeds = seedRes.data;
      }

      const mappedMeds = finalMeds.map((row: any) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        salt: row.salt,
        warning: row.warning,
        batch: row.batch,
        stock: row.stock,
        price: parseFloat(row.price) || 0.00,
        expiry: row.expiry,
        rxRequired: row.rx_required
      }));
      setMedicines(mappedMeds);

      let finalRxs = rxData.data || [];
      if (!rxData.data || rxData.data.length === 0) {
        const defaultRxs = [
          { student_name: 'Aniket Gupta', hostel_address: 'Hostel B, Room 304', status: 'Pending Verification', file_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef' }
        ].map(rx => ({ ...rx, merchant_id: profile.id }));
        const seedRes = await supabase.from('chemist_prescriptions').insert(defaultRxs).select();
        if (seedRes.data) finalRxs = seedRes.data;
      }

      const mappedRxs = finalRxs.map((row: any) => ({
        id: row.id,
        studentName: row.student_name,
        hostel: row.hostel_address,
        status: row.status,
        date: new Date(row.created_at).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80', // default fallback UI display image
        fileUrl: row.file_url
      }));
      setUploadedRxs(mappedRxs);

      let finalRefills = refillsData.data || [];
      if (!refillsData.data || refillsData.data.length === 0) {
        const defaultRefills = [
          { student_name: 'Mayank Sen', med_name: 'Metformin 500mg', interval: 'Every 30 Days', next_date: 'June 01', days_left: 12, phone: '+919876543210' }
        ].map(r => ({ ...r, merchant_id: profile.id }));
        const seedRes = await supabase.from('chemist_refills').insert(defaultRefills).select();
        if (seedRes.data) finalRefills = seedRes.data;
      }

      const mappedRefills = finalRefills.map((row: any) => ({
        id: row.id,
        studentName: row.student_name,
        medName: row.med_name,
        interval: row.interval,
        nextDate: row.next_date,
        daysLeft: row.days_left,
        avatar: row.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&q=80',
        phone: row.phone
      }));
      setRefills(mappedRefills);

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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newMedModal, setNewMedModal] = useState(false);

  // Form states for adding/editing medicines
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Analgesics');
  const [formSalt, setFormSalt] = useState('');
  const [formWarning, setFormWarning] = useState('OTC');
  const [formBatch, setFormBatch] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formExpiry, setFormExpiry] = useState('');
  const [formRx, setFormRx] = useState(false);

  // RX Upload & AI extraction simulation states
  const [activeRxScan, setActiveRxScan] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<any | null>(null);

  // Billing POS States
  const [billingCart, setBillingCart] = useState<any[]>([]);
  const [billingStudent, setBillingStudent] = useState('Walk-in Customer');
  const [billingCreditApplied, setBillingCreditApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState('10'); // Default student discount
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Credit'>('UPI');
  const [checkoutReceipt, setCheckoutReceipt] = useState<any | null>(null);

  // AI Drug Interaction Checker States
  const [drugA, setDrugA] = useState('');
  const [drugB, setDrugB] = useState('');
  const [interactionResult, setInteractionResult] = useState<any | null>(null);
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);

  // Categories helper
  const categories = ['All', 'Analgesics', 'Antibiotics', 'Anti-Diabetic', 'Anti-Allergic', 'Anti-Hypertensive', 'Neuro'];

  // Add new medicine handler
  const handleAddMedicine = async () => {
    if (!formName || !formSalt || !formPrice || !formStock) {
      Alert.alert('Missing Info', 'Please fill out Name, Salt, Price, and Stock fields.');
      return;
    }
    if (!profile?.id) return;

    const stockVal = parseInt(formStock, 10) || 0;
    const priceVal = parseFloat(formPrice) || 0.00;
    const batchVal = formBatch || `B-XX${Math.floor(Math.random() * 900) + 100}`;
    const expiryVal = formExpiry || '12/2028';

    const { error } = await supabase.from('chemist_medicines').insert([{
      merchant_id: profile.id,
      name: formName,
      category: formCategory,
      salt: formSalt,
      warning: formWarning,
      batch: batchVal,
      stock: stockVal,
      price: priceVal,
      expiry: expiryVal,
      rx_required: formRx
    }]);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Success', `${formName} added successfully to the A-Z directory.`);
    resetMedForm();
    fetchData();
  };

  const resetMedForm = () => {
    setFormName('');
    setFormSalt('');
    setFormWarning('OTC');
    setFormBatch('');
    setFormStock('');
    setFormPrice('');
    setFormExpiry('');
    setFormRx(false);
    setNewMedModal(false);
  };

  // Stock operations
  const adjustStock = async (id: string, delta: number) => {
    if (!profile?.id) return;
    const match = medicines.find(item => item.id === id);
    if (!match) return;
    const newStock = Math.max(0, match.stock + delta);

    const { error } = await supabase.from('chemist_medicines').update({
      stock: newStock
    }).eq('id', id);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    fetchData();
  };

  // Simulation of AI Prescription Scanner
  const simulateRxScan = (rxId: string) => {
    const rx = uploadedRxs.find(item => item.id === rxId);
    if (!rx) return;
    
    setIsScanning(true);
    setActiveRxScan(rxId);
    setScannedResult(null);

    setTimeout(() => {
      setIsScanning(false);
      // Mock extracted details
      const mockExtraction = {
        student: rx.studentName,
        hostel: rx.hostel,
        extractedMeds: [
          { name: 'Amoxicillin 500mg', dosage: '1 Capsule - 3 times a day', duration: '5 days', qty: 15 },
          { name: 'Paracetamol 650mg (Dolo)', dosage: '1 Tablet - whenever needed for fever', duration: '3 days', qty: 10 }
        ],
        confidenceScore: 97,
        doctorId: 'MC-29402 (Dr. R.K. Verma, Kota Clinic)',
        warningDetected: 'Requires verification of student registration card'
      };
      setScannedResult(mockExtraction);
    }, 2000);
  };

  // Import extracted drugs directly into the POS bill
  const importExtractedMedsToBill = () => {
    if (!scannedResult) return;
    
    setBillingStudent(scannedResult.student);
    const updatedCart = [...billingCart];
    
    scannedResult.extractedMeds.forEach((extracted: any) => {
      // Find matching medicine in our A-Z directory
      const matchingMed = medicines.find(m => m.name.toLowerCase().includes(extracted.name.toLowerCase()) || extracted.name.toLowerCase().includes(m.name.toLowerCase()));
      if (matchingMed) {
        const existing = updatedCart.find(item => item.id === matchingMed.id);
        if (existing) {
          existing.qty += extracted.qty;
        } else {
          updatedCart.push({ ...matchingMed, qty: extracted.qty });
        }
      } else {
        // Fallback placeholder item
        updatedCart.push({
          id: `ext-${Date.now()}-${Math.random()}`,
          name: extracted.name,
          price: 90, // mock price
          salt: 'Extracted Compound',
          warning: 'Schedule H',
          stock: 99,
          qty: extracted.qty
        });
      }
    });

    setBillingCart(updatedCart);
    setActiveTab('billing');
    setScannedResult(null);
    setActiveRxScan(null);
    Alert.alert('POS Updated', `Meds from ${scannedResult.student}'s prescription added to Bill.`);
  };

  // Billing Operations
  const addToCart = (med: any) => {
    const existing = billingCart.find(item => item.id === med.id);
    if (existing) {
      setBillingCart(prev => prev.map(item => item.id === med.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setBillingCart([...billingCart, { ...med, qty: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setBillingCart(prev => prev.filter(item => item.id !== id));
  };

  const adjustCartQty = (id: string, delta: number) => {
    setBillingCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return billingCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  const calculateTotal = () => {
    const sub = calculateSubtotal();
    const disc = (sub * (parseFloat(discountPercent) || 0)) / 100;
    const credit = billingCreditApplied ? 50 : 0; // ₹50 flat credit discount
    return Math.max(0, sub - disc - credit);
  };

  const handleCheckout = async () => {
    if (billingCart.length === 0) {
      Alert.alert('Empty Cart', 'Please add medicines to the cart before checking out.');
      return;
    }
    if (!profile?.id) return;

    try {
      await Promise.all(billingCart.map(cartItem => {
        const localMed = medicines.find(m => m.id === cartItem.id);
        if (!localMed) return Promise.resolve();
        const nextStock = Math.max(0, localMed.stock - cartItem.qty);
        return supabase.from('chemist_medicines').update({ stock: nextStock }).eq('id', cartItem.id);
      }));
    } catch (err) {
      console.error('Failed to update stock: ', err);
    }

    const receipt = {
      invoiceId: `INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      student: billingStudent,
      items: [...billingCart],
      subtotal: calculateSubtotal(),
      discount: (calculateSubtotal() * (parseFloat(discountPercent) || 0)) / 100,
      credit: billingCreditApplied ? 50 : 0,
      total: calculateTotal(),
      paymentMode,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=sevastack@okicici&pn=SevaStackKota&am=${calculateTotal()}&cu=INR`
    };

    setCheckoutReceipt(receipt);
    setBillingCart([]);
    fetchData();
  };

  // AI Drug Interaction Checker logic
  const handleCheckInteractions = () => {
    if (!drugA || !drugB) {
      Alert.alert('Incomplete Check', 'Please fill in both drug compounds to run a diagnostics check.');
      return;
    }

    setIsCheckingInteractions(true);
    setInteractionResult(null);

    setTimeout(() => {
      setIsCheckingInteractions(false);
      const valA = drugA.toLowerCase();
      const valB = drugB.toLowerCase();

      // Setup precise, mock-intelligent medical checker clinical details
      if ((valA.includes('para') || valA.includes('dolo')) && (valB.includes('alcohol') || valB.includes('ethanol'))) {
        setInteractionResult({
          severity: 'High Warning',
          color: '#EF4444',
          contraindication: 'Acetaminophen (Paracetamol) + Ethanol Co-administration',
          risk: 'Severe hepatotoxicity (liver damage). Ethanol induces CYP2E1 enzymes leading to increased formation of the toxic metabolite NAPQI.',
          recommendation: 'Strictly advise patients to avoid alcohol consumption when taking Paracetamol based compounds. Monitor liver enzymes if chronic.'
        });
      } else if ((valA.includes('aspirin') || valA.includes('ecosprin')) && (valB.includes('ibuprofen') || valB.includes('combiflam'))) {
        setInteractionResult({
          severity: 'Moderate Alert',
          color: '#F59E0B',
          contraindication: 'NSAID + NSAID (Salicylate + Propionic Acid derivative)',
          risk: 'Ibuprofen may competitively block the irreversible antiplatelet effect of low-dose Aspirin, rendering cardiorespiratory prophylaxis less effective. Also increases risk of gastrointestinal bleeding/ulcers.',
          recommendation: 'Take Aspirin at least 2 hours before or 8 hours after taking Ibuprofen. Consider a proton pump inhibitor (PPI) if combined chronically.'
        });
      } else if (valA.includes('amoxicillin') && valB.includes('contraceptive')) {
        setInteractionResult({
          severity: 'Mild Warning',
          color: '#3B82F6',
          contraindication: 'Penicillin Antibiotic + Estrogen-based Oral Contraceptive',
          risk: 'Antibiotics may theoretically reduce gut flora responsible for hydrolyzing estrogen conjugates, potentially reducing contraceptive efficacy slightly.',
          recommendation: 'Advise secondary barrier contraceptive methods during the antibiotic course and for 7 days post-treatment.'
        });
      } else {
        setInteractionResult({
          severity: 'No Contraindications Found',
          color: '#10B981',
          contraindication: `No direct interaction known between ${drugA} and ${drugB}`,
          risk: 'Co-administration appears safe under standard adult therapeutic dosing guidelines.',
          recommendation: 'Standard safety practices apply. Advise patient to read labelling and consult their consulting general physician if side effects occur.'
        });
      }
    }, 1500);
  };

  // Filter medicines based on search and category
  const filteredMeds = medicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.salt.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.batch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <Stack.Screen options={{ 
        title: 'A-Z Chemist & Medicine Shop',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerShown: true
      }} />

      {/* Modern Glassmorphic Sub-header Tabs */}

      {/* Main content display based on tab selection */}
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
        {activeTab === 'directory' && (
          <View>
            {/* Search Bar & Action Buttons */}
            <View style={styles.searchRow}>
              <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search by Medicine, Salt Formula, Batch..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.searchInput, { color: colors.text }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity 
                style={[styles.addMedicineBtn, { backgroundColor: colors.primary }]}
                onPress={() => setNewMedModal(!newMedModal)}
              >
                <Plus size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Quick Categories Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
              {categories.map((cat, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    selectedCategory === cat && { backgroundColor: colors.primary + '25', borderColor: colors.primary }
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[
                    styles.categoryText, 
                    { color: colors.textMuted },
                    selectedCategory === cat && { color: colors.primary, fontWeight: '700' }
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Add New Medicine Modal / Inline form overlay */}
            {newMedModal && (
              <GlassCard style={styles.addMedFormCard}>
                <View style={styles.formHeader}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.formTitle, { color: colors.text }]}>Add New Drug to Directory</Text>
                  <TouchableOpacity onPress={() => setNewMedModal(false)}>
                    <Text style={{ color: colors.error, fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Medicine Brand Name (e.g. Dolo 650)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={formName}
                  onChangeText={setFormName}
                />

                <TextInput
                  placeholder="Chemical Salt / Formula (e.g. Acetaminophen)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border }]}
                  value={formSalt}
                  onChangeText={setFormSalt}
                />

                <View style={styles.formRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Warning Schedule</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
                      {['OTC', 'Schedule H', 'Schedule H1'].map(w => (
                        <TouchableOpacity
                          key={w}
                          style={[
                            styles.warningChip,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                            formWarning === w && { backgroundColor: colors.accent + '25', borderColor: colors.accent }
                          ]}
                          onPress={() => setFormWarning(w)}
                        >
                          <Text style={{ fontSize: 10, color: formWarning === w ? colors.accent : colors.textMuted }}>{w}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={{ width: 100 }}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Requires Rx?</Text>
                    <TouchableOpacity 
                      style={[styles.rxToggle, { backgroundColor: formRx ? colors.error + '25' : colors.surface, borderColor: formRx ? colors.error : colors.border }]}
                      onPress={() => setFormRx(!formRx)}
                    >
                      <Text style={{ color: formRx ? colors.error : colors.textMuted, fontSize: 11, fontWeight: '700', textAlign: 'center' }}>
                        {formRx ? 'RX REQ' : 'NO RX'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formRow}>
                  <TextInput
                    placeholder="Stock Qty"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.formInput, { flex: 1, marginRight: 8, color: colors.text, borderColor: colors.border }]}
                    value={formStock}
                    onChangeText={setFormStock}
                  />
                  <TextInput
                    placeholder="Price (₹)"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.formInput, { flex: 1, marginRight: 8, color: colors.text, borderColor: colors.border }]}
                    value={formPrice}
                    onChangeText={setFormPrice}
                  />
                  <TextInput
                    placeholder="Exp Date"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.formInput, { flex: 1, color: colors.text, borderColor: colors.border }]}
                    value={formExpiry}
                    onChangeText={setFormExpiry}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.submitMedBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddMedicine}
                >
                  <Text style={styles.submitMedTxt}>Register Medicine</Text>
                </TouchableOpacity>
              </GlassCard>
            )}

            {/* A-Z Medicines Directory List */}
            {filteredMeds.length === 0 ? (
              <View style={styles.emptyContainer}>
                <AlertCircle size={40} color={colors.textMuted} />
                <Text style={[styles.emptyTxt, { color: colors.textMuted }]}>No drugs found matching criteria.</Text>
              </View>
            ) : (
              filteredMeds.map(med => (
                <GlassCard key={med.id} style={styles.medCard}>
                  <View style={styles.medMainInfo}>
                    <View style={styles.medBadgeHolder}>
                      <View style={[styles.warningBadge, { backgroundColor: med.warning === 'OTC' ? colors.success + '20' : colors.error + '20' }]}>
                        <Text style={[styles.warningText, { color: med.warning === 'OTC' ? colors.success : colors.error }]}>
                          {med.warning}
                        </Text>
                      </View>
                      {med.rxRequired && (
                        <View style={[styles.rxReqBadge, { backgroundColor: '#EF4444' }]}>
                          <Text style={styles.rxReqTxt}>Rx Required</Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={[styles.medBrand, { color: colors.text }]}>{med.name}</Text>
                    <Text style={[styles.medSalt, { color: colors.textMuted }]}>Formula: {med.salt}</Text>
                    
                    <View style={styles.medMetadataRow}>
                      <View style={styles.metaLabel}>
                        <Calendar size={12} color={colors.textMuted} />
                        <Text style={[styles.metaText, { color: colors.textMuted }]}>Exp: {med.expiry}</Text>
                      </View>
                      <View style={styles.metaLabel}>
                        <Text style={[styles.metaText, { color: colors.textMuted }]}>Batch: {med.batch}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.medActionPanel, { borderTopColor: colors.border }]}>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.priceTag, { color: colors.text }]}>₹{med.price}</Text>
                      <Text style={{ fontSize: 10, color: colors.textMuted }}>per strip/unit</Text>
                    </View>

                    {/* Stock Operations */}
                    <View style={styles.stockOperator}>
                      <TouchableOpacity 
                        style={[styles.stockBtn, { backgroundColor: colors.surfaceLight }]}
                        onPress={() => adjustStock(med.id, -1)}
                      >
                        <Minus size={14} color={colors.text} />
                      </TouchableOpacity>
                      
                      <View style={styles.stockValBox}>
                        <Text style={[
                          styles.stockVal, 
                          { color: colors.text },
                          med.stock <= 15 && { color: colors.error, fontWeight: '800' }
                        ]}>
                          {med.stock} pcs
                        </Text>
                        {med.stock <= 15 && <Text style={styles.lowStockAlert}>LOW</Text>}
                      </View>

                      <TouchableOpacity 
                        style={[styles.stockBtn, { backgroundColor: colors.surfaceLight }]}
                        onPress={() => adjustStock(med.id, 1)}
                      >
                        <Plus size={14} color={colors.text} />
                      </TouchableOpacity>
                    </View>

                    {/* Add directly to POS Bill */}
                    <TouchableOpacity 
                      style={[styles.directBillBtn, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        addToCart(med);
                        Alert.alert('POS Updated', `${med.name} added to current bill.`);
                      }}
                    >
                      <Calculator size={14} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              ))
            )}
          </View>
        )}

        {activeTab === 'rx' && (
          <View>
            <View style={styles.rxHeader}>
              <Text style={[styles.tabIntroTitle, { color: colors.text }]}>Prescription Digitization Hub</Text>
              <Text style={[styles.tabIntroSub, { color: colors.textMuted }]}>
                Select an uploaded patient prescription to simulate AI extraction and load it into the billing checkout terminal.
              </Text>
            </View>

            {/* List of uploaded Patient RX */}
            {uploadedRxs.map(rx => (
              <GlassCard key={rx.id} style={styles.rxCard}>
                <View style={styles.rxRow}>
                  <Image source={{ uri: rx.image }} style={styles.rxPreviewImage} />
                  <View style={styles.rxInfo}>
                    <Text style={[styles.rxStudent, { color: colors.text }]}>{rx.studentName}</Text>
                    <Text style={[styles.rxSubText, { color: colors.textMuted }]}>{rx.hostel}</Text>
                    <Text style={[styles.rxSubText, { color: colors.textMuted }]}>{rx.date}</Text>
                    <View style={[styles.rxStatusBadge, { backgroundColor: rx.status === 'Verified' ? colors.success + '20' : colors.accent + '20' }]}>
                      <Text style={{ color: rx.status === 'Verified' ? colors.success : colors.accent, fontSize: 10, fontWeight: '700' }}>
                        {rx.status}
                      </Text>
                    </View>
                  </View>
                </View>

                {activeRxScan === rx.id ? (
                  <View style={[styles.aiScanContainer, { backgroundColor: colors.surfaceLight }]}>
                    {isScanning ? (
                      <View style={styles.scanningBox}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={[styles.scanningTxt, { color: colors.text }]}>AI extracting medical compounds...</Text>
                      </View>
                    ) : scannedResult ? (
                      <View>
                        <View style={styles.scannedHeader}>
                          <Sparkles size={16} color={colors.primary} />
                          <Text style={[styles.scannedTitle, { color: colors.text }]}>AI Extracted Details (Confidence: {scannedResult.confidenceScore}%)</Text>
                        </View>
                        
                        <Text style={[styles.doctorText, { color: colors.textMuted }]}>Doc Registration: {scannedResult.doctorId}</Text>
                        
                        {scannedResult.extractedMeds.map((m: any, idx: number) => (
                          <View key={idx} style={[styles.extractedDrugRow, { borderBottomColor: colors.border }]}>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.drugNameText, { color: colors.text }]}>{m.name}</Text>
                              <Text style={[styles.drugDosageText, { color: colors.textMuted }]}>{m.dosage} ({m.duration})</Text>
                            </View>
                            <Text style={[styles.drugQty, { color: colors.primary }]}>{m.qty} Tabs</Text>
                          </View>
                        ))}

                        {/* Verification checklist */}
                        <View style={styles.verificationCheck}>
                          <ShieldAlert size={14} color={colors.accent} />
                          <Text style={[styles.verifyWarning, { color: colors.textMuted }]}>
                            {scannedResult.warningDetected}
                          </Text>
                        </View>

                        <View style={styles.scanActions}>
                          <TouchableOpacity 
                            style={[styles.discardBtn, { borderColor: colors.border }]}
                            onPress={() => setScannedResult(null)}
                          >
                            <Text style={{ color: colors.textMuted, fontSize: 12 }}>Retry Scan</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={[styles.importBtn, { backgroundColor: colors.primary }]}
                            onPress={importExtractedMedsToBill}
                          >
                            <Text style={styles.importBtnTxt}>Accept & Auto-Bill</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : null}
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={[styles.scanTriggerBtn, { backgroundColor: colors.primary }]}
                    onPress={() => simulateRxScan(rx.id)}
                  >
                    <Cpu size={16} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.scanTriggerTxt}>AI Scan Prescription</Text>
                  </TouchableOpacity>
                )}
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'refills' && (
          <View>
            <View style={styles.rxHeader}>
              <Text style={[styles.tabIntroTitle, { color: colors.text }]}> Auto-Refill Subscriptions</Text>
              <Text style={[styles.tabIntroSub, { color: colors.textMuted }]}>
                Track chronic disease medications for active students. Set schedule alerts, dispatch recurring medication, and contact patient directly.
              </Text>
            </View>

            {refills.map(refill => (
              <GlassCard key={refill.id} style={styles.refillCard}>
                <View style={styles.refillHeaderRow}>
                  <Image source={{ uri: refill.avatar }} style={styles.refillAvatar} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.refillStudent, { color: colors.text }]}>{refill.studentName}</Text>
                    <Text style={[styles.refillMed, { color: colors.accent }]}>Prescribed: {refill.medName}</Text>
                  </View>
                  <View style={[styles.daysLeftBadge, { backgroundColor: refill.daysLeft <= 2 ? colors.error + '20' : colors.surfaceLight }]}>
                    <Text style={[styles.daysLeftTxt, { color: refill.daysLeft <= 2 ? colors.error : colors.text }]}>
                      {refill.daysLeft} Days Left
                    </Text>
                  </View>
                </View>

                <View style={[styles.refillFooterRow, { borderTopColor: colors.border }]}>
                  <View>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>Auto Interval</Text>
                    <Text style={[styles.refillMetaVal, { color: colors.text }]}>{refill.interval}</Text>
                  </View>
                  
                  <View>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>Next Auto-Refill Date</Text>
                    <Text style={[styles.refillMetaVal, { color: colors.text }]}>{refill.nextDate}</Text>
                  </View>

                  <View style={styles.refillActions}>
                    <TouchableOpacity 
                      style={[styles.communicationBtn, { backgroundColor: colors.surfaceLight }]}
                      onPress={() => Share.share({ message: `Hi ${refill.studentName}, your recurring refill prescription for ${refill.medName} is due in ${refill.daysLeft} days. Shall we pack and dispatch? - KotaSeva Chemist` })}
                    >
                      <Phone size={14} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.dispatchBtn, { backgroundColor: colors.success }]}
                      onPress={() => {
                        const matchingMed = medicines.find(m => m.name.toLowerCase().includes(refill.medName.toLowerCase()));
                        if (matchingMed) {
                          addToCart(matchingMed);
                          setBillingStudent(refill.studentName);
                          setActiveTab('billing');
                          Alert.alert('POS Opened', `Refill order for ${refill.studentName} auto-loaded in Bill Checkout.`);
                        } else {
                          Alert.alert('Out of Stock', 'Unable to auto-bill. Medicine not found in current directory.');
                        }
                      }}
                    >
                      <Text style={styles.dispatchTxt}>Bill & Dispatch</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {activeTab === 'billing' && (
          <View>
            {checkoutReceipt ? (
              <GlassCard style={styles.receiptCard}>
                <View style={styles.receiptCheckIcon}>
                  <CheckCircle2 size={42} color={colors.success} />
                </View>
                <Text style={[styles.receiptMainTitle, { color: colors.text }]}>Medical POS Invoice Issued</Text>
                <Text style={[styles.receiptInvoice, { color: colors.textMuted }]}>Receipt {checkoutReceipt.invoiceId} • {checkoutReceipt.date}</Text>

                <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />

                <View style={styles.receiptDetails}>
                  <Text style={[styles.receiptLabel, { color: colors.textMuted }]}>Patient / Student Name</Text>
                  <Text style={[styles.receiptVal, { color: colors.text }]}>{checkoutReceipt.student}</Text>
                </View>

                <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />

                <Text style={[styles.receiptSubSection, { color: colors.text }]}>Dispensed Medicines</Text>
                {checkoutReceipt.items.map((item: any, idx: number) => (
                  <View key={idx} style={styles.receiptItem}>
                    <Text style={[styles.receiptItemName, { color: colors.text }]}>{item.name} x {item.qty}</Text>
                    <Text style={[styles.receiptItemPrice, { color: colors.text }]}>₹{item.price * item.qty}</Text>
                  </View>
                ))}

                <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />

                <View style={styles.receiptRowSummary}>
                  <Text style={{ color: colors.textMuted }}>Subtotal</Text>
                  <Text style={{ color: colors.text }}>₹{checkoutReceipt.subtotal}</Text>
                </View>
                {checkoutReceipt.discount > 0 && (
                  <View style={styles.receiptRowSummary}>
                    <Text style={{ color: colors.success }}>Student discount ({discountPercent}%)</Text>
                    <Text style={{ color: colors.success }}>-₹{checkoutReceipt.discount}</Text>
                  </View>
                )}
                {checkoutReceipt.credit > 0 && (
                  <View style={styles.receiptRowSummary}>
                    <Text style={{ color: colors.accent }}>Student Health Credit</Text>
                    <Text style={{ color: colors.accent }}>-₹{checkoutReceipt.credit}</Text>
                  </View>
                )}

                <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />

                <View style={styles.receiptTotalRow}>
                  <Text style={[styles.receiptTotalLabel, { color: colors.text }]}>Total Amount Paid</Text>
                  <Text style={[styles.receiptTotalVal, { color: colors.primary }]}>₹{checkoutReceipt.total}</Text>
                </View>

                {checkoutReceipt.paymentMode === 'UPI' && (
                  <View style={styles.upiContainer}>
                    <Image source={{ uri: checkoutReceipt.qrUrl }} style={styles.qrCodeImage} />
                    <Text style={[styles.upiLabel, { color: colors.textMuted }]}>Scan QR with any UPI App to Pay</Text>
                  </View>
                )}

                <TouchableOpacity 
                  style={[styles.printReceiptBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setCheckoutReceipt(null);
                    Alert.alert('Invoice Saved', 'Digital copy dispatched to patient health locker.');
                  }}
                >
                  <Text style={styles.printReceiptTxt}>Done & New Billing</Text>
                </TouchableOpacity>
              </GlassCard>
            ) : (
              <View>
                <View style={styles.rxHeader}>
                  <Text style={[styles.tabIntroTitle, { color: colors.text }]}> Digital Medical Billing & Checkout</Text>
                </View>

                <GlassCard style={styles.billingConfigCard}>
                  <View style={styles.inputContainer}>
                    <Text style={[styles.billingInputLabel, { color: colors.textMuted }]}>Patient (Student) Name</Text>
                    <TextInput
                      style={[styles.billingInput, { color: colors.text, borderColor: colors.border }]}
                      value={billingStudent}
                      onChangeText={setBillingStudent}
                    />
                  </View>

                  <View style={styles.formRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.billingInputLabel, { color: colors.textMuted }]}>Student Discount (%)</Text>
                      <TextInput
                        keyboardType="numeric"
                        style={[styles.billingInput, { color: colors.text, borderColor: colors.border }]}
                        value={discountPercent}
                        onChangeText={setDiscountPercent}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.billingInputLabel, { color: colors.textMuted }]}>Payment Method</Text>
                      <View style={styles.paymentSelector}>
                        {['Cash', 'UPI', 'Credit'].map(mode => (
                          <TouchableOpacity
                            key={mode}
                            style={[
                              styles.payModeBtn,
                              { backgroundColor: colors.surface, borderColor: colors.border },
                              paymentMode === mode && { backgroundColor: colors.primary, borderColor: colors.primary }
                            ]}
                            onPress={() => setPaymentMode(mode as any)}
                          >
                            <Text style={{ fontSize: 9, fontWeight: '700', color: paymentMode === mode ? '#FFF' : colors.textMuted }}>
                              {mode.toUpperCase()}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>

                  {/* Student Medical Credit PAUSABLE */}
                  <TouchableOpacity 
                    style={[
                      styles.creditCheckbox, 
                      { borderColor: colors.border },
                      billingCreditApplied && { backgroundColor: colors.accent + '15', borderColor: colors.accent }
                    ]}
                    onPress={() => setBillingCreditApplied(!billingCreditApplied)}
                  >
                    <View style={[styles.checkbox, { borderColor: colors.textMuted }, billingCreditApplied && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                      {billingCreditApplied && <Check size={10} color="#FFF" />}
                    </View>
                    <Text style={[styles.creditCheckLabel, { color: colors.text }]}>Apply Student Health Locker Credit (₹50 Available)</Text>
                  </TouchableOpacity>
                </GlassCard>

                {/* Cart list */}
                <Text style={[styles.sectionTitle, { color: colors.text, marginVertical: 12 }]}>Current Invoice Cart</Text>
                {billingCart.length === 0 ? (
                  <View style={styles.emptyCartBox}>
                    <AlertTriangle size={32} color={colors.textMuted} />
                    <Text style={[styles.emptyCartText, { color: colors.textMuted }]}>
                      Cart is empty. Tap "A-Z Meds" tab to add medicines, or use AI Prescription Scan.
                    </Text>
                  </View>
                ) : (
                  billingCart.map((item, idx) => (
                    <GlassCard key={idx} style={styles.cartItemCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.cartItemName, { color: colors.text }]}>{item.name}</Text>
                        <Text style={{ fontSize: 10, color: colors.textMuted }}>Salt: {item.salt}</Text>
                        <Text style={[styles.cartItemPriceLabel, { color: colors.text }]}>₹{item.price} per unit</Text>
                      </View>

                      <View style={styles.cartQtyControls}>
                        <TouchableOpacity 
                          style={styles.cartQtyBtn}
                          onPress={() => adjustCartQty(item.id, -1)}
                        >
                          <Minus size={12} color={colors.text} />
                        </TouchableOpacity>
                        
                        <Text style={[styles.cartQtyVal, { color: colors.text }]}>{item.qty}</Text>

                        <TouchableOpacity 
                          style={styles.cartQtyBtn}
                          onPress={() => adjustCartQty(item.id, 1)}
                        >
                          <Plus size={12} color={colors.text} />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity 
                        style={styles.cartDeleteBtn}
                        onPress={() => removeFromCart(item.id)}
                      >
                        <Trash2 size={16} color={colors.error} />
                      </TouchableOpacity>
                    </GlassCard>
                  ))
                )}

                {/* Billing Summary Box */}
                {billingCart.length > 0 && (
                  <GlassCard style={styles.billingSummaryCard}>
                    <View style={styles.summaryRow}>
                      <Text style={{ color: colors.textMuted }}>Subtotal</Text>
                      <Text style={{ color: colors.text }}>₹{calculateSubtotal()}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={{ color: colors.textMuted }}>Discount ({discountPercent}%)</Text>
                      <Text style={{ color: colors.success }}>-₹{(calculateSubtotal() * (parseFloat(discountPercent) || 0)) / 100}</Text>
                    </View>
                    {billingCreditApplied && (
                      <View style={styles.summaryRow}>
                        <Text style={{ color: colors.accent }}>Health Locker Credit</Text>
                        <Text style={{ color: colors.accent }}>-₹50</Text>
                      </View>
                    )}
                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryTotalLabel, { color: colors.text }]}>Net Total</Text>
                      <Text style={[styles.summaryTotalVal, { color: colors.primary }]}>₹{calculateTotal()}</Text>
                    </View>

                    <TouchableOpacity 
                      style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
                      onPress={handleCheckout}
                    >
                      <Check size={18} color="#FFF" style={{ marginRight: 6 }} />
                      <Text style={styles.checkoutBtnTxt}>Generate Receipt & Charge UPI</Text>
                    </TouchableOpacity>
                  </GlassCard>
                )}
              </View>
            )}
          </View>
        )}

        {activeTab === 'checker' && (
          <View>
            <View style={styles.rxHeader}>
              <Text style={[styles.tabIntroTitle, { color: colors.text }]}> AI Drug Contraindication Checker</Text>
              <Text style={[styles.tabIntroSub, { color: colors.textMuted }]}>
                A professional diagnostic assistant for chemists. Enter two active chemical compound ingredients to quickly evaluate risks of combination therapies.
              </Text>
            </View>

            <GlassCard style={styles.checkerCard}>
              <View style={styles.checkerInputRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.checkerInputLabel, { color: colors.textMuted }]}>Drug / Salt A</Text>
                  <TextInput
                    placeholder="e.g. Paracetamol"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.checkerInput, { color: colors.text, borderColor: colors.border }]}
                    value={drugA}
                    onChangeText={setDrugA}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.checkerInputLabel, { color: colors.textMuted }]}>Drug / Salt B</Text>
                  <TextInput
                    placeholder="e.g. Alcohol / Ibuprofen"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.checkerInput, { color: colors.text, borderColor: colors.border }]}
                    value={drugB}
                    onChangeText={setDrugB}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.runCheckBtn, { backgroundColor: colors.primary }]}
                onPress={handleCheckInteractions}
                disabled={isCheckingInteractions}
              >
                {isCheckingInteractions ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <View style={styles.flexRow}>
                    <Cpu size={16} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.runCheckTxt}>Diagnose Contraindications</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Interaction Diagnostic Results Output */}
              {interactionResult && (
                <View style={[styles.resultCard, { borderColor: interactionResult.color }]}>
                  <View style={styles.resultHeader}>
                    <ShieldAlert size={18} color={interactionResult.color} />
                    <Text style={[styles.resultSeverity, { color: interactionResult.color }]}>
                      {interactionResult.severity.toUpperCase()}
                    </Text>
                  </View>

                  <Text style={[styles.resultTitle, { color: colors.text }]}>{interactionResult.contraindication}</Text>
                  
                  <View style={[styles.resultDividerLine, { backgroundColor: colors.border }]} />

                  <Text style={[styles.resultHeading, { color: colors.text }]}>Clinical Risk Profile</Text>
                  <Text style={[styles.resultDescription, { color: colors.textMuted }]}>{interactionResult.risk}</Text>

                  <Text style={[styles.resultHeading, { color: colors.text, marginTop: 12 }]}>Pharmacist Action Plan</Text>
                  <Text style={[styles.resultDescription, { color: colors.textMuted }]}>{interactionResult.recommendation}</Text>
                </View>
              )}
            </GlassCard>
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
            { id: 'directory', label: 'A-Z Meds', icon: Pill },
            { id: 'rx', label: 'RX Hub', icon: FileText },
            { id: 'refills', label: 'Auto-Refills', icon: Clock },
            { id: 'billing', label: 'POS Bill', icon: Calculator },
            { id: 'checker', label: 'AI Checker', icon: Cpu },
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


const styles = StyleSheet.create({
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
  addMedicineBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  categoriesScroll: {
    paddingBottom: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
  },
  addMedFormCard: {
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
  warningChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 4,
  },
  rxToggle: {
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
  },
  submitMedBtn: {
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitMedTxt: {
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
  medCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  medMainInfo: {
    marginBottom: 8,
  },
  medBadgeHolder: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  warningBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  warningText: {
    fontSize: 9,
    fontWeight: '900',
  },
  rxReqBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    justifyContent: 'center',
  },
  rxReqTxt: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
  medBrand: {
    fontSize: 16,
    fontWeight: '800',
  },
  medSalt: {
    fontSize: 11,
    marginTop: 2,
  },
  medMetadataRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  metaLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  medActionPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  priceContainer: {
    justifyContent: 'center',
  },
  priceTag: {
    fontSize: 17,
    fontWeight: '800',
  },
  stockOperator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stockBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockValBox: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  stockVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  lowStockAlert: {
    fontSize: 7,
    fontWeight: '900',
    color: '#EF4444',
  },
  directBillBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rxHeader: {
    marginBottom: 16,
  },
  tabIntroTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  tabIntroSub: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  rxCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  rxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rxPreviewImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#0F172A',
  },
  rxInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  rxStudent: {
    fontSize: 15,
    fontWeight: '800',
  },
  rxSubText: {
    fontSize: 11,
  },
  rxStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  scanTriggerBtn: {
    flexDirection: 'row',
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  scanTriggerTxt: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  aiScanContainer: {
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  scanningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  scanningTxt: {
    fontSize: 12,
  },
  scannedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  scannedTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  doctorText: {
    fontSize: 10,
    marginBottom: 8,
  },
  extractedDrugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  drugNameText: {
    fontSize: 12,
    fontWeight: '700',
  },
  drugDosageText: {
    fontSize: 10,
    marginTop: 1,
  },
  drugQty: {
    fontSize: 12,
    fontWeight: '800',
  },
  verificationCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderRadius: 6,
    padding: 6,
    marginTop: 8,
    gap: 6,
  },
  verifyWarning: {
    fontSize: 9,
    flex: 1,
  },
  scanActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  discardBtn: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  importBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  importBtnTxt: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  refillCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
  },
  refillHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refillAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  refillStudent: {
    fontSize: 14,
    fontWeight: '800',
  },
  refillMed: {
    fontSize: 11,
    marginTop: 1,
  },
  daysLeftBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  daysLeftTxt: {
    fontSize: 10,
    fontWeight: '900',
  },
  refillFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 12,
  },
  refillMetaVal: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  refillActions: {
    flexDirection: 'row',
    gap: 6,
  },
  communicationBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dispatchBtn: {
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dispatchTxt: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  receiptCard: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  receiptCheckIcon: {
    marginBottom: 8,
  },
  receiptMainTitle: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  receiptInvoice: {
    fontSize: 11,
    marginTop: 2,
  },
  receiptDivider: {
    width: '100%',
    height: 1,
    marginVertical: 12,
    opacity: 0.1,
  },
  receiptDetails: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptLabel: {
    fontSize: 12,
  },
  receiptVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  receiptSubSection: {
    fontSize: 12,
    fontWeight: '800',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  receiptItem: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  receiptItemName: {
    fontSize: 11,
  },
  receiptItemPrice: {
    fontSize: 11,
    fontWeight: '700',
  },
  receiptRowSummary: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  receiptTotalRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptTotalLabel: {
    fontSize: 14,
    fontWeight: '900',
  },
  receiptTotalVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  upiContainer: {
    marginTop: 16,
    alignItems: 'center',
    gap: 6,
  },
  qrCodeImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  upiLabel: {
    fontSize: 10,
  },
  printReceiptBtn: {
    width: '100%',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  printReceiptTxt: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  billingConfigCard: {
    padding: 14,
    borderRadius: 16,
    gap: 10,
    marginBottom: 12,
  },
  inputContainer: {
    width: '100%',
  },
  billingInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  billingInput: {
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  paymentSelector: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    height: 38,
  },
  payModeBtn: {
    flex: 1,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditCheckLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyCartBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyCartText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  cartItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 14,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '700',
  },
  cartItemPriceLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  cartQtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 12,
  },
  cartQtyBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartQtyVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  cartDeleteBtn: {
    padding: 4,
  },
  billingSummaryCard: {
    padding: 14,
    borderRadius: 16,
    marginTop: 16,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 4,
    opacity: 0.1,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '900',
  },
  summaryTotalVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  checkoutBtn: {
    flexDirection: 'row',
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  checkoutBtnTxt: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  checkerCard: {
    padding: 16,
    borderRadius: 16,
  },
  checkerInputRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  checkerInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  checkerInput: {
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  runCheckBtn: {
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  runCheckTxt: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultCard: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  resultSeverity: {
    fontSize: 12,
    fontWeight: '900',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  resultDividerLine: {
    height: 1,
    marginVertical: 10,
    opacity: 0.1,
  },
  resultHeading: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 2,
  },
  resultDescription: {
    fontSize: 11,
    lineHeight: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
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
