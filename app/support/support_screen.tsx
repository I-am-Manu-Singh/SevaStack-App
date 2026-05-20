import React, {
  useState,
  useEffect,
  useMemo,
} from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';

import {
  MessageCircle,
  Phone,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  LifeBuoy,
  RefreshCw,
  Sparkles,
  Ticket,
  ShieldCheck,
  Clock3,
  SendHorizonal,
  Search,
  X,
} from 'lucide-react-native';

import { Stack } from 'expo-router';

import { Spacing } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/Button';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

// ======================================================
// TYPES
// ======================================================

interface SupportTicket {
  id: string;
  merchant_id: string;
  subject: string;
  message: string;
  category: string;
  status:
    | 'open'
    | 'in_progress'
    | 'resolved';

  admin_reply: string | null;
  created_at: string;
}

// ======================================================
// FAQ
// ======================================================

const FAQ_ITEMS = [
  {
    id: '1',
    question:
      'How do I add a new business type?',
    answer:
      'Open Settings → Add New Business Hub and register your category dynamically.',
  },

  {
    id: '2',
    question:
      'Where can I see commission splits?',
    answer:
      'Navigate to Settings → Platform Ledger to review settlements and payouts.',
  },

  {
    id: '3',
    question:
      'What does Holiday Mode do?',
    answer:
      'Holiday Mode temporarily pauses bookings and hides your business from customers.',
  },
];

// ======================================================
// SCREEN
// ======================================================

export default function SupportScreen() {
  const {
    colors,
    theme,
  } = useApp();

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [profile, setProfile] =
    useState<any>(null);

  const [tickets, setTickets] =
    useState<SupportTicket[]>([]);

  const [
    expandedTicketId,
    setExpandedTicketId,
  ] = useState<string | null>(null);

  const [subject, setSubject] =
    useState('');

  const [message, setMessage] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [category, setCategory] =
    useState<
      | 'payouts'
      | 'orders'
      | 'technical'
      | 'delivery'
      | 'general'
    >('general');

  // ======================================================
  // LOAD
  // ======================================================

  async function loadSupportData() {
    try {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) return;

      const { data: merData } =
        await supabase
          .from('merchants')
          .select('*')
          .eq(
            'user_id',
            user.id
          )
          .single();

      if (merData) {
        setProfile(merData);

        const {
          data: ticketData,
          error,
        } = await supabase
          .from(
            'support_tickets'
          )
          .select('*')
          .eq(
            'merchant_id',
            merData.id
          )
          .order(
            'created_at',
            {
              ascending:
                false,
            }
          );

        if (
          !error &&
          ticketData
        ) {
          setTickets(
            ticketData
          );
        }
      }
    } catch (e: any) {
      console.warn(
        e.message
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadSupportData();
  }, []);

  // ======================================================
  // FILTERED
  // ======================================================

  const filteredTickets =
    useMemo(() => {
      return tickets.filter(
        (ticket) =>
          ticket.subject
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          ticket.category
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }, [tickets, search]);

  // ======================================================
  // CREATE
  // ======================================================

  const handleCreateTicket =
    async () => {
      if (
        !subject.trim() ||
        !message.trim()
      ) {
        Alert.alert(
          'Required Fields',
          'Please provide a subject and detailed issue description.'
        );

        return;
      }

      setSubmitting(true);

      try {
        if (!profile) {
          Alert.alert(
            'Error',
            'No merchant profile found.'
          );

          return;
        }

        const { error } =
          await supabase
            .from(
              'support_tickets'
            )
            .insert([
              {
                merchant_id:
                  profile.id,

                subject:
                  subject.trim(),

                message:
                  message.trim(),

                category,

                status:
                  'open',
              },
            ]);

        if (error)
          throw error;

        Alert.alert(
          'Ticket Submitted',
          'Support agents will review your issue shortly.'
        );

        setSubject('');
        setMessage('');
        setCategory(
          'general'
        );

        loadSupportData();
      } catch (err: any) {
        Alert.alert(
          'Submission Failed',
          err.message
        );
      } finally {
        setSubmitting(false);
      }
    };

  // ======================================================
  // DEMO REPLY
  // ======================================================

  const handleSimulateAdminReply =
    async (
      ticketId: string
    ) => {
      try {
        const { error } =
          await supabase
            .from(
              'support_tickets'
            )
            .update({
              status:
                'resolved',

              admin_reply:
                'Issue verified and resolved successfully. Platform services are now operating normally.',
            })
            .eq(
              'id',
              ticketId
            );

        if (error)
          throw error;

        loadSupportData();
      } catch (err: any) {
        Alert.alert(
          'Action Failed',
          err.message
        );
      }
    };

  // ======================================================
  // STATS
  // ======================================================

  const openTickets =
    tickets.filter(
      (t) =>
        t.status === 'open'
    ).length;

  const resolvedTickets =
    tickets.filter(
      (t) =>
        t.status ===
        'resolved'
    ).length;

  // ======================================================
  // LOADER
  // ======================================================

  if (loading) {
    return (
      <View
        style={[
          styles.loaderWrap,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <StatusBar
        style={
          theme === 'dark'
            ? 'light'
            : 'dark'
        }
      />

      <Stack.Screen
        options={{
          title:
            'Help & Support',

          headerShadowVisible:
            false,

          headerStyle: {
            backgroundColor:
              colors.background,
          },

          headerTitleStyle: {
            color: colors.text,
            fontWeight: '900',
          },

          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                setRefreshing(
                  true
                );

                loadSupportData();
              }}
            >
              <RefreshCw
                size={20}
                color={
                  colors.primary
                }
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* HERO */}

        <LinearGradient
          colors={[
            colors.primary +
              '16',
            'transparent',
          ]}
          style={
            styles.heroGradient
          }
        />

        <GlassCard
          style={[
            styles.heroCard,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          <View
            style={
              styles.heroTop
            }
          >
            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={[
                  styles.heroTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Merchant Help
                Center
              </Text>

              <Text
                style={[
                  styles.heroSub,
                  {
                    color:
                      colors.textMuted,
                  },
                ]}
              >
                Resolve payout
                issues, technical
                bugs and customer
                disputes from one
                place. Civilization
                survives entirely
                on support tickets
                and caffeine.
              </Text>
            </View>

            <View
              style={[
                styles.heroIconWrap,
                {
                  backgroundColor:
                    colors.primary +
                    '15',
                },
              ]}
            >
              <LifeBuoy
                size={30}
                color={
                  colors.primary
                }
              />
            </View>
          </View>

          {/* STATS */}

          <View
            style={
              styles.statsRow
            }
          >
            <StatsCard
              colors={colors}
              icon={Ticket}
              value={
                tickets.length
              }
              label="Tickets"
            />

            <StatsCard
              colors={colors}
              icon={Clock3}
              value={
                openTickets
              }
              label="Open"
            />

            <StatsCard
              colors={colors}
              icon={
                ShieldCheck
              }
              value={
                resolvedTickets
              }
              label="Resolved"
            />
          </View>
        </GlassCard>

        {/* CONTACT */}

        <View
          style={
            styles.contactOptions
          }
        >
          <TouchableOpacity
            activeOpacity={0.85}
            style={{
              flex: 1,
            }}
            onPress={() =>
              Alert.alert(
                'Hotline',
                'Connecting support hotline...'
              )
            }
          >
            <GlassCard
              style={[
                styles.optionCard,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Phone
                size={24}
                color={
                  colors.primary
                }
              />

              <Text
                style={[
                  styles.optionLabel,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Live Hotline
              </Text>

              <Text
                style={[
                  styles.optionDesc,
                  {
                    color:
                      colors.textMuted,
                  },
                ]}
              >
                Toll-Free
              </Text>
            </GlassCard>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={{
              flex: 1,
            }}
            onPress={() =>
              Alert.alert(
                'Live Chat',
                'Connecting to support agent...'
              )
            }
          >
            <GlassCard
              style={[
                styles.optionCard,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <MessageCircle
                size={24}
                color={
                  colors.accent
                }
              />

              <Text
                style={[
                  styles.optionLabel,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Live Chat
              </Text>

              <Text
                style={[
                  styles.optionDesc,
                  {
                    color:
                      colors.textMuted,
                  },
                ]}
              >
                Avg. 2 mins
              </Text>
            </GlassCard>
          </TouchableOpacity>
        </View>

        {/* SEARCH */}

        <View
          style={[
            styles.searchBar,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          <Search
            size={18}
            color={
              colors.textMuted
            }
          />

          <TextInput
            placeholder="Search tickets..."
            placeholderTextColor={
              colors.textMuted
            }
            style={[
              styles.searchInput,
              {
                color:
                  colors.text,
              },
            ]}
            value={search}
            onChangeText={
              setSearch
            }
          />

          {search ? (
            <TouchableOpacity
              onPress={() =>
                setSearch('')
              }
            >
              <X
                size={18}
                color={
                  colors.textMuted
                }
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* TICKETS */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Active Tickets
          </Text>
        </View>

        {!filteredTickets.length ? (
          <GlassCard
            style={[
              styles.emptyCard,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <AlertCircle
              size={34}
              color={
                colors.textMuted
              }
            />

            <Text
              style={[
                styles.emptyText,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              No support tickets
              found.
            </Text>
          </GlassCard>
        ) : (
          filteredTickets.map(
            (ticket) => {
              const isExpanded =
                expandedTicketId ===
                ticket.id;

              return (
                <GlassCard
                  key={
                    ticket.id
                  }
                  style={[
                    styles.ticketCard,
                    {
                      backgroundColor:
                        colors.surface,
                      borderColor:
                        colors.border,
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={
                      0.85
                    }
                    style={
                      styles.ticketHeaderRow
                    }
                    onPress={() =>
                      setExpandedTicketId(
                        isExpanded
                          ? null
                          : ticket.id
                      )
                    }
                  >
                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <Text
                        style={[
                          styles.ticketSubject,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {
                          ticket.subject
                        }
                      </Text>

                      <Text
                        style={[
                          styles.ticketMeta,
                          {
                            color:
                              colors.textMuted,
                          },
                        ]}
                      >
                        {
                          ticket.category
                        }
                        {' • '}
                        {new Date(
                          ticket.created_at
                        ).toLocaleDateString()}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.badgeRow
                      }
                    >
                      <View
                        style={[
                          styles.statusBadge,

                          {
                            backgroundColor:
                              ticket.status ===
                              'resolved'
                                ? '#10B981'
                                : ticket.status ===
                                  'in_progress'
                                ? '#F59E0B'
                                : colors.primary,
                          },
                        ]}
                      >
                        <Text
                          style={
                            styles.badgeText
                          }
                        >
                          {ticket.status.toUpperCase()}
                        </Text>
                      </View>

                      {isExpanded ? (
                        <ChevronUp
                          size={
                            18
                          }
                          color={
                            colors.textMuted
                          }
                        />
                      ) : (
                        <ChevronDown
                          size={
                            18
                          }
                          color={
                            colors.textMuted
                          }
                        />
                      )}
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View
                      style={
                        styles.expandedContent
                      }
                    >
                      <View
                        style={[
                          styles.divider,
                          {
                            backgroundColor:
                              colors.border,
                          },
                        ]}
                      />

                      <Text
                        style={[
                          styles.messageLabel,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        Description
                      </Text>

                      <Text
                        style={[
                          styles.ticketMessage,
                          {
                            color:
                              colors.textMuted,
                          },
                        ]}
                      >
                        {
                          ticket.message
                        }
                      </Text>

                      {ticket.admin_reply ? (
                        <View
                          style={[
                            styles.replyBox,
                            {
                              backgroundColor:
                                colors.background,
                              borderColor:
                                colors.border,
                            },
                          ]}
                        >
                          <View
                            style={
                              styles.replyHeader
                            }
                          >
                            <Sparkles
                              size={
                                14
                              }
                              color={
                                colors.primary
                              }
                            />

                            <Text
                              style={[
                                styles.replyTitle,
                                {
                                  color:
                                    colors.primary,
                                },
                              ]}
                            >
                              Support
                              Team
                            </Text>
                          </View>

                          <Text
                            style={[
                              styles.replyBody,
                              {
                                color:
                                  colors.text,
                              },
                            ]}
                          >
                            {
                              ticket.admin_reply
                            }
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={
                            styles.pendingBox
                          }
                        >
                          <Text
                            style={[
                              styles.pendingTxt,
                              {
                                color:
                                  colors.textMuted,
                              },
                            ]}
                          >
                            Awaiting
                            support
                            response.
                            Average
                            wait time:
                            2 hours.
                          </Text>

                          <TouchableOpacity
                            activeOpacity={
                              0.85
                            }
                            style={[
                              styles.demoReplyBtn,
                              {
                                backgroundColor:
                                  colors.primary,
                              },
                            ]}
                            onPress={() =>
                              handleSimulateAdminReply(
                                ticket.id
                              )
                            }
                          >
                            <Text
                              style={
                                styles.demoReplyBtnText
                              }
                            >
                              Demo
                              Reply
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </GlassCard>
              );
            }
          )
        )}

        {/* FORM */}

        <GlassCard
          style={[
            styles.formCard,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          <View
            style={
              styles.formHeader
            }
          >
            <SendHorizonal
              size={20}
              color={
                colors.primary
              }
            />

            <Text
              style={[
                styles.formTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Submit Ticket
            </Text>
          </View>

          <Text
            style={[
              styles.formSub,
              {
                color:
                  colors.textMuted,
              },
            ]}
          >
            Create a direct
            communication channel
            with the support
            team.
          </Text>

          {/* SUBJECT */}

          <Text
            style={[
              styles.label,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Subject
          </Text>

          <TextInput
            value={subject}
            onChangeText={
              setSubject
            }
            placeholder="Settlement calculation issue..."
            placeholderTextColor={
              colors.textMuted
            }
            style={[
              styles.input,
              {
                color:
                  colors.text,
                borderColor:
                  colors.border,
                backgroundColor:
                  colors.background,
              },
            ]}
          />

          {/* CATEGORY */}

          <Text
            style={[
              styles.label,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Category
          </Text>

          <View
            style={
              styles.chipsRow
            }
          >
            {[
              'general',
              'payouts',
              'orders',
              'technical',
              'delivery',
            ].map((cat) => (
              <TouchableOpacity
                key={cat}
                activeOpacity={
                  0.85
                }
                onPress={() =>
                  setCategory(
                    cat as any
                  )
                }
                style={[
                  styles.chip,

                  {
                    backgroundColor:
                      colors.background,
                    borderColor:
                      colors.border,
                  },

                  category ===
                    cat && {
                    backgroundColor:
                      colors.primary,
                    borderColor:
                      colors.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,

                    {
                      color:
                        category ===
                        cat
                          ? '#FFF'
                          : colors.textMuted,
                    },
                  ]}
                >
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* DESCRIPTION */}

          <Text
            style={[
              styles.label,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Description
          </Text>

          <TextInput
            multiline
            numberOfLines={5}
            value={message}
            onChangeText={
              setMessage
            }
            placeholder="Describe your issue with detailed logs or order references..."
            placeholderTextColor={
              colors.textMuted
            }
            style={[
              styles.input,
              styles.textArea,

              {
                color:
                  colors.text,
                borderColor:
                  colors.border,
                backgroundColor:
                  colors.background,
              },
            ]}
          />

          <Button
            title={
              submitting
                ? 'Submitting...'
                : 'Submit Support Ticket'
            }
            onPress={
              handleCreateTicket
            }
            disabled={
              submitting
            }
            style={{
              marginTop: 22,
            }}
          />
        </GlassCard>

        {/* FAQ */}

        <View
          style={
            styles.faqSection
          }
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Frequently Asked
            Questions
          </Text>

          {FAQ_ITEMS.map(
            (faq) => (
              <GlassCard
                key={faq.id}
                style={[
                  styles.faqCard,
                  {
                    backgroundColor:
                      colors.surface,
                    borderColor:
                      colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.faqQuestion,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {
                    faq.question
                  }
                </Text>

                <Text
                  style={[
                    styles.faqAnswer,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  {
                    faq.answer
                  }
                </Text>
              </GlassCard>
            )
          )}
        </View>

        <View
          style={{ height: 80 }}
        />
      </ScrollView>
    </View>
  );
}

// ======================================================
// STATS CARD
// ======================================================

function StatsCard({
  colors,
  icon: Icon,
  value,
  label,
}: any) {
  return (
    <View
      style={[
        styles.statsCard,
        {
          backgroundColor:
            colors.background,
          borderColor:
            colors.border,
        },
      ]}
    >
      <Icon
        size={18}
        color={colors.primary}
      />

      <Text
        style={[
          styles.statsValue,
          {
            color:
              colors.text,
          },
        ]}
      >
        {value}
      </Text>

      <Text
        style={[
          styles.statsLabel,
          {
            color:
              colors.textMuted,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 20,
  },

  heroGradient: {
    position: 'absolute',
    top: -120,
    left: -30,
    right: -30,
    height: 320,
  },

  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
    overflow: 'hidden',
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.6,
  },

  heroSub: {
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
    paddingRight: 14,
    fontWeight: '500',
  },

  heroIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 14,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  statsCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    minHeight: 92,
    justifyContent: 'center',
  },

  statsValue: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 10,
  },

  statsLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  contactOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },

  optionCard: {
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 14,
    borderWidth: 1,
    alignItems: 'center',

    ...Platform.select({
      ios: {
        shadowColor:
          '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.08,
        shadowRadius: 5,
      },

      android: {
        elevation: 2,
      },
    }),
  },

  optionLabel: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 10,
  },

  optionDesc: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: '600',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 18,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
  },

  emptyCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  emptyText: {
    fontSize: 13,
    marginTop: 10,
    fontWeight: '600',
  },

  ticketCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },

  ticketHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ticketSubject: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    paddingRight: 10,
  },

  ticketMeta: {
    fontSize: 11,
    marginTop: 5,
    fontWeight: '600',
  },

  badgeRow: {
    alignItems: 'flex-end',
    gap: 8,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },

  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  expandedContent: {
    marginTop: 14,
  },

  divider: {
    height: 1,
    opacity: 0.08,
    marginBottom: 14,
  },

  messageLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },

  ticketMessage: {
    fontSize: 12,
    lineHeight: 19,
    fontWeight: '500',
  },

  replyBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },

  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },

  replyTitle: {
    fontSize: 12,
    fontWeight: '900',
  },

  replyBody: {
    fontSize: 12,
    lineHeight: 19,
    fontWeight: '500',
  },

  pendingBox: {
    marginTop: 14,
    gap: 12,
  },

  pendingTxt: {
    fontSize: 11,
    lineHeight: 17,
    fontStyle: 'italic',
  },

  demoReplyBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
  },

  demoReplyBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },

  formCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    marginTop: 8,
  },

  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  formTitle: {
    fontSize: 18,
    fontWeight: '900',
  },

  formSub: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 18,
  },

  label: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: '600',
  },

  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },

  chipText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  faqSection: {
    marginTop: 22,
  },

  faqCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginTop: 12,
  },

  faqQuestion: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 18,
  },

  faqAnswer: {
    fontSize: 12,
    lineHeight: 19,
    fontWeight: '500',
  },
});