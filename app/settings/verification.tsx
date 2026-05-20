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
  Image 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  ShieldCheck, 
  UploadCloud, 
  CheckCircle, 
  ChevronRight, 
  ArrowLeft, 
  CreditCard, 
  UserCheck, 
  Building, 
  FileText, 
  Camera 
} from 'lucide-react-native';
import { Spacing, Typography, Colors } from '@/constants/Theme';
import { getGlobalStyles } from '@/constants/GlobalStyles';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

export default function VerificationScreen() {
  const { colors, t } = useApp();
  const router = useRouter();
  const gStyles = getGlobalStyles(colors);
  const styles = getStyles(colors, gStyles);

  // Wizard state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [gstin, setGstin] = useState('');
  
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [uploadedPan, setUploadedPan] = useState(false);
  const [uploadedAadhaar, setUploadedAadhaar] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<'pan' | 'aadhaar' | null>(null);

  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');

  // Status
  const [verificationStatus, setVerificationStatus] = useState('unverified');

  useEffect(() => {
    async function loadVerificationState() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('merchants')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') throw error;
          if (data) {
            setProfile(data);
            setBusinessName(data.business_name || '');
            setBusinessType(data.business_type || '');
            setVerificationStatus(data.verification_status || 'unverified');
            setPanNumber(data.pan_number || '');
            setAadhaarNumber(data.aadhaar_number || '');
            setUpiId(data.upi_id || '');
            if (data.pan_number) setUploadedPan(true);
            if (data.aadhaar_number) setUploadedAadhaar(true);
          }
        }
      } catch (err: any) {
        console.warn("Could not load verification state:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadVerificationState();
  }, []);

  const simulateUpload = (type: 'pan' | 'aadhaar') => {
    setUploadingDoc(type);
    setTimeout(() => {
      setUploadingDoc(null);
      if (type === 'pan') setUploadedPan(true);
      if (type === 'aadhaar') setUploadedAadhaar(true);
      Alert.alert("Success", `${type.toUpperCase()} document uploaded successfully.`);
    }, 1500);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!businessName.trim() || !businessType.trim()) {
        Alert.alert("Required Fields", "Please complete your business profile name and category.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!panNumber.trim() || !aadhaarNumber.trim() || !uploadedPan || !uploadedAadhaar) {
        Alert.alert("Required KYC", "Please enter document details and upload copies to verify.");
        return;
      }
      setStep(3);
    }
  };

  const handleSubmitKYC = async () => {
    if (!upiId.trim() && !bankAccount.trim()) {
      Alert.alert("Payment Info Required", "Please fill in either your UPI ID or Bank Account for order payouts.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && profile) {
        const { error } = await supabase
          .from('merchants')
          .update({
            business_name: businessName.trim(),
            pan_number: panNumber.trim(),
            aadhaar_number: aadhaarNumber.trim(),
            upi_id: upiId.trim(),
            verification_status: 'pending'
          })
          .eq('id', profile.id);

        if (error) throw error;
        setVerificationStatus('pending');
        setStep(4);
      } else {
        setVerificationStatus('pending');
        setStep(4);
      }
    } catch (err: any) {
      Alert.alert("Submission Failed", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Demo tool to instantly approve KYC verification
  const handleInstantApprove = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && profile) {
        const { error } = await supabase
          .from('merchants')
          .update({
            verification_status: 'verified',
            is_verified: true
          })
          .eq('id', profile.id);

        if (error) throw error;
        setVerificationStatus('verified');
        Alert.alert("Verified!", "Your account has been instantly approved. The verification badge is now active.");
      } else {
        setVerificationStatus('verified');
        Alert.alert("Demo Mode", "Verified status simulated successfully.");
      }
    } catch (err: any) {
      Alert.alert("Approval Failed", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'KYC & Verification' }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Verification Status Header */}
        <GlassCard style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <ShieldCheck size={36} color={
              verificationStatus === 'verified' ? '#10B981' : 
              verificationStatus === 'pending' ? '#F59E0B' : colors.textMuted
            } />
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusTitle, { color: colors.text }]}>
                {verificationStatus === 'verified' ? 'Account Verified' : 
                 verificationStatus === 'pending' ? 'Verification Pending' : 'Get Verified'}
              </Text>
              <Text style={[styles.statusSub, { color: colors.textMuted }]}>
                {verificationStatus === 'verified' ? 'Enjoy lower commission cuts & priority listings.' : 
                 verificationStatus === 'pending' ? 'Your details are under administrative review.' : 
                 'Complete onboarding KYC to receive the verified merchant badge.'}
              </Text>
            </View>
          </View>
        </GlassCard>

        {verificationStatus === 'unverified' && (
          <View>
            {/* Step Progress Indicators */}
            <View style={styles.stepsRow}>
              {[1, 2, 3].map((s) => (
                <View key={s} style={{ flex: 1, alignItems: 'center' }}>
                  <View style={[
                    styles.stepBubble, 
                    { 
                      backgroundColor: step >= s ? colors.primary : colors.surface,
                      borderColor: step >= s ? colors.primary : colors.border
                    }
                  ]}>
                    <Text style={{ color: step >= s ? '#FFF' : colors.textMuted, fontWeight: 'bold' }}>{s}</Text>
                  </View>
                  <Text style={[styles.stepLabel, { color: step >= s ? colors.text : colors.textMuted }]}>
                    {s === 1 ? 'Business' : s === 2 ? 'Documents' : 'Payouts'}
                  </Text>
                </View>
              ))}
            </View>

            {/* STEP 1: Business profile details */}
            {step === 1 && (
              <View style={styles.formContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Business Registration Name *</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  value={businessName}
                  onChangeText={setBusinessName}
                  placeholder="Legal Entity Name"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={[styles.label, { color: colors.text }]}>Business Category *</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  value={businessType}
                  onChangeText={setBusinessType}
                  placeholder="e.g. Tuition, Laundry, Cab, Chemist"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={[styles.label, { color: colors.text }]}>GSTIN (Optional)</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  value={gstin}
                  onChangeText={setGstin}
                  placeholder="15-digit GST Number"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                  maxLength={15}
                />

                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={handleNextStep}>
                  <Text style={styles.actionBtnText}>Continue to Documents</Text>
                  <ChevronRight size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 2: Document upload */}
            {step === 2 && (
              <View style={styles.formContainer}>
                <TouchableOpacity style={styles.backLink} onPress={() => setStep(1)}>
                  <ArrowLeft size={16} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Back to Profile</Text>
                </TouchableOpacity>

                <Text style={[styles.label, { color: colors.text }]}>PAN Card Number *</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  value={panNumber}
                  onChangeText={setPanNumber}
                  placeholder="e.g. ABCDE1234F"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                  maxLength={10}
                />

                <Text style={[styles.label, { color: colors.text }]}>Upload PAN Image *</Text>
                <TouchableOpacity 
                  style={[styles.uploadBox, { borderColor: colors.border, backgroundColor: colors.surface }]}
                  onPress={() => simulateUpload('pan')}
                  disabled={uploadingDoc !== null}
                >
                  {uploadingDoc === 'pan' ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : uploadedPan ? (
                    <View style={styles.uploadedRow}>
                      <CheckCircle size={20} color="#10B981" />
                      <Text style={{ color: '#10B981', fontWeight: 'bold' }}>PAN Card Attached</Text>
                    </View>
                  ) : (
                    <View style={styles.uploadInner}>
                      <UploadCloud size={24} color={colors.primary} />
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>Tap to scan/upload PAN card</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={[styles.label, { color: colors.text, marginTop: 12 }]}>Aadhaar Card Number *</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  value={aadhaarNumber}
                  onChangeText={setAadhaarNumber}
                  placeholder="12-digit Aadhaar Card"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={12}
                />

                <Text style={[styles.label, { color: colors.text }]}>Upload Aadhaar Card Image *</Text>
                <TouchableOpacity 
                  style={[styles.uploadBox, { borderColor: colors.border, backgroundColor: colors.surface }]}
                  onPress={() => simulateUpload('aadhaar')}
                  disabled={uploadingDoc !== null}
                >
                  {uploadingDoc === 'aadhaar' ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : uploadedAadhaar ? (
                    <View style={styles.uploadedRow}>
                      <CheckCircle size={20} color="#10B981" />
                      <Text style={{ color: '#10B981', fontWeight: 'bold' }}>Aadhaar Card Attached</Text>
                    </View>
                  ) : (
                    <View style={styles.uploadInner}>
                      <UploadCloud size={24} color={colors.primary} />
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>Tap to scan/upload Aadhaar Card</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary, marginTop: 20 }]} onPress={handleNextStep}>
                  <Text style={styles.actionBtnText}>Continue to Settlement</Text>
                  <ChevronRight size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 3: settlement bank details */}
            {step === 3 && (
              <View style={styles.formContainer}>
                <TouchableOpacity style={styles.backLink} onPress={() => setStep(2)}>
                  <ArrowLeft size={16} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Back to Documents</Text>
                </TouchableOpacity>

                <Text style={[styles.label, { color: colors.text }]}>UPI Payout Address (ID) *</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  value={upiId}
                  onChangeText={setUpiId}
                  placeholder="e.g. merchant@okhdfcbank"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />

                <View style={styles.payoutOptionDivider}>
                  <View style={[styles.line, { backgroundColor: colors.border }]} />
                  <Text style={{ color: colors.textMuted, fontSize: 10, marginHorizontal: 8 }}>OR BANK ACCOUNT</Text>
                  <View style={[styles.line, { backgroundColor: colors.border }]} />
                </View>

                <Text style={[styles.label, { color: colors.text }]}>Bank Account Number</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  value={bankAccount}
                  onChangeText={setBankAccount}
                  placeholder="Account Number"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                />

                <Text style={[styles.label, { color: colors.text }]}>IFSC Code</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  value={bankIfsc}
                  onChangeText={setBankIfsc}
                  placeholder="Bank IFSC Code"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                />

                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: colors.accent }]} 
                  onPress={handleSubmitKYC}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Text style={styles.actionBtnText}>Submit Documents for Verification</Text>
                      <CheckCircle size={18} color="#FFF" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* STEP 4 / STATUS: Pending Review state */}
        {verificationStatus === 'pending' && (
          <View style={styles.centerContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=500&q=80' }} 
              style={styles.reviewImage} 
            />
            <Text style={[styles.reviewTitle, { color: colors.text }]}>Under Review</Text>
            <Text style={[styles.reviewSub, { color: colors.textMuted }]}>
              Our administrators are cross-referencing your Aadhaar ID and business registration to activate your account.
            </Text>

            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#10B981', marginTop: 30 }]} 
              onPress={handleInstantApprove}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Text style={styles.actionBtnText}>Instant Auto-Approve (Demo Mode)</Text>
                  <ShieldCheck size={18} color="#FFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Status: Verified */}
        {verificationStatus === 'verified' && (
          <View style={styles.centerContainer}>
            <View style={[styles.verifiedCircle, { backgroundColor: '#10B981' }]}>
              <CheckCircle size={60} color="#FFF" />
            </View>
            <Text style={[styles.reviewTitle, { color: colors.text }]}>Verification Approved!</Text>
            <Text style={[styles.reviewSub, { color: colors.textMuted }]}>
              Your KYC document validation has been approved. You now hold active Verified Status and a blue checkmark badge next to your business name.
            </Text>
            
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.primary, marginTop: 30 }]} 
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.actionBtnText}>Go to Dashboard</Text>
              <ChevronRight size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any, gStyles: any) => StyleSheet.create({
  container: gStyles.container,
  scrollContent: gStyles.scrollContent,
  statusCard: {
    ...gStyles.glassCard,
    marginBottom: Spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  statusSub: {
    ...gStyles.descriptionText,
    marginTop: 4,
    lineHeight: 14,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing.lg,
    paddingHorizontal: 20,
  },
  stepBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  formContainer: {
    gap: 14,
  },
  label: gStyles.inputLabel,
  input: gStyles.input,
  uploadBox: {
    height: 90,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadInner: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  uploadedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  payoutOptionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  line: {
    flex: 1,
    height: 1,
  },
  actionBtn: {
    ...gStyles.primaryButton,
    marginTop: 10,
  },
  actionBtnText: gStyles.primaryButtonText,
  centerContainer: gStyles.centerContainer,
  reviewImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 20,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  reviewSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  verifiedCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
});
