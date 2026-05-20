
import React, { useEffect, useMemo, useState  } from 'react';

import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Stack, useRouter } from 'expo-router';

import {
  Activity,
  BookOpen,
  Briefcase,
  Car,
  ChevronRight,
  Coffee,
  Globe,
  GraduationCap,
  Hammer,
  MapPin,
  Package,
  PieChart,
  Pill,
  Printer,
  Scissors,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
  Utensils,
  Waves,
  X,
  Zap,
} from 'lucide-react-native';

import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/AppContext';

import { GlassCard } from '@/components/GlassCard';

// ======================================================
// ICON MAP
// ======================================================

const ICON_MAP: Record<string, any> = {
  Briefcase,
  TrendingUp,
  Package,
  PieChart,
  ShieldCheck,
  MapPin,
  ChevronRight,
  Sparkles,
  Zap,
  Globe,
  Pill,
  Utensils,
  Truck,
  ShoppingBag,
  Waves,
  Scissors,
  Printer,
  BookOpen,
  Shirt,
  Activity,
  Coffee,
  Car,
  Hammer,
  GraduationCap,
};

// ======================================================
// ROOT
// ======================================================

export default function DiscoverScreen() {
  const { userRole, colors } = useApp();

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}
      edges={['left', 'right']}
    >
      {userRole === 'customer' ? (
        <CustomerDiscoverView />
      ) : (
        <MerchantDiscoverView />
      )}
    </SafeAreaView>
  );
}

// ======================================================
// MERCHANT VIEW
// ======================================================

function MerchantDiscoverView() {
  const {
    colors,
    businessType,
    theme,
    t,
  } = useApp();

  const router = useRouter();

  const [searchQuery, setSearchQuery] =
    useState('');

  const [hubs, setHubs] = useState<any[]>([]);

  const TOOLS = [
    {
      id: 'inventory',
      name: 'Inventory',
      icon: Package,
      color: '#6366F1',
      route: '/tools/inventory',
    },
    {
      id: 'expenses',
      name: 'Expenses',
      icon: PieChart,
      color: '#EF4444',
      route: '/tools/expenses',
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: TrendingUp,
      color: '#10B981',
      route: '/profile/performance',
    },
    {
      id: 'security',
      name: 'Security',
      icon: ShieldCheck,
      color: '#F59E0B',
      route: '/tools/security',
    },
  ];

  const DEFAULT_HUBS = [
    {
      id: 'tuition',
      name: 'Tuition & Coaching Hub',
      desc: 'Mock tests, notes & student batches',
      icon_name: 'GraduationCap',
      route: '/business/tuition-manager',
    },
    {
      id: 'repair',
      name: 'Repair Services',
      desc: 'Repair tickets & completion tracking',
      icon_name: 'Hammer',
      route: '/business/repair-manager',
    },
    {
      id: 'cafe',
      name: 'Cafe & Quick Bites',
      desc: 'Orders, combos & peak-hour flow',
      icon_name: 'Coffee',
      route: '/business/cafe-manager',
    },
    {
      id: 'library',
      name: 'Library & Study Hub',
      desc: 'Seat maps & focus tracking',
      icon_name: 'BookOpen',
      route: '/business/library-manager',
    },
    {
      id: 'laundry',
      name: 'Laundry Services',
      desc: 'Wash cycles & delivery flow',
      icon_name: 'Waves',
      route: '/business/laundry-manager',
    },
    {
      id: 'tiffin',
      name: 'Mess & Tiffin Hub',
      desc: 'Subscriptions & meal planning',
      icon_name: 'Utensils',
      route: '/business/tiffin-manager',
    },
  ];

  useEffect(() => {
    loadHubs();
  }, []);

  async function loadHubs() {
    try {
      const { data } = await supabase
        .from('business_types')
        .select('*');

      if (data?.length) {
        setHubs(
          data.map((row: any) => ({
            id: row.id,
            name: row.name,
            desc:
              row.description ||
              'Business ecosystem tools',
            icon_name:
              row.icon_name || 'Briefcase',
            route:
              row.route ||
              `/business/${row.id}-manager`,
          }))
        );
      } else {
        setHubs(DEFAULT_HUBS);
      }
    } catch {
      setHubs(DEFAULT_HUBS);
    }
  }

  const filteredHubs = useMemo(() => {
    return hubs.filter(
      (hub) =>
        hub.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        hub.desc
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  }, [hubs, searchQuery]);

  // Transform filtered hubs into pairs for the inline grid system
  const chunkedHubs = useMemo(() => {
    return filteredHubs.reduce((acc, hub, index) => {
      if (index % 2 === 0) {
        acc.push([hub]);
      } else {
        acc[acc.length - 1].push(hub);
      }
      return acc;
    }, [] as any[][]);
  }, [filteredHubs]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
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
          title: 'Discover',
          headerStyle: {
            backgroundColor:
              colors.background,
          },
          headerTitleStyle: {
            color: colors.text,
            fontWeight: '800',
          },
          headerTintColor:
            colors.primary,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* HERO */}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            router.push('/catalog/ai-finder')
          }
        >
          <LinearGradient
            colors={[
              colors.primary,
              colors.accent,
            ]}
            style={styles.heroCard}
          >
            <View style={styles.heroIcon}>
              <Zap
                size={24}
                color="#FFF"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>
                Growth Engine
              </Text>

              <Text style={styles.heroSub}>
                AI-powered visibility boosts
                for your {businessType}{' '}
                business.
              </Text>
            </View>

            <ChevronRight
              size={20}
              color="#FFF"
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* TOOLS */}

        <SectionHeader
          title="Operational Tools"
          colors={colors}
        />

        <View style={styles.toolGrid}>
          {TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              activeOpacity={0.8}
              onPress={() =>
                router.push(tool.route as any)
              }
              style={[
                styles.toolCard,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.toolIconWrap,
                  {
                    backgroundColor:
                      `${tool.color}14`,
                  },
                ]}
              >
                <tool.icon
                  size={20}
                  color={tool.color}
                />
              </View>

              <Text
                style={[
                  styles.toolLabel,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {tool.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SEARCH */}
        <View style={styles.rowBetween}>
          <SectionHeader
            title="Business Ecosystems"
            colors={colors}
            noMargin
          />

          <Text
            style={[
              styles.countText,
              {
                color: colors.textMuted,
              },
            ]}
          >
            {filteredHubs.length} active
          </Text>
        </View>

        <SearchBar
          colors={colors}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search ecosystems..."
          onClear={() => setSearchQuery('')}
        />

                {/* HUBS GRID */}
        {chunkedHubs.length === 0 ? (
          <EmptyState
            colors={colors}
            text="No matching ecosystems found."
          />
        ) : (
          chunkedHubs.map((row: any[], rowIndex: number) => (
            <View
              key={`row-${rowIndex}`}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              {row.map((hub: any) => {
                const IconComponent = ICON_MAP[hub.icon_name] || Briefcase;

                return (
                  <TouchableOpacity
                    key={hub.id}
                    activeOpacity={0.82}
                    style={{ flexBasis: '48.5%' }}
                    onPress={() => router.push(hub.route as any)}
                  >
                    <GlassCard
                      style={[
                        styles.hubCard,
                        {
                          borderColor: colors.border,
                          flexDirection: 'column', // Overrides the row layout completely
                          alignItems: 'flex-start', // Resets horizontal alignment
                          padding: 14,
                          marginBottom: 0,
                          alignSelf: 'flex-start', // FIX: Prevents card from stretching down the screen height
                          width: '100%',           // Fills the 48.5% touchable bounds cleanly
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.hubIconWrap,
                          {
                            backgroundColor: `${colors.primary}10`,
                            marginBottom: 12,
                            marginRight: 0, // Clears the original right margin layout gap
                          },
                        ]}
                      >
                        <IconComponent
                          size={22}
                          color={colors.primary}
                        />
                      </View>

                      <View style={{ width: '100%' }}>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.hubTitle,
                            {
                              color: colors.text,
                            },
                          ]}
                        >
                          {hub.name}
                        </Text>

                        <Text
                          numberOfLines={2}
                          style={[
                            styles.hubDesc,
                            {
                              color: colors.textMuted,
                              marginTop: 2,
                            },
                          ]}
                        >
                          {hub.desc}
                        </Text>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                );
              })}
              {row.length === 1 && <View style={{ flexBasis: '48.5%' }} />}
            </View>
          ))
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}
// ======================================================
// CUSTOMER VIEW
// ======================================================

function CustomerDiscoverView() {
  const { colors, theme } = useApp();

  const router = useRouter();

  const [selectedCategory, setSelectedCategory] =
    useState('All');

  const [searchQuery, setSearchQuery] =
    useState('');

  const CATEGORIES = [
    'All',
    'Food',
    'Salon',
    'Laundry',
    'Books',
    'Hostel',
  ];

  const PARTNER_SHOPS = [
    {
      id: '1',
      name: 'The Royal Cut',
      type: 'Salon',
      rating: '4.9',
      distance: '0.5 km',
      image:
        'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&q=80',
      route: '/shop/Barber',
    },

    {
      id: '2',
      name: 'Quick Wash Laundry',
      type: 'Laundry',
      rating: '4.7',
      distance: '1.2 km',
      image:
        'https://images.unsplash.com/photo-1545180856-f2868ff128c7?w=400&q=80',
      route: '/shop/Laundry',
    },

    {
      id: '3',
      name: 'Sharma Tiffin Mess',
      type: 'Food',
      rating: '4.9',
      distance: '0.2 km',
      image:
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
      route: '/shop/Tiffin',
    },

    {
      id: '4',
      name: 'Study Hub Library',
      type: 'Books',
      rating: '4.8',
      distance: '0.7 km',
      image:
        'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&q=80',
      route: '/shop/Library',
    },
  ];

  const filteredShops = useMemo(() => {
    return PARTNER_SHOPS.filter((shop) => {
      const categoryMatch =
        selectedCategory === 'All' ||
        shop.type.toLowerCase() ===
          selectedCategory.toLowerCase();

      const searchMatch =
        shop.name
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        shop.type
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          );

      return (
        categoryMatch && searchMatch
      );
    });
  }, [
    selectedCategory,
    searchQuery,
  ]);

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
          title: 'Discover',

          headerStyle: {
            backgroundColor:
              colors.background,
          },

          headerTitleStyle: {
            color: colors.text,
            fontWeight: '800',
          },

          headerTintColor:
            colors.primary,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* HERO */}

        <TouchableOpacity
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[
              '#F59E0B',
              colors.accent,
            ]}
            style={styles.heroCard}
          >
            <View style={styles.heroIcon}>
              <Sparkles
                size={20}
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
                  styles.heroTitle
                }
              >
                Student Pay Rewards
              </Text>

              <Text
                style={
                  styles.heroSub
                }
              >
                Earn cashback at verified
                campus stores using
                SevaStack QR Pay.
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* SEARCH */}

        <SearchBar
          colors={colors}
          value={searchQuery}
          onChangeText={
            setSearchQuery
          }
          placeholder="Search nearby services..."
          onClear={() =>
            setSearchQuery('')
          }
        />

        {/* CATEGORY PILLS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={{
            paddingRight: 12,
            marginBottom: 18,
          }}
        >
          {CATEGORIES.map((cat) => {
            const active =
              selectedCategory === cat;

            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.85}
                onPress={() =>
                  setSelectedCategory(cat)
                }
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor:
                      active
                        ? colors.primary
                        : colors.surface,

                    borderColor:
                      active
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: active
                        ? '#FFF'
                        : colors.text,
                    },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* SECTION */}

        <View
          style={
            styles.rowBetween
          }
        >
          <SectionHeader
            title="Verified Partners"
            colors={colors}
            noMargin
          />

          <Text
            style={[
              styles.countText,
              {
                color:
                  colors.textMuted,
              },
            ]}
          >
            {filteredShops.length} nearby
          </Text>
        </View>

        {/* GRID */}

        {filteredShops.length === 0 ? (
          <EmptyState
            colors={colors}
            text="No matching shops found."
          />
        ) : (
          <View
            style={
              styles.hubGrid
            }
          >
            {filteredShops.map(
              (shop) => (
                <TouchableOpacity
                  key={shop.id}
                  activeOpacity={0.85}
                  style={
                    styles.hubItem
                  }
                  onPress={() =>
                    router.push(
                      shop.route as any
                    )
                  }
                >
                  <GlassCard
                    style={[
                      styles.hubCard,
                      {
                        borderColor:
                          colors.border,

                        backgroundColor:
                          colors.surface,
                      },
                    ]}
                  >
                    {/* IMAGE */}

                    <Image
                      source={{
                        uri: shop.image,
                      }}
                      style={{
  width: '100%',
  height: 110,

  borderTopLeftRadius: 18,
  borderTopRightRadius: 18,

  marginBottom: 10,
}}
                    />

                    {/* TITLE */}

                    <Text
                      numberOfLines={1}
                      style={[
                        styles.hubTitle,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      {shop.name}
                    </Text>

                    {/* TYPE */}

                    <Text
                      style={{
                        color:
                          colors.primary,

                        fontSize: 11,
                        fontWeight: '700',

                        marginBottom: 8,
                      }}
                    >
                      {shop.type}
                    </Text>

                    {/* META */}

                    <View
                      style={{
                        flexDirection:
                          'row',

                        alignItems:
                          'center',

                        justifyContent:
                          'space-between',
                      }}
                    >
                      <View
                        style={{
                          flexDirection:
                            'row',

                          alignItems:
                            'center',

                          gap: 4,
                        }}
                      >
                        <Star
                          size={11}
                          color="#F59E0B"
                          fill="#F59E0B"
                        />

                        <Text
                          style={{
                            color:
                              colors.text,

                            fontSize: 10,
                            fontWeight:
                              '700',
                          }}
                        >
                          {shop.rating}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection:
                            'row',

                          alignItems:
                            'center',

                          gap: 3,
                        }}
                      >
                        <MapPin
                          size={10}
                          color={
                            colors.textMuted
                          }
                        />

                        <Text
                          style={{
                            color:
                              colors.textMuted,

                            fontSize: 10,
                            fontWeight:
                              '700',
                          }}
                        >
                          {shop.distance}
                        </Text>
                      </View>
                    </View>

                    {/* BUTTON */}

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() =>
                        router.push(
                          shop.route as any
                        )
                      }
                      style={[
                        {
                          marginTop: 12,

                          height: 34,

                          borderRadius: 12,

                          justifyContent:
                            'center',

                          alignItems:
                            'center',

                          backgroundColor:
                            colors.primary,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: '#FFF',
                          fontSize: 11,
                          fontWeight: '800',
                        }}
                      >
                        Explore
                      </Text>
                    </TouchableOpacity>
                  </GlassCard>
                </TouchableOpacity>
              )
            )}
          </View>
        )}

        <View
          style={{
            height: 120,
          }}
        />
      </ScrollView>
    </View>
  );
}

// ======================================================
// SEARCH BAR
// ======================================================

function SearchBar({
  colors,
  value,
  onChangeText,
  placeholder,
  onClear,
}: any) {
  return (
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
        color={colors.textMuted}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={
          colors.textMuted
        }
        style={[
          styles.searchInput,
          {
            color: colors.text,
          },
        ]}
      />

      {value ? (
        <TouchableOpacity
          onPress={onClear}
        >
          <X
            size={18}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ======================================================
// SECTION HEADER
// ======================================================

function SectionHeader({
  title,
  colors,
  noMargin,
}: any) {
  return (
    <Text
      style={[
        styles.sectionTitle,
        {
          color: colors.text,
          marginBottom: noMargin
            ? 0
            : 14,
        },
      ]}
    >
      {title}
    </Text>
  );
}

// ======================================================
// EMPTY
// ======================================================

function EmptyState({
  colors,
  text,
}: any) {
  return (
    <View style={styles.emptyWrap}>
      <Text
        style={[
          styles.emptyText,
          {
            color:
              colors.textMuted,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}
// ======================================================
// STYLES
// ======================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 32,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  // ======================================================
  // HERO
  // ======================================================

  heroCard: {
    borderRadius: 22,

    padding: 16,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 12,

    marginBottom: 18,

    minHeight: 110,

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 5,
        },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },

      android: {
        elevation: 3,
      },
    }),
  },

  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,

    backgroundColor:
      'rgba(255,255,255,0.16)',

    justifyContent: 'center',
    alignItems: 'center',
  },

  heroTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 3,
    letterSpacing: -0.3,
  },

  heroSub: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },

  // ======================================================
  // SECTION
  // ======================================================

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginTop: 4,
  },

  countText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ======================================================
  // TOOLS
  // ======================================================

  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',

    rowGap: 10,

    marginBottom: 20,
  },

  toolCard: {
    width: '48%',

    borderRadius: 18,
    borderWidth: 1,

    paddingVertical: 14,
    paddingHorizontal: 10,

    alignItems: 'center',
  },

  toolIconWrap: {
    width: 44,
    height: 44,

    borderRadius: 14,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 8,
  },

  toolLabel: {
    fontSize: 11,
    fontWeight: '800',
  },

  // ======================================================
  // SEARCH
  // ======================================================

  searchBar: {
    height: 46,

    borderRadius: 16,
    borderWidth: 1,

    paddingHorizontal: 14,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 8,

    marginBottom: 16,
  },

  searchInput: {
    flex: 1,

    fontSize: 14,
    fontWeight: '600',
  },

  // ======================================================
  // HUB GRID
  // ======================================================

  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',

    rowGap: 10,
  },

  hubItem: {
    width: '48%',
  },

hubCard: {
  borderRadius: 18,
  borderWidth: 1,

  overflow: 'hidden',

  padding: 0,

  minHeight: 220,
},

  hubIconWrap: {
    width: 44,
    height: 44,

    borderRadius: 14,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 10,
  },

  hubTitle: {
    fontSize: 13,
    fontWeight: '800',

    marginBottom: 4,

    letterSpacing: -0.2,
  },

  hubDesc: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },

  arrowWrap: {
    width: 30,
    height: 30,

    borderRadius: 10,

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,

    marginLeft: 8,
  },

  // ======================================================
  // CATEGORY PILLS
  // ======================================================

  categoryPill: {
    height: 34,

    paddingHorizontal: 14,

    borderRadius: 16,

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,

    marginRight: 8,
  },

  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ======================================================
  // SHOPS
  // ======================================================

  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',

    padding: 10,

    borderRadius: 20,
    borderWidth: 1,

    marginBottom: 12,
  },

  shopImage: {
    width: 68,
    height: 68,

    borderRadius: 16,

    marginRight: 12,
  },

  shopName: {
    fontSize: 14,
    fontWeight: '800',

    marginBottom: 2,
  },

  shopType: {
    fontSize: 11,
    fontWeight: '700',

    marginBottom: 6,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,
  },

  metaText: {
    fontSize: 10,
    fontWeight: '700',
  },

  dot: {
    width: 4,
    height: 4,

    borderRadius: 2,

    marginHorizontal: 8,
  },

  bookBtn: {
    paddingHorizontal: 12,

    height: 34,

    borderRadius: 12,

    justifyContent: 'center',
    alignItems: 'center',

    marginLeft: 8,
  },

  bookBtnText: {
    color: '#FFF',

    fontSize: 11,
    fontWeight: '800',
  },

  // ======================================================
  // EMPTY
  // ======================================================

  emptyWrap: {
    paddingVertical: 34,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 12,
    fontWeight: '600',
  },
});