import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions, Share } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Shield, Check, IndianRupee, Sparkles, AlertCircle, Percent, ArrowUpRight, TrendingUp, HelpCircle, Eye, AlertTriangle, Play, CheckCircle } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Bronze (Free)',
    price: '₹0',
    duration: 'Forever',
    commission: 10,
    visibility: '15% Local Index',
    leadsDelay: '2 Hour Delay',
    pros: [
      'Unlocks Kirana & Stationery Hubs',
      'Receive student leads via manual catalog search',
      'Zero monthly membership fees',
    ],
    cons: [
      '10% Platform fee per order',
      'Delayed lead notifications',
      'Ranked at the bottom of student searches',
    ],
    accent: '#CD7F32',
  },
  {
    id: 'silver',
    name: 'Silver (Grow)',
    price: '₹499',
    duration: 'month',
    commission: 5,
    visibility: '60% Search Boost',
    leadsDelay: '5 Minute Delay',
    pros: [
      'Unlocks 6 Core Business Hubs',
      'Receive real-time high-intent student leads',
      'Lower Platform fee (5% per order)',
      'WhatsApp automated response template',
      'Standard search result indexing',
    ],
    cons: [
      'Requires monthly subscription fee',
      'Does not unlock premium AI growth features',
    ],
    accent: '#C0C0C0',
    popular: true,
  },
  {
    id: 'gold',
    name: 'Gold (Elite)',
    price: '₹1,499',
    duration: 'month',
    commission: 0,
    visibility: '100% Featured Boost',
    leadsDelay: 'Instant (No Delay)',
    pros: [
      'Unlocks all 17+ specialized business hubs',
      'Zero Commission (Keep 100% of order value)',
      'Featured verified partner badge',
      'First search result priority inside hostels',
      'AI-powered automatic note/repairs manager chatbot',
    ],
    cons: [
      'Highest subscription tier cost',
    ],
    accent: '#FFD700',
  },
];

export default function BillingPlansScreen() {
  const { colors, theme } = useApp();
  const styles = getStyles(colors);
  const router = useRouter();
  
  const [activePlan, setActivePlan] = useState<'free' | 'silver' | 'gold'>('silver');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'trial' | 'expired'>('active');
  const [calcOrderAmount, setCalcOrderAmount] = useState('2500');
  const [activeTab, setActiveTab] = useState<'merchant' | 'owner' | 'onboarding'>('merchant');

  // Simulator splits
  const currentCommissionPct = subscriptionStatus === 'expired' ? 15 : (SUBSCRIPTION_PLANS.find(p => p.id === activePlan)?.commission ?? 5);
  const orderVal = parseFloat(calcOrderAmount) || 0;
  const appOwnerCut = (orderVal * currentCommissionPct) / 100;
  const merchantTakeHome = orderVal - appOwnerCut;

  const handleSubscribe = (planId: string, planName: string) => {
    Alert.alert(
      "Confirm Subscription Upgrade",
      `Would you like to subscribe to the ${planName} Plan?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Proceed Payment", 
          onPress: () => {
            setActivePlan(planId as any);
            setSubscriptionStatus('active');
            Alert.alert("Subscription Active", `You are now subscribed to the ${planName} Plan! Enjoy customized order commissions.`);
          } 
        }
      ]
    );
  };

  const startFreeTrial = () => {
    setSubscriptionStatus('trial');
    setActivePlan('gold');
    Alert.alert(
      " 14-Day Free Trial Activated!",
      "You now have access to Gold Tier features for 14 days. Zero commission, top search priority, and all 17+ business hubs unlocked!"
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ title: 'Subscription & Commissions' }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Toggle Hub View */}
        <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity 
            onPress={() => setActiveTab('merchant')}
            style={[styles.tab, activeTab === 'merchant' && { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.tabText, { color: activeTab === 'merchant' ? '#FFF' : colors.textMuted }]}>Merchant Plans</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('owner')}
            style={[styles.tab, activeTab === 'owner' && { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.tabText, { color: activeTab === 'owner' ? '#FFF' : colors.textMuted }]}>Owner Ledger</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('onboarding')}
            style={[styles.tab, activeTab === 'onboarding' && { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.tabText, { color: activeTab === 'onboarding' ? '#FFF' : colors.textMuted }]}>Signup Trial</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Status Simulator Controls */}
        <Text style={[styles.controlLabel, { color: colors.textMuted }]}>SIMULATE STATUS ON STUDENT DIRECTORY:</Text>
        <View style={[styles.statusToggleContainer, { borderColor: colors.border, backgroundColor: colors.surfaceLight }]}>
          <TouchableOpacity 
            onPress={() => setSubscriptionStatus('active')}
            style={[styles.statusBtn, subscriptionStatus === 'active' && { backgroundColor: Colors.success }]}
          >
            <CheckCircle size={14} color="#FFF" />
            <Text style={[styles.statusBtnTxt, { color: subscriptionStatus === 'active' ? '#FFF' : colors.text }]}>Active</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setSubscriptionStatus('trial')}
            style={[styles.statusBtn, subscriptionStatus === 'trial' && { backgroundColor: colors.primary }]}
          >
            <Sparkles size={14} color="#FFF" />
            <Text style={[styles.statusBtnTxt, { color: subscriptionStatus === 'trial' ? '#FFF' : colors.text }]}>Free Trial</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setSubscriptionStatus('expired')}
            style={[styles.statusBtn, subscriptionStatus === 'expired' && { backgroundColor: colors.error }]}
          >
            <AlertTriangle size={14} color="#FFF" />
            <Text style={[styles.statusBtnTxt, { color: subscriptionStatus === 'expired' ? '#FFF' : colors.text }]}>Expired</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Status Banner Card */}
        {subscriptionStatus === 'active' && (
          <GlassCard style={[styles.statusBanner, { borderColor: 'rgba(16, 185, 129, 0.2)', backgroundColor: 'rgba(16, 185, 129, 0.05)' }]}>
            <View style={styles.statusBannerHeader}>
              <CheckCircle size={20} color={Colors.success} />
              <Text style={[styles.statusBannerTitle, { color: colors.text }]}>Subscription Active</Text>
            </View>
            <Text style={[styles.statusBannerDesc, { color: colors.textMuted }]}>
              All systems nominal! Your shop has **{activePlan === 'gold' ? 'Featured priority visibility' : 'Standard search indexing'}** on the student application. Commissions are locked in at **{currentCommissionPct}%**.
            </Text>
          </GlassCard>
        )}

        {subscriptionStatus === 'trial' && (
          <GlassCard style={[styles.statusBanner, { borderColor: 'rgba(99, 102, 241, 0.2)', backgroundColor: 'rgba(99, 102, 241, 0.05)' }]}>
            <View style={styles.statusBannerHeader}>
              <Sparkles size={20} color={colors.primary} />
              <Text style={[styles.statusBannerTitle, { color: colors.text }]}>14-Day Free Trial (Gold Tier)</Text>
            </View>
            <Text style={[styles.statusBannerDesc, { color: colors.textMuted }]}>
              Enjoy **100% Featured visibility boost**! You have **11 days remaining** on your free test trial. Platform order cuts are currently set to **0%**.
            </Text>
          </GlassCard>
        )}

        {subscriptionStatus === 'expired' && (
          <GlassCard style={[styles.statusBanner, { borderColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }]}>
            <View style={styles.statusBannerHeader}>
              <AlertTriangle size={20} color={colors.error} />
              <Text style={[styles.statusBannerTitle, { color: colors.text }]}>Subscription Suspended / Expired</Text>
            </View>
            <Text style={[styles.statusBannerDesc, { color: colors.textMuted }]}>
               **Student Directory Visibility Restricted!** Your business is currently hidden from student searches. Delayed student leads are disabled and platform commissions are raised to a penalty tier of **15%**. Renew now to restore services.
            </Text>
          </GlassCard>
        )}

        {activeTab === 'merchant' && (
          <View style={styles.fadeContainer}>
            {/* Header */}
            <View style={styles.headerArea}>
              <Text style={[styles.subHeading, { color: colors.primary }]}>CHOOSE YOUR TIER</Text>
              <Text style={[styles.mainHeading, { color: colors.text }]}>Merchant Pricing Model</Text>
              <Text style={[styles.descText, { color: colors.textMuted }]}>
                Choose between subscription funding or a simple order commission cut. Subscribed merchants pocket up to 100% of student orders!
              </Text>
            </View>

            {/* Plans List */}
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isActive = activePlan === plan.id && subscriptionStatus !== 'expired';
              return (
                <GlassCard 
                  key={plan.id} 
                  style={[
                    styles.planCard, 
                    isActive && { borderColor: colors.primary, borderWidth: 1.5 }
                  ]}
                >
                  {plan.popular && (
                    <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                      <Sparkles size={10} color="#FFF" />
                      <Text style={styles.popularTxt}>MOST POPULAR</Text>
                    </View>
                  )}

                  <View style={styles.planHeader}>
                    <View>
                      <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
                      <Text style={[styles.planCommission, { color: plan.commission === 0 ? Colors.success : colors.textMuted }]}>
                        {plan.commission === 0 ? 'Zero Order Cut' : `${plan.commission}% commission cut`}
                      </Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.planPrice, { color: colors.text }]}>{plan.price}</Text>
                      <Text style={[styles.planDuration, { color: colors.textMuted }]}>/{plan.duration}</Text>
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  {/* Visual Stats HUD */}
                  <View style={[styles.statsHud, { backgroundColor: colors.surface }]}>
                    <View style={styles.statHudCol}>
                      <Text style={[styles.hudLabel, { color: colors.textMuted }]}>STUDENT VISIBILITY</Text>
                      <Text style={[styles.hudValue, { color: colors.primary }]}>{plan.visibility}</Text>
                    </View>
                    <View style={styles.statHudDivider} />
                    <View style={styles.statHudCol}>
                      <Text style={[styles.hudLabel, { color: colors.textMuted }]}>LEAD ALERT DELAY</Text>
                      <Text style={[styles.hudValue, { color: colors.text }]}>{plan.leadsDelay}</Text>
                    </View>
                  </View>

                  {/* Pros Section */}
                  <View style={styles.prosContainer}>
                    <Text style={[styles.prosTitle, { color: colors.text }]}>PROS:</Text>
                    {plan.pros.map((p, idx) => (
                      <View key={idx} style={styles.featRow}>
                        <Check size={12} color={Colors.success} />
                        <Text style={[styles.featText, { color: colors.text }]}>{p}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Cons Section */}
                  <View style={styles.consContainer}>
                    <Text style={[styles.consTitle, { color: colors.text }]}>LIMITATIONS:</Text>
                    {plan.cons.map((c, idx) => (
                      <View key={idx} style={styles.featRow}>
                        <AlertCircle size={12} color={colors.error} />
                        <Text style={[styles.featText, { color: colors.textMuted }]}>{c}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity 
                    style={[
                      styles.actionBtn, 
                      isActive ? { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: colors.border, borderWidth: 1 } : { backgroundColor: colors.primary }
                    ]}
                    onPress={() => handleSubscribe(plan.id, plan.name)}
                  >
                    <Text style={[styles.actionBtnText, { color: isActive ? colors.text : '#FFF' }]}>
                      {isActive ? 'Your Current Active Plan' : `Subscribe to ${plan.name}`}
                    </Text>
                  </TouchableOpacity>
                </GlassCard>
              );
            })}

            {/* Interactive Commission Simulator */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Commission Simulator</Text>
            <GlassCard style={styles.simCard}>
              <View style={styles.simInputRow}>
                <View style={styles.simLabelCol}>
                  <Text style={[styles.simInputLabel, { color: colors.text }]}>Mock Order Amount</Text>
                  <Text style={[styles.simInputSub, { color: colors.textMuted }]}>Simulate student checkout orders</Text>
                </View>
                <View style={[styles.amountInputContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <IndianRupee size={16} color={colors.textMuted} />
                  <TextInput
                    style={[styles.amountInput, { color: colors.text }]}
                    keyboardType="numeric"
                    value={calcOrderAmount}
                    onChangeText={setCalcOrderAmount}
                  />
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 16 }]} />

              <View style={styles.simResults}>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.textMuted }]}>Platform Fee ({currentCommissionPct}% Cut)</Text>
                  <Text style={[styles.resultValue, { color: colors.error, fontWeight: '700' }]}>- ₹{appOwnerCut.toFixed(2)}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.textMuted }]}>Merchant Take-home Payout</Text>
                  <Text style={[styles.resultValue, { color: Colors.success, fontWeight: '900', fontSize: 18 }]}>₹{merchantTakeHome.toFixed(2)}</Text>
                </View>
              </View>
            </GlassCard>
          </View>
        )}

        {activeTab === 'owner' && (
          <View style={styles.fadeContainer}>
            {/* Header */}
            <View style={styles.headerArea}>
              <Text style={[styles.subHeading, { color: colors.primary }]}>PLATFORM REVENUE</Text>
              <Text style={[styles.mainHeading, { color: colors.text }]}>Owner Earnings Ledger</Text>
              <Text style={[styles.descText, { color: colors.textMuted }]}>
                Live tracking log of platform commission cuts and subscription receipts credited to the SevaStack admin wallet.
              </Text>
            </View>

            {/* Simulated Balance Card */}
            <GlassCard style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <View>
                  <Text style={[styles.balanceTitle, { color: 'rgba(255,255,255,0.6)' }]}>Platform Balance</Text>
                  <Text style={styles.balanceVal}>₹48,930.50</Text>
                </View>
                <View style={styles.balanceIcon}>
                  <TrendingUp size={24} color="#FFF" />
                </View>
              </View>
              <View style={styles.balanceMeta}>
                <View>
                  <Text style={styles.metaLabel}>Subs Received</Text>
                  <Text style={styles.metaVal}>₹24,980</Text>
                </View>
                <View style={styles.metaDiv} />
                <View>
                  <Text style={styles.metaLabel}>Order Commission Cuts</Text>
                  <Text style={styles.metaVal}>₹23,950</Text>
                </View>
              </View>
            </GlassCard>

            {/* Earnings Transactions */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Platform Credits</Text>
            
            <GlassCard style={styles.ledgerList}>
              <View style={styles.ledgerRow}>
                <View>
                  <Text style={[styles.ledgerMerchant, { color: colors.text }]}>Agarwal Kirana (Free Tier)</Text>
                  <Text style={[styles.ledgerMeta, { color: colors.textMuted }]}>Order #5422 • 10% Cut of ₹1,200</Text>
                </View>
                <Text style={[styles.ledgerCredit, { color: Colors.success }]}>+ ₹120.00</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.ledgerRow}>
                <View>
                  <Text style={[styles.ledgerMerchant, { color: colors.text }]}>Seva Laundry (Silver Tier)</Text>
                  <Text style={[styles.ledgerMeta, { color: colors.textMuted }]}>Order #5419 • 5% Cut of ₹450</Text>
                </View>
                <Text style={[styles.ledgerCredit, { color: Colors.success }]}>+ ₹22.50</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.ledgerRow}>
                <View>
                  <Text style={[styles.ledgerMerchant, { color: colors.text }]}>City Cab Kota (Gold Tier)</Text>
                  <Text style={[styles.ledgerMeta, { color: colors.textMuted }]}>Order #5408 • 0% Cut (Zero Cut)</Text>
                </View>
                <Text style={[styles.ledgerCredit, { color: colors.textMuted }]}>₹0.00</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.ledgerRow}>
                <View>
                  <Text style={[styles.ledgerMerchant, { color: colors.text }]}>Kota Stationery Hub</Text>
                  <Text style={[styles.ledgerMeta, { color: colors.textMuted }]}>Silver Subscription Renewal</Text>
                </View>
                <Text style={[styles.ledgerCredit, { color: Colors.success }]}>+ ₹499.00</Text>
              </View>
            </GlassCard>
          </View>
        )}

        {activeTab === 'onboarding' && (
          <View style={styles.fadeContainer}>
            {/* Header */}
            <View style={styles.headerArea}>
              <Text style={[styles.subHeading, { color: colors.primary }]}>SIGNUP EXPERIENCE</Text>
              <Text style={[styles.mainHeading, { color: colors.text }]}>Merchant Onboarding Trial</Text>
              <Text style={[styles.descText, { color: colors.textMuted }]}>
                New merchants registering inside Kota are welcomed with a 14-day premium trial. Rest easy, try out all specialized business tools first!
              </Text>
            </View>

            {/* Simulated Onboarding Card */}
            <GlassCard style={styles.onboardingCard}>
              <View style={styles.onboardingHeader}>
                <Sparkles size={24} color={colors.primary} />
                <Text style={[styles.onboardingTitle, { color: colors.text }]}>Welcome to SevaStack Kota!</Text>
              </View>

              <Text style={[styles.onboardingBody, { color: colors.textMuted }]}>
                Boost your sales from the 200,000+ students studying in local hostels. Upgrade your business today with all 17 hubs.
              </Text>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.trialBenefitList}>
                <View style={styles.benefitItem}>
                  <CheckCircle size={16} color={Colors.success} />
                  <Text style={[styles.benefitText, { color: colors.text }]}>14-Day Free Gold Subscription Access</Text>
                </View>
                <View style={styles.benefitItem}>
                  <CheckCircle size={16} color={Colors.success} />
                  <Text style={[styles.benefitText, { color: colors.text }]}>Featured listing badges visible to students</Text>
                </View>
                <View style={styles.benefitItem}>
                  <CheckCircle size={16} color={Colors.success} />
                  <Text style={[styles.benefitText, { color: colors.text }]}>Zero order commission split</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.startTrialBtn, { backgroundColor: colors.primary }]}
                onPress={startFreeTrial}
              >
                <Play size={16} color="#FFF" />
                <Text style={styles.startTrialBtnTxt}>Activate My 14-Day Trial</Text>
              </TouchableOpacity>
            </GlassCard>

            {/* Visibility Meter Chart widget */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Search Rank Index Rating</Text>
            <GlassCard style={styles.visibilityGaugeCard}>
              <View style={styles.gaugeRow}>
                <Text style={[styles.gaugeLabel, { color: colors.text }]}>Gold Tier / Trial Active</Text>
                <Text style={[styles.gaugePct, { color: colors.primary }]}>100% Visibility</Text>
              </View>
              <View style={[styles.gaugeBg, { backgroundColor: colors.border }]}>
                <View style={[styles.gaugeFill, { width: '100%', backgroundColor: colors.primary }]} />
              </View>

              <View style={[styles.gaugeRow, { marginTop: 12 }]}>
                <Text style={[styles.gaugeLabel, { color: colors.text }]}>Silver Tier Active</Text>
                <Text style={[styles.gaugePct, { color: colors.accent }]}>60% Visibility</Text>
              </View>
              <View style={[styles.gaugeBg, { backgroundColor: colors.border }]}>
                <View style={[styles.gaugeFill, { width: '60%', backgroundColor: colors.accent }]} />
              </View>

              <View style={[styles.gaugeRow, { marginTop: 12 }]}>
                <Text style={[styles.gaugeLabel, { color: colors.text }]}>Bronze Tier Active</Text>
                <Text style={[styles.gaugePct, { color: colors.textMuted }]}>15% Visibility</Text>
              </View>
              <View style={[styles.gaugeBg, { backgroundColor: colors.border }]}>
                <View style={[styles.gaugeFill, { width: '15%', backgroundColor: colors.textMuted }]} />
              </View>

              <View style={[styles.gaugeRow, { marginTop: 12 }]}>
                <Text style={[styles.gaugeLabel, { color: colors.text }]}>Expired Status</Text>
                <Text style={[styles.gaugePct, { color: colors.error }]}>0% (Hidden)</Text>
              </View>
              <View style={[styles.gaugeBg, { backgroundColor: colors.border }]}>
                <View style={[styles.gaugeFill, { width: '0%', backgroundColor: colors.error }]} />
              </View>
            </GlassCard>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
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
    fontSize: 12,
    fontWeight: '700',
  },
  controlLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  statusToggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    padding: 3,
    marginBottom: 20,
    gap: 4,
  },
  statusBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  statusBtnTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBanner: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 20,
  },
  statusBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  statusBannerDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  fadeContainer: {
    animationDuration: '300ms',
  },
  headerArea: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  subHeading: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  descText: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  planCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularTxt: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planName: {
    fontSize: 18,
    fontWeight: '800',
  },
  planCommission: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '900',
  },
  planDuration: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: -2,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  statsHud: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  statHudCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  hudLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hudValue: {
    fontSize: 13,
    fontWeight: '900',
  },
  statHudDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  prosContainer: {
    gap: 8,
    marginBottom: 16,
  },
  prosTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.success,
  },
  consContainer: {
    gap: 8,
    marginBottom: 20,
  },
  consTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#EF4444',
  },
  featRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 4,
  },
  featText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    lineHeight: 16,
  },
  actionBtn: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 16,
    marginLeft: 4,
  },
  simCard: {
    padding: 16,
  },
  simInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  simLabelCol: {
    flex: 1,
  },
  simInputLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  simInputSub: {
    fontSize: 11,
    marginTop: 2,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    width: 130,
    gap: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
  },
  simResults: {
    gap: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 15,
  },
  balanceCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceVal: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  balanceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
  },
  metaVal: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  metaDiv: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  ledgerList: {
    padding: 0,
    overflow: 'hidden',
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  ledgerMerchant: {
    fontSize: 14,
    fontWeight: '700',
  },
  ledgerMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  ledgerCredit: {
    fontSize: 15,
    fontWeight: '800',
  },
  onboardingCard: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  onboardingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  onboardingTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  onboardingBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  trialBenefitList: {
    gap: 10,
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 12,
    fontWeight: '600',
  },
  startTrialBtn: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  startTrialBtnTxt: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  visibilityGaugeCard: {
    padding: 16,
  },
  gaugeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gaugeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  gaugePct: {
    fontSize: 12,
    fontWeight: '900',
  },
  gaugeBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 16,
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 4,
  }
});
