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
  HelpCircle, 
  MessageCircle, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  PlusCircle, 
  CheckCircle, 
  AlertCircle,
  FileText,
  LifeBuoy,
  RefreshCw
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { getGlobalStyles } from '@/constants/GlobalStyles';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/Button';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

interface SupportTicket {
  id: string;
  merchant_id: string;
  subject: string;
  message: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved';
  admin_reply: string | null;
  created_at: string;
}

const FAQ_ITEMS = [
  { id: '1', question: 'How do I add a new custom business type?', answer: 'Go to the Settings page and select "Add New Business Hub" to register any specialized category dynamically.' },
  { id: '2', question: 'Where can I see order commission splits?', answer: 'Navigate to Settings > Platform Ledger. You can view user payments, platform cuts, and payouts.' },
  { id: '3', question: 'What is Holiday Mode?', answer: 'Turning on Holiday Mode in settings automatically pauses bookings and sets your shop status to inactive for students.' },
];

export default function SupportScreen() {
  const { colors } = useApp();
  const router = useRouter();
  const gStyles = getGlobalStyles(colors);
  const styles = getStyles(colors, gStyles);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Tickets
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  // Form Fields
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'payouts' | 'orders' | 'technical' | 'delivery' | 'general'>('general');

  async function loadSupportData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: merData } = await supabase
          .from('merchants')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (merData) {
          setProfile(merData);
          
          const { data: ticketData, error: ticketErr } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('merchant_id', merData.id)
            .order('created_at', { ascending: false });

          if (!ticketErr && ticketData) {
            setTickets(ticketData);
          }
        }
      }
    } catch (e: any) {
      console.warn("Could not load support data:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadSupportData();
  }, []);

  const handleCreateTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Required Fields", "Please provide a subject and describe your issue.");
      return;
    }

    setSubmitting(true);
    try {
      if (profile) {
        const { error } = await supabase
          .from('support_tickets')
          .insert([{
            merchant_id: profile.id,
            subject: subject.trim(),
            message: message.trim(),
            category: category,
            status: 'open'
          }]);

        if (error) throw error;
        
        Alert.alert("Ticket Submitted", "Our support agents will review your ticket shortly.");
        setSubject('');
        setMessage('');
        setCategory('general');
        loadSupportData();
      } else {
        Alert.alert("Error", "No merchant profile found to assign ticket.");
      }
    } catch (err: any) {
      Alert.alert("Submission Failed", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Demo tool to simulate admin reply
  const handleSimulateAdminReply = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          status: 'resolved',
          admin_reply: 'This is an automated support response: We have checked your query and updated the platform transaction ledger database tables. The issue is resolved!'
        })
        .eq('id', ticketId);

      if (error) throw error;
      Alert.alert("Support Agent Replied", "Simulated support response added successfully.");
      loadSupportData();
    } catch (err: any) {
      Alert.alert("Action Failed", err.message);
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
      <Stack.Screen options={{ 
        title: 'Help & Support',
        headerRight: () => (
          <TouchableOpacity onPress={() => { setRefreshing(true); loadSupportData(); }}>
            <RefreshCw size={20} color={colors.primary} />
          </TouchableOpacity>
        )
      }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Support Greeting Header */}
        <View style={styles.header}>
          <LifeBuoy size={56} color={colors.primary} style={styles.headerIcon} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Merchant Help Center</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Resolve payout split issues, report bugs, or contact our support team.
          </Text>
        </View>

        {/* Quick Contact Options */}
        <View style={styles.contactOptions}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => Alert.alert("Call Helpline", "Connecting you directly to SevaStack Support...")}>
            <GlassCard style={styles.optionCard}>
              <Phone size={24} color={colors.primary} />
              <Text style={[styles.optionLabel, { color: colors.text }]}>Live Hotline</Text>
              <Text style={[styles.optionDesc, { color: colors.textMuted }]}>Toll Free</Text>
            </GlassCard>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => Alert.alert("Support Chat", "Connecting to a live agent...")}>
            <GlassCard style={styles.optionCard}>
              <MessageCircle size={24} color={colors.accent} />
              <Text style={[styles.optionLabel, { color: colors.text }]}>Live Chat</Text>
              <Text style={[styles.optionDesc, { color: colors.textMuted }]}>2 min wait</Text>
            </GlassCard>
          </TouchableOpacity>
        </View>

        {/* Support Tickets Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Active Support Tickets</Text>
        {tickets.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <AlertCircle size={32} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 8 }}>You have no support tickets.</Text>
          </GlassCard>
        ) : (
          <View style={styles.ticketList}>
            {tickets.map((ticket) => {
              const isExpanded = expandedTicketId === ticket.id;
              return (
                <GlassCard key={ticket.id} style={styles.ticketCard}>
                  <TouchableOpacity 
                    style={styles.ticketHeaderRow} 
                    onPress={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.ticketSubject, { color: colors.text }]}>{ticket.subject}</Text>
                      <Text style={[styles.ticketMeta, { color: colors.textMuted }]}>
                        Category: {ticket.category.toUpperCase()} • {new Date(ticket.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.badgeRow}>
                      <View style={[
                        styles.statusBadge, 
                        { 
                          backgroundColor: 
                            ticket.status === 'resolved' ? '#10B981' : 
                            ticket.status === 'in_progress' ? '#F59E0B' : colors.primary 
                        }
                      ]}>
                        <Text style={styles.badgeText}>{ticket.status.toUpperCase()}</Text>
                      </View>
                      {isExpanded ? <ChevronUp size={16} color={colors.textMuted} /> : <ChevronDown size={16} color={colors.textMuted} />}
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={[styles.divider, { backgroundColor: colors.border }]} />
                      <Text style={[styles.ticketMessageLabel, { color: colors.text }]}>Description:</Text>
                      <Text style={[styles.ticketMessage, { color: colors.textMuted }]}>{ticket.message}</Text>

                      {ticket.admin_reply ? (
                        <View style={[styles.replyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                          <Text style={[styles.replyTitle, { color: colors.primary }]}>Support Team Response:</Text>
                          <Text style={[styles.replyBody, { color: colors.text }]}>{ticket.admin_reply}</Text>
                        </View>
                      ) : (
                        <View style={styles.noReplyBox}>
                          <Text style={{ color: colors.textMuted, fontSize: 11, fontStyle: 'italic' }}>
                            Awaiting agent response. Typically responds in 2 hours.
                          </Text>
                          
                          {/* Demo simulation helper */}
                          <TouchableOpacity 
                            style={[styles.demoReplyBtn, { backgroundColor: colors.primary }]}
                            onPress={() => handleSimulateAdminReply(ticket.id)}
                          >
                            <Text style={styles.demoReplyBtnText}>Simulate Admin Reply (Demo)</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </GlassCard>
              );
            })}
          </View>
        )}

        {/* Submit Ticket Inquiry Form */}
        <View style={styles.inquirySection}>
          <GlassCard style={styles.inquiryCard}>
            <Text style={[styles.inquiryTitle, { color: colors.text }]}>Submit a Support Ticket</Text>
            <Text style={[styles.inquirySubtitle, { color: colors.textMuted }]}>
              Create a direct communication pipeline with the platform operators.
            </Text>

            <Text style={[styles.label, { color: colors.text }]}>Subject *</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
              value={subject}
              onChangeText={setSubject}
              placeholder="e.g. Settlement calculation anomaly"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.label, { color: colors.text, marginTop: 12 }]}>Category *</Text>
            <View style={styles.chipsRow}>
              {(['general', 'payouts', 'orders', 'technical', 'delivery'] as const).map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.chip, 
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    category === cat && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                >
                  <Text style={[styles.chipText, { color: category === cat ? '#FFF' : colors.textMuted }]}>
                    {cat.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.text, marginTop: 12 }]}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
              value={message}
              onChangeText={setMessage}
              placeholder="Provide detailed logs or order ID references..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
            />

            <Button 
              title="Submit Support Ticket" 
              onPress={handleCreateTicket} 
              disabled={submitting}
              style={{ marginTop: 20 }}
            />
          </GlassCard>
        </View>

        {/* FAQs */}
        <View style={styles.faqSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
          {FAQ_ITEMS.map((faq) => (
            <GlassCard key={faq.id} style={styles.faqCard}>
              <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
              <Text style={[styles.faqAnswer, { color: colors.textMuted }]}>{faq.answer}</Text>
            </GlassCard>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any, gStyles: any) => StyleSheet.create({
  container: gStyles.container,
  scrollContent: gStyles.scrollContent,
  header: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  headerIcon: {
    marginBottom: Spacing.md,
  },
  headerTitle: {
    ...gStyles.headerTitle,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...gStyles.descriptionText,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  contactOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  optionCard: gStyles.glassCard,
  optionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  optionDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionTitle: gStyles.sectionTitle,
  emptyCard: gStyles.emptyCard,
  ticketList: {
    gap: 12,
  },
  ticketCard: gStyles.glassCard,
  ticketHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketSubject: {
    fontSize: 14,
    fontWeight: '700',
  },
  ticketMeta: {
    fontSize: 11,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: gStyles.badge,
  badgeText: gStyles.badgeText,
  expandedContent: {
    marginTop: 12,
  },
  divider: gStyles.divider,
  ticketMessageLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  ticketMessage: {
    fontSize: 12,
    lineHeight: 16,
  },
  replyBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  replyTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  replyBody: {
    fontSize: 12,
    lineHeight: 16,
  },
  noReplyBox: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  demoReplyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  demoReplyBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  inquirySection: {
    marginTop: Spacing.lg,
  },
  inquiryCard: gStyles.glassCard,
  inquiryTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  inquirySubtitle: {
    fontSize: 11,
    marginTop: 4,
    marginBottom: 16,
  },
  label: gStyles.inputLabel,
  input: gStyles.input,
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textArea: gStyles.textArea,
  faqSection: {
    marginTop: Spacing.lg,
  },
  faqCard: gStyles.glassCard,
  faqQuestion: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 12,
    lineHeight: 16,
  },
});
