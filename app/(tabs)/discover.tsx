import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Platform, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
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
  Search,
  X,
  Star
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { Spacing, Colors, Typography } from '@/constants/Theme';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

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
  GraduationCap
};

export default function DiscoverScreen() {
  const { userRole, colors } = useApp();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      {userRole === 'customer' ? <CustomerDiscoverView /> : <DiscoverScreenMerchant />}
    </SafeAreaView>
  );
}

function DiscoverScreenMerchant() {
  const { colors, businessType, theme, t } = useApp();
  const [hubs, setHubs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const TOOLS = [
    { id: 'inventory', name: t('inventory'), icon: Package, color: '#6366F1', route: '/tools/inventory' },
    { id: 'expenses', name: 'Expense Tracker', icon: PieChart, color: '#EF4444', route: '/tools/expenses' },
    { id: 'analytics', name: 'Sales Analytics', icon: TrendingUp, color: '#10B981', route: '/profile/performance' },
    { id: 'security', name: 'Access Control', icon: ShieldCheck, color: '#F59E0B', route: '/tools/security' },
  ];

  const DEFAULT_HUBS = [
    { id: 'tuition', name: 'Tuition & Coaching Hub', desc: 'Doubt clinic slot bookings, mock grade trackers & notes drawers', icon_name: 'GraduationCap', route: '/business/tuition-manager' },
    { id: 'repair', name: 'Handyman Room Repairs', desc: 'Category repair tickets, spare parts billing & completion OTPs', icon_name: 'Hammer', route: '/business/repair-manager' },
    { id: 'movers', name: 'Transport & Hostel Movers', desc: 'Luggage inventories, shift quotes & transit trackers', icon_name: 'Truck', route: '/business/movers-manager' },
    { id: 'cab', name: 'Cab & Travel Pooler', desc: 'Destination clustering, fare splits & advance token cards', icon_name: 'Car', route: '/business/cab-manager' },
    { id: 'cafe', name: 'Cafe & Quick-Bites Hub', desc: 'Prep tokenizer, PG split-billing & happy study hours', icon_name: 'Coffee', route: '/business/cafe-manager' },
    { id: 'gym', name: 'Gym & Fitness Hub', desc: 'Membership passes, locker keys & personalized diet charts', icon_name: 'Activity', route: '/business/gym-manager' },
    { id: 'tailor', name: 'Boutique & Tailor Hub', desc: 'Garment stitching timelines, fitment cards & fitting trials', icon_name: 'Shirt', route: '/business/tailor-manager' },
    { id: 'library', name: 'Library & Study Hub', desc: 'Live study desks map, silence focus alerts & hourly cards', icon_name: 'BookOpen', route: '/business/library-manager' },
    { id: 'stationery', name: 'Stationery & Print Hub', desc: 'PDF print specifications, syllabus packs & pickup slots', icon_name: 'Printer', route: '/business/stationery-manager' },
    { id: 'barber', name: 'Barber & Salon Hub', desc: 'Live styling chairs status, queues & dye allergies', icon_name: 'Scissors', route: '/business/barber-manager' },
    { id: 'laundry', name: 'Laundry & Dry Cleaning Hub', desc: 'Wash timelines, delicate fabric warnings & slots', icon_name: 'Waves', route: '/business/laundry-manager' },
    { id: 'kirana', name: 'Kirana & Khata Hub', desc: 'Credit ceilings, repayments & expiry alerts', icon_name: 'ShoppingBag', route: '/business/kirana-manager' },
    { id: 'milk', name: 'Milk & Morning Dairy Hub', desc: 'Volume updates, pauses & bottle audits', icon_name: 'Truck', route: '/business/milk-manager' },
    { id: 'tiffin', name: 'Mess & Tiffin Hub', desc: 'Subscriptions, Menu Planner & Runs', icon_name: 'Utensils', route: '/business/tiffin-manager' },
    { id: 'chemist', name: 'Chemist & Meds', desc: 'Prescriptions, POS Billing & Interactions', icon_name: 'Pill', route: '/business/chemist-shop' },
    { id: 'hostel', name: t('hostel_hub'), desc: 'Rent, Rooms & Students', icon_name: 'Globe', route: '/business/hostel-manager' },
    { id: 'market', name: t('local_market'), desc: 'Partner with nearby shops', icon_name: 'MapPin', route: '/business/marketplace' },
  ];

  useEffect(() => {
    async function loadBusinessTypes() {
      try {
        const { data, error } = await supabase
          .from('business_types')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        if (data && data.length > 0) {
          const mapped = data.map((row: any) => ({
            id: row.id,
            name: row.name,
            desc: row.description || '',
            icon_name: row.icon_name || 'Briefcase',
            route: row.route || `/business/${row.id}-manager`
          }));
          setHubs(mapped);
        } else {
          setHubs(DEFAULT_HUBS);
        }
      } catch (err) {
        console.warn("Error fetching dynamic business types, falling back:", err);
        setHubs(DEFAULT_HUBS);
      }
    }
    loadBusinessTypes();
  }, []);

  const filteredHubs = hubs.filter(hub => 
    hub.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    hub.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ 
        title: 'Discover Hubs',
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text, fontWeight: '800' },
        headerTintColor: colors.primary
      }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Featured Growth Banner */}
        <TouchableOpacity onPress={() => router.push('/catalog/ai-finder')} activeOpacity={0.9}>
          <GlassCard style={styles.featuredCard}>
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.featuredGradient}
            >
              <View style={styles.featuredContent}>
                 <View style={styles.featuredBadge}>
                   <Zap size={24} color="#FFF" />
                 </View>
                 <View style={{ flex: 1 }}>
                     <Text style={styles.featuredTitle}>{t('growth_engine')}</Text>
                     <Text style={styles.featuredSub}>Boost your {businessType} visibility by 40% using AI insights</Text>
                 </View>
                 <ChevronRight size={20} color="#FFF" />
              </View>
            </LinearGradient>
          </GlassCard>
        </TouchableOpacity>

        {/* Operational Tools Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('operational_tools')}</Text>
        <View style={styles.toolsGrid}>
           {TOOLS.map((tool) => (
             <TouchableOpacity 
               key={tool.id} 
               style={[styles.toolItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
               onPress={() => router.push(tool.route as any)}
               activeOpacity={0.7}
             >
                <View style={[styles.toolIcon, { backgroundColor: tool.color + '12' }]}>
                   <tool.icon size={22} color={tool.color} />
                </View>
                <Text style={[styles.toolName, { color: colors.text }]}>{tool.name}</Text>
             </TouchableOpacity>
           ))}
        </View>

        {/* Search bar for hubs */}
        <View style={styles.hubsHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 0 }]}>Specialized Ecosystems</Text>
          <Text style={[styles.hubsCount, { color: colors.textMuted }]}>{filteredHubs.length} available</Text>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            placeholder="Search active business ecosystems..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Specialized Ecosystems Cards */}
        {filteredHubs.map((hub) => {
          const IconComponent = ICON_MAP[hub.icon_name] || Briefcase;
          return (
            <GlassCard key={hub.id} style={styles.hubGlass}>
              <TouchableOpacity 
                style={styles.hubInner}
                onPress={() => router.push(hub.route as any)}
                activeOpacity={0.8}
              >
                 <View style={[styles.hubIcon, { backgroundColor: colors.primary + '08' }]}>
                    <IconComponent size={24} color={colors.primary} />
                 </View>
                 <View style={styles.hubInfo}>
                    <Text style={[styles.hubName, { color: colors.text }]}>{hub.name}</Text>
                    <Text style={[styles.hubDesc, { color: colors.textMuted }]}>{hub.desc}</Text>
                 </View>
                 <View style={[styles.goBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
                    <ChevronRight size={16} color={colors.text} />
                 </View>
              </TouchableOpacity>
            </GlassCard>
          );
        })}

        {filteredHubs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTxt, { color: colors.textMuted }]}>No matching ecosystems found.</Text>
          </View>
        ) : null}

        <View style={{ height: 100 }} />
      </ScrollView>
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
  featuredCard: {
    padding: 0,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  featuredGradient: {
    padding: 16,
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featuredBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  featuredTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  featuredSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  toolItem: {
    width: '48%',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  toolIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolName: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  hubsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 10,
  },
  hubsCount: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  hubGlass: {
    padding: 0,
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  hubInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  hubIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hubInfo: {
    flex: 1,
    gap: 2,
  },
  hubName: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  hubDesc: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  goBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyTxt: {
    fontSize: 12,
    fontWeight: '600',
  }
});

function CustomerDiscoverView() {
  const { colors, theme, t } = useApp();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const CATEGORIES = ['All', 'Food', 'Salon', 'Laundry', 'Hostel', 'Books'];

  const PARTNER_SHOPS = [
    { id: 'Barber', name: "The Royal Cut", type: "Barber", rating: "4.9", distance: "0.5 km", image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&q=80", route: "/shop/Barber" },
    { id: 'Tailor', name: "Elite Tailors", type: "Tailor", rating: "4.8", distance: "0.9 km", image: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=400&q=80", route: "/shop/Tailor" },
    { id: 'Laundry', name: "Quick Wash Laundry", type: "Laundry", rating: "4.7", distance: "1.2 km", image: "https://images.unsplash.com/photo-1545180856-f2868ff128c7?w=400&q=80", route: "/shop/Laundry" },
    { id: 'Tiffin', name: "Sharma Tiffin Mess", type: "Food", rating: "4.9", distance: "0.2 km", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80", route: "/shop/Tiffin" },
    { id: 'Library', name: "Kota Library Hub", type: "Library", rating: "4.6", distance: "0.4 km", image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80", route: "/shop/Library" },
    { id: 'Stationery', name: "Saraswati Stationery", type: "Books", rating: "4.8", distance: "0.6 km", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80", route: "/shop/Stationery" }
  ];

  const filteredShops = PARTNER_SHOPS.filter(shop => {
    const matchesCategory = selectedCategory === 'All' || shop.type.toLowerCase() === selectedCategory.toLowerCase() || (selectedCategory === 'Books' && shop.type === 'Library') || (selectedCategory === 'Books' && shop.type === 'Stationery');
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || shop.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ 
        title: t('explore_services'),
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text, fontWeight: '800' },
        headerTintColor: colors.primary
      }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Deal Promo Banner */}
        <GlassCard style={styles.featuredCard}>
          <LinearGradient
            colors={[colors.secondary || '#F59E0B', colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.featuredGradient}
          >
            <View style={styles.featuredContent}>
               <View style={[styles.featuredBadge, { backgroundColor: 'rgba(255,255,255,0.2)', width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }]}>
                 <Sparkles size={22} color="#FFF" />
               </View>
               <View style={{ flex: 1, marginLeft: 12 }}>
                   <Text style={[styles.featuredTitle, { color: '#FFF', fontSize: 16, fontWeight: '800' }]}>Student Pay Special</Text>
                   <Text style={[styles.featuredSub, { color: '#FFF', fontSize: 11, fontWeight: '600', marginTop: 2, opacity: 0.9 }]}>Get Flat 20% Cashback at local stores using SevaStack QR Pay!</Text>
               </View>
            </View>
          </LinearGradient>
        </GlassCard>

        {/* Search bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 12 }]}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            placeholder={t('search_nearby_services')}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Categories scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16, maxHeight: 42 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: selectedCategory === cat ? colors.primary : colors.surface,
                borderColor: selectedCategory === cat ? colors.primary : colors.border,
                borderWidth: 1,
                marginRight: 8,
                height: 38,
                justifyContent: 'center'
              }}
            >
              <Text style={{
                color: selectedCategory === cat ? '#FFF' : colors.text,
                fontWeight: '700',
                fontSize: 12
              }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Shop Listings */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 8 }]}>{t('verified_partner_shops')}</Text>
        {filteredShops.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTxt, { color: colors.textMuted }]}>No matching shops found nearby.</Text>
          </View>
        ) : (
          filteredShops.map(shop => (
            <GlassCard key={shop.id} style={{ borderRadius: 20, padding: 12, marginBottom: 12, borderColor: colors.border, borderWidth: 1 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Image source={{ uri: shop.image }} style={{ width: 70, height: 70, borderRadius: 12 }} />
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>{shop.name}</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: colors.primary, marginTop: 2 }}>{shop.type}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>{shop.rating}</Text>
                    </View>
                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textMuted }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      <MapPin size={12} color={colors.textMuted} />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted }}>{shop.distance}</Text>
                    </View>
                  </View>
                </View>
                <View style={{ justifyContent: 'center' }}>
                  <TouchableOpacity
                    onPress={() => router.push(shop.route as any)}
                    style={{
                      backgroundColor: colors.primary,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 12
                    }}
                  >
                    <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 11 }}>{t('book_now')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          ))
        )}
      </ScrollView>
    </View>
  );
}
