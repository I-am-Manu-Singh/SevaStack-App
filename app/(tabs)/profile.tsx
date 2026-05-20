import React from 'react';

import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Briefcase,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  RefreshCw,
  Settings,
  ShieldCheck,
  Store,
  User,
  Users,
} from 'lucide-react-native';

import { Stack, router } from 'expo-router';

import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/AppContext';

import { MOCK_SESSION } from '@/constants/Auth';

import { GlassCard } from '@/components/GlassCard';

import {
  IdentityWidget,
  SubscriptionWidget,
} from '@/components/ProfileWidgets';

// ======================================================
// PROFILE SCREEN
// Cleaner hierarchy
// Reduced top clutter
// Combined identity + status
//
// Previous layout stacked random cards vertically
// like unpaid electricity bills.
//
// Now it actually breathes.
// ======================================================

export default function ProfileScreen() {
  const {
    colors,
    theme,
    userRole,
    setUserRole,
    session,
    profile,
    businessType,
  } = useApp();

  // ====================================================
  // ROLE SWITCHER
  // ====================================================

  const switchRole = () => {
    Alert.alert(
      'Switch Account Profile',
      'Select a role for local development & testing.',
      [
        {
          text: 'Student / Resident',
          onPress: () =>
            setUserRole('customer'),
        },
        {
          text: 'Merchant Partner',
          onPress: () =>
            setUserRole('merchant'),
        },
        {
          text: 'System Administrator',
          onPress: () =>
            setUserRole('admin'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // ====================================================
  // LOGOUT
  // ====================================================

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
          },
        },
      ]
    );
  };

  // ====================================================
  // PROFILE SECTIONS
  // ====================================================

  const PROFILE_SECTIONS = [
    {
      items: [
        {
          id: 'profile',
          label: 'My Profile',
          icon: User,
          route:
            '/settings/edit-profile',
        },
        {
          id: 'payments',
          label: 'Payment History',
          icon: CreditCard,
        },
      ],
    },

    ...(userRole === 'merchant'
      ? [
          {
            title:
              'Business Management',

            items: [
              {
                id: 'settings',
                label: 'Settings',
                icon: Settings,
                route: '/settings',
              },

              {
                id: 'staff',
                label:
                  'Staff Members',
                icon: Users,
                route:
                  '/(tabs)/staff',
              },

              {
                id: 'catalog',
                label: 'Catalog',
                icon: Store,
                route:
                  '/catalog',
              },

              {
                id: 'analytics',
                label:
                  'Revenue Analytics',
                icon: Briefcase,
                route:
                  '/profile/performance',
              },
            ],
          },
        ]
      : userRole === 'admin'
      ? [
          {
            title:
              'Platform Control',

            items: [
              {
                id: 'settings',
                label: 'Settings',
                icon: Settings,
                route: '/settings',
              },

              {
                id: 'ledger',
                label:
                  'Platform Ledger',
                icon: Store,
                route:
                  '/settings/platform-ledger',
              },

              {
                id: 'billing',
                label:
                  'Billing Plans',
                icon: CreditCard,
                route:
                  '/settings/billing-plans',
              },
            ],
          },
        ]
      : [
          {
            title:
              'Student Perks',

            items: [
              {
                id: 'settings',
                label: 'Settings',
                icon: Settings,
                route: '/settings',
              },

              {
                id: 'rewards',
                label:
                  'My Rewards',
                icon: Store,
              },

              {
                id: 'addresses',
                label:
                  'Saved Addresses',
                icon: ShieldCheck,
              },
            ],
          },
        ]),

    {
      title:
        'Support & Legal',

      items: [
        {
          id: 'help',
          label:
            'Help Center',
          icon: HelpCircle,
        },

        {
          id: 'privacy',
          label:
            'Privacy Policy',
          icon: ShieldCheck,
        },
      ],
    },
  ];

  // ====================================================
  // ITEM ACTIONS
  // ====================================================

  const handleItemPress = (
    item: any
  ) => {
    if (item.route) {
      router.push(item.route as any);
      return;
    }

    if (item.id === 'payments') {
      router.push(
        userRole ===
          'customer'
          ? '/profile/ledger'
          : '/settings/platform-ledger'
      );

      return;
    }

    if (item.id === 'rewards') {
      Alert.alert(
        'My Rewards',
        'You currently have 250 SevaCoins.\n\nRedeem them for cafe discounts, laundry coupons, and partner offers.'
      );

      return;
    }

    if (item.id === 'addresses') {
      Alert.alert(
        'Saved Addresses',
        'Hostel Block A, Room 102\nLibrary Hall Seat B-4'
      );

      return;
    }

    if (item.id === 'help') {
      Alert.alert(
        'Help Center',
        'Need support?\n\nContact support@sevastack.org'
      );

      return;
    }

    if (item.id === 'privacy') {
      Alert.alert(
        'Privacy Policy',
        'Your information is protected and shared only with verified campus partners.'
      );
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            colors.background,
        },
      ]}
      edges={['left', 'right']}
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
          title: 'Profile',

          headerStyle: {
            backgroundColor:
              colors.background,
          },

          headerTitleStyle: {
            color:
              colors.text,
            fontWeight:
              '800',
          },

          headerTintColor:
            colors.primary,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* ========================================= */}
        {/* PROFILE HERO */}
        {/* ========================================= */}

        <GlassCard
          style={[
            styles.profileHero,
            {
              borderColor:
                colors.border,
            },
          ]}
        >
          <IdentityWidget
            user={{
              name:
                profile?.business_name ||
                session?.user
                  ?.user_metadata
                  ?.full_name ||
                MOCK_SESSION.name,

              email:
                session?.user
                  ?.email ||
                MOCK_SESSION.email,

              avatar:
                session?.user
                  ?.user_metadata
                  ?.avatar_url ||
                (userRole ===
                'merchant'
                  ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80'
                  : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80'),
            }}
            role={userRole}
            onEdit={() =>
              router.push(
                '/settings/edit-profile'
              )
            }
          />

          {/* INLINE STATUS */}

          <View
            style={[
              styles.inlineRow,
              {
                borderTopColor:
                  `${colors.border}30`,
              },
            ]}
          >
            {userRole ===
              'merchant' && (
              <View
                style={[
                  styles.inlineBadge,
                  {
                    backgroundColor:
                      `${colors.primary}10`,
                  },
                ]}
              >
                <View
                  style={[
                    styles.liveDot,
                    {
                      backgroundColor:
                        colors.success,
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.inlineBadgeText,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {
                    businessType
                  }{' '}
                  Hub
                </Text>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={
                0.8
              }
              onPress={() =>
                router.push(
                  '/settings'
                )
              }
              style={[
                styles.inlineAction,
                {
                  backgroundColor:
                    colors.surface,

                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Settings
                size={16}
                color={
                  colors.text
                }
              />

              <Text
                style={[
                  styles.inlineActionText,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* ========================================= */}
        {/* SUBSCRIPTION */}
        {/* ========================================= */}

        {userRole ===
          'merchant' && (
          <SubscriptionWidget />
        )}

        {/* ========================================= */}
        {/* ROLE SWITCH */}
        {/* ========================================= */}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={switchRole}
          style={
            styles.switcherWrap
          }
        >
          <LinearGradient
            colors={[
              colors.primary,
              colors.accent,
            ]}
            style={
              styles.switcher
            }
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 0,
            }}
          >
            <View
              style={
                styles.switcherIcon
              }
            >
              <RefreshCw
                size={18}
                color="#FFF"
              />
            </View>

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.switcherTitle
                }
              >
                Switch Account
                Profile
              </Text>

              <Text
                style={
                  styles.switcherSub
                }
              >
                Active role:{' '}
                {userRole.toUpperCase()}
              </Text>
            </View>

            <ChevronRight
              size={18}
              color="#FFF"
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* ========================================= */}
        {/* SECTION LISTS */}
        {/* ========================================= */}

        {PROFILE_SECTIONS.map(
          (
            section,
            index
          ) => (
            <View
              key={index}
              style={
                styles.sectionWrap
              }
            >
              {!!section.title && (
                <Text
                  style={[
                    styles.sectionLabel,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  {
                    section.title
                  }
                </Text>
              )}

              <GlassCard
                style={[
                  styles.sectionCard,
                  {
                    borderColor:
                      colors.border,
                  },
                ]}
              >
                {section.items.map(
                  (
                    item,
                    itemIndex
                  ) => (
                    <TouchableOpacity
                      key={
                        item.id
                      }
                      activeOpacity={
                        0.75
                      }
                      onPress={() =>
                        handleItemPress(
                          item
                        )
                      }
                      style={[
                        styles.menuRow,

                        itemIndex <
                          section
                            .items
                            .length -
                            1 && {
                          borderBottomWidth:
                            1,

                          borderBottomColor:
                            `${colors.border}28`,
                        },
                      ]}
                    >
                      <View
                        style={
                          styles.menuLeft
                        }
                      >
                        <View
                          style={[
                            styles.menuIconWrap,
                            {
                              backgroundColor:
                                `${colors.primary}10`,
                            },
                          ]}
                        >
                          <item.icon
                            size={
                              18
                            }
                            color={
                              colors.primary
                            }
                          />
                        </View>

                        <Text
                          style={[
                            styles.menuText,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {
                            item.label
                          }
                        </Text>
                      </View>

                      <ChevronRight
                        size={16}
                        color={
                          colors.textMuted
                        }
                      />
                    </TouchableOpacity>
                  )
                )}
              </GlassCard>
            </View>
          )
        )}

        {/* ========================================= */}
        {/* LOGOUT */}
        {/* ========================================= */}

                <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={[
            styles.logoutBtn,
            {
              backgroundColor: `${colors.error}12`, // Added theme-aware background tint
              borderColor: `${colors.error}22`,
            },
          ]}
        >
          <LogOut
            size={18}
            color={colors.error}
          />

          <Text
            style={[
              styles.logoutText,
              {
                color: colors.error,
              },
            ]}
          >
            Sign Out Account
          </Text>
        </TouchableOpacity>

        {/* ========================================= */}
        {/* VERSION */}
        {/* ========================================= */}

        <Text
          style={[
            styles.version,
            {
              color:
                colors.textMuted,
            },
          ]}
        >
          SevaStack • Version
          2.4.0
        </Text>

        <View
          style={{
            height: 120,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 40,
  },

  // ====================================================
  // HERO
  // ====================================================

  profileHero: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 18,
  },

  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    borderTopWidth: 1,
  },

  inlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },

  inlineBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 8,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  inlineAction: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },

  inlineActionText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },

  // ====================================================
  // SWITCHER
  // ====================================================

  switcherWrap: {
    marginTop: 2,
    marginBottom: 20,

    ...Platform.select({
      ios: {
        shadowColor:
          '#000',
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },

      android: {
        elevation: 4,
      },
    }),
  },

  switcher: {
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  switcherIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor:
      'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  switcherTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },

  switcherSub: {
    color:
      'rgba(255,255,255,0.82)',
    fontSize: 11,
    fontWeight: '600',
  },

  // ====================================================
  // SECTIONS
  // ====================================================

  sectionWrap: {
    marginBottom: 18,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform:
      'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },

  sectionCard: {
    padding: 0,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },

  menuRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  menuText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },

  // ====================================================
  // LOGOUT
  // ====================================================

  logoutBtn: {
    height: 54,
    width: '50%',
    alignSelf: 'center',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent:
      'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },

  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },

  // ====================================================
  // VERSION
  // ====================================================

  version: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 22,
    opacity: 0.8,
  },
});