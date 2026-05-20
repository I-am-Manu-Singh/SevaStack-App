import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { StatusBar } from 'expo-status-bar';

import {
  Plus,
  Scissors,
  Shirt,
  Waves,
  Coffee,
  ShoppingBag,
  Stethoscope,
  Truck,
  Utensils,
  Gem,
  X,
  Save,
  BookOpen,
} from 'lucide-react-native';

import { Spacing } from '@/constants/Theme';
import { Service, BusinessType } from '@/constants/Types';
import { useApp } from '@/lib/AppContext';
import { CatalogItemWidget } from '@/components/CatalogWidgets';
import { GlassCard } from '@/components/GlassCard';

// ======================================================
// BUSINESS TYPES
// ======================================================

const BUSINESS_TYPES: {
  type: BusinessType;
  icon: any;
  label: string;
}[] = [
  { type: 'Barber', icon: Scissors, label: 'Salon' },
  { type: 'Tailor', icon: Shirt, label: 'Tailor' },
  { type: 'Kirana', icon: ShoppingBag, label: 'Kirana' },
  { type: 'Pharmacy', icon: Stethoscope, label: 'Medical' },
  { type: 'Tiffin', icon: Utensils, label: 'Tiffin' },
  { type: 'Milk', icon: Truck, label: 'Dairy' },
  { type: 'Laundry', icon: Waves, label: 'Laundry' },
  { type: 'Cafe', icon: Coffee, label: 'Cafe' },
  { type: 'Jewelry', icon: Gem, label: 'Jewelry' },
];

// ======================================================
// PRESET IMAGES
// ======================================================

const PRESET_IMAGES = [
  {
    label: 'Snacks / Food',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
  },
  {
    label: 'Beverages',
    url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&q=80',
  },
  {
    label: 'Salon / Haircut',
    url: 'https://images.unsplash.com/photo-1521566652839-697aa473761a?w=400&q=80',
  },
  {
    label: 'Laundry Care',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80',
  },
  {
    label: 'Stationery / Books',
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&q=80',
  },
  {
    label: 'General / Tiffin',
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
  },
];

// ======================================================
// SCREEN
// ======================================================

export default function CatalogManager() {
  const {
    colors,
    theme,
    userRole,
    businessType,
    profile,
  } = useApp();

  const [selectedType, setSelectedType] =
    useState<BusinessType>(businessType || 'Barber');

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeMerchantId, setActiveMerchantId] = useState<string | null>(
    profile?.id || null
  );

  const [merchantName, setMerchantName] = useState('');

  const [isModalVisible, setModalVisible] = useState(false);

  const [editingService, setEditingService] =
    useState<Service | null>(null);

  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
    unit: '',
    image: PRESET_IMAGES[0].url,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  // ======================================================
  // LOAD DATA
  // ======================================================

  const loadCatalogData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      let currentMerchantId = profile?.id;
      let bizType = businessType || 'Barber';

      if (userRole === 'merchant' || !currentMerchantId) {
        const { data: profileRes } = await supabase
          .from('merchants')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileRes) {
          currentMerchantId = profileRes.id;
          bizType = profileRes.business_type || 'Barber';

          setActiveMerchantId(profileRes.id);
          setMerchantName(profileRes.business_name);
          setSelectedType(bizType);
        }
      }

      let query = supabase.from('services').select('*');

      if (userRole === 'merchant' && currentMerchantId) {
        query = query.eq('merchant_id', currentMerchantId);
      } else {
        query = query.eq('business_type', selectedType);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const mapped: Service[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          category: item.category || 'General',
          unit: item.unit || '',
          businessType: item.business_type as BusinessType,
          image: item.image || PRESET_IMAGES[0].url,
        }));

        setServices(mapped);
      }
    } catch (e: any) {
      console.warn(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, [selectedType, userRole]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCatalogData();
  }, [selectedType, userRole]);

  // ======================================================
  // FILTERS
  // ======================================================

  const filteredServices = services.filter(
    (s) =>
      searchQuery === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    'All',
    ...Array.from(new Set(filteredServices.map((s) => s.category))),
  ];

  const finalServices =
    activeTab === 'All'
      ? filteredServices
      : filteredServices.filter(
          (s) => s.category === activeTab
        );

  // ======================================================
  // MODAL
  // ======================================================

  const openModal = (service: Service | null = null) => {
    if (service) {
      setEditingService(service);

      setForm({
        name: service.name,
        price: service.price.toString(),
        category: service.category,
        unit: service.unit || '',
        image: service.image || PRESET_IMAGES[0].url,
      });
    } else {
      setEditingService(null);

      setForm({
        name: '',
        price: '',
        category: '',
        unit: '',
        image: PRESET_IMAGES[0].url,
      });
    }

    setModalVisible(true);
  };

  // ======================================================
  // SAVE
  // ======================================================

  const handleSave = async () => {
    if (!form.name || !form.price) {
      Alert.alert(
        'Missing Fields',
        'Name and price are required.'
      );

      return;
    }

    try {
      const priceVal = parseFloat(form.price);

      if (isNaN(priceVal)) {
        Alert.alert(
          'Invalid Price',
          'Price must be numeric.'
        );

        return;
      }

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update({
            name: form.name,
            price: priceVal,
            category: form.category || 'General',
            unit: form.unit,
            image: form.image,
          })
          .eq('id', editingService.id);

        if (error) throw error;

        Alert.alert(
          'Updated',
          'Catalog item updated successfully.'
        );
      } else {
        if (!activeMerchantId) {
          Alert.alert(
            'Merchant Missing',
            'No merchant profile linked.'
          );

          return;
        }

        const { error } = await supabase
          .from('services')
          .insert([
            {
              merchant_id: activeMerchantId,
              name: form.name,
              price: priceVal,
              category: form.category || 'General',
              unit: form.unit,
              business_type: selectedType,
              image: form.image,
            },
          ]);

        if (error) throw error;

        Alert.alert(
          'Published',
          'Product added to catalog.'
        );
      }

      setModalVisible(false);
      loadCatalogData();
    } catch (err: any) {
      Alert.alert('Operation Failed', err.message);
    }
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Item',
      'Remove this product permanently?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('services')
                .delete()
                .eq('id', id);

              if (error) throw error;

              Alert.alert(
                'Deleted',
                'Item removed successfully.'
              );

              loadCatalogData();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.loaderWrap,
          {
            backgroundColor: colors.background,
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
          backgroundColor: colors.background,
        },
      ]}
    >
      <StatusBar
        style={theme === 'dark' ? 'light' : 'dark'}
      />

      <Stack.Screen
        options={{
          title: 'Catalog Manager',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            fontWeight: '800',
            color: colors.text,
          },
        }}
      />

      {/* HERO */}

      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.heroTopRow}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.heroTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              {userRole === 'merchant'
                ? merchantName || 'Merchant Catalog'
                : `${selectedType} Catalog`}
            </Text>

            <Text
              style={[
                styles.heroSub,
                {
                  color: colors.textMuted,
                },
              ]}
            >
              Manage pricing, inventory categories and
              catalog visibility. Humanity replaced paper
              menus with floating rectangles and APIs.
            </Text>
          </View>

          <View
            style={[
              styles.heroBadge,
              {
                backgroundColor: `${colors.primary}15`,
              },
            ]}
          >
            <BookOpen
              size={18}
              color={colors.primary}
            />

            <Text
              style={[
                styles.heroBadgeText,
                {
                  color: colors.primary,
                },
              ]}
            >
              {finalServices.length}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.innerSearch,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.searchInput,
              {
                color: colors.text,
              },
            ]}
            placeholder="Search items..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {searchQuery ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSearchQuery('')}
            >
              <X
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* CONTENT */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* ADMIN SWITCHER */}

        {userRole === 'admin' && (
          <View style={{ marginBottom: 16 }}>
            <Text
              style={[
                styles.switcherTitle,
                {
                  color: colors.textMuted,
                },
              ]}
            >
              FILTER BY CATEGORY
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {BUSINESS_TYPES.map(
                ({ type, icon: Icon, label }) => (
                  <TouchableOpacity
                    key={type}
                    activeOpacity={0.85}
                    onPress={() => {
                      setSelectedType(type);
                      setActiveTab('All');
                    }}
                    style={[
                      styles.typeBtn,
                      {
                        backgroundColor:
                          colors.surface,
                        borderColor: colors.border,
                      },
                      selectedType === type && {
                        backgroundColor:
                          colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Icon
                      size={14}
                      color={
                        selectedType === type
                          ? '#FFF'
                          : colors.textMuted
                      }
                    />

                    <Text
                      style={[
                        styles.typeBtnText,
                        {
                          color:
                            selectedType === type
                              ? '#FFF'
                              : colors.textMuted,
                        },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>
          </View>
        )}

        {/* CATEGORY TABS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.8}
              onPress={() => setActiveTab(cat)}
              style={[
                styles.tabBtn,
                {
                  backgroundColor: colors.surface,
                },
                activeTab === cat && {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === cat
                        ? '#FFF'
                        : colors.textMuted,
                  },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SECTION */}

        <View style={styles.sectionHeader}>
          <View>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              {userRole === 'merchant'
                ? merchantName || 'My Catalog'
                : `${selectedType} Hub`}
            </Text>

            <Text
              style={[
                styles.sectionSub,
                {
                  color: colors.textMuted,
                },
              ]}
            >
              {finalServices.length} registered items
            </Text>
          </View>
        </View>

        {/* ITEMS */}

        {finalServices.map((service) => (
          <CatalogItemWidget
            key={service.id}
            item={service}
            onEdit={() => openModal(service)}
            onDelete={() =>
              handleDelete(service.id)
            }
          />
        ))}

        {/* EMPTY */}

        {finalServices.length === 0 && (
          <GlassCard
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIconWrap,
                {
                  backgroundColor: `${colors.primary}12`,
                },
              ]}
            >
              <ShoppingBag
                size={34}
                color={colors.primary}
              />
            </View>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Catalog Empty
            </Text>

            <Text
              style={[
                styles.emptySub,
                {
                  color: colors.textMuted,
                },
              ]}
            >
              Add your first item to begin taking
              orders and displaying products publicly.
            </Text>

            {userRole === 'merchant' && (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.emptyBtn,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
                onPress={() => openModal()}
              >
                <Plus size={18} color="#FFF" />

                <Text style={styles.emptyBtnTxt}>
                  Add First Item
                </Text>
              </TouchableOpacity>
            )}
          </GlassCard>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB */}

      {userRole === 'merchant' && (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.fab,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
            },
          ]}
          onPress={() => openModal()}
        >
          <Plus size={26} color="#FFF" />
        </TouchableOpacity>
      )}

           {/* MODAL */}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() =>
          setModalVisible(false)
        }
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          {/* FIX: Completely removed the inner redundant <TouchableOpacity style={{ width: '100%' }}> wrapper that was forcing full screen layout stretching */}
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                width: '100%', // Ensures the layout fills the complete device width canvas
                borderBottomLeftRadius: 0,  // Flattens out the bottom frame against the bezel
                borderBottomRightRadius: 0, // Flattens out the bottom frame against the bezel
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {editingService
                  ? 'Edit Item'
                  : 'Add Catalog Item'}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setModalVisible(false)
                }
              >
                <X
                  size={22}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
            >
              <Text
                style={[
                  styles.inputLabel,
                  {
                    color: colors.textMuted,
                  },
                ]}
              >
                Product Name
              </Text>

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    color: colors.text,
                    borderColor:
                      colors.border,
                    backgroundColor:
                      colors.background,
                  },
                ]}
                value={form.name}
                onChangeText={(t) =>
                  setForm({
                    ...form,
                    name: t,
                  })
                }
                placeholder="Paneer Butter Masala"
                placeholderTextColor={
                  colors.textMuted
                }
              />

              <View style={styles.modalRow}>
                <View style={styles.flex1}>
                  <Text
                    style={[
                      styles.inputLabel,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    Price
                  </Text>

                  <TextInput
                    style={[
                      styles.modalInput,
                      {
                        color: colors.text,
                        borderColor:
                          colors.border,
                        backgroundColor:
                          colors.background,
                      },
                    ]}
                    value={form.price}
                    keyboardType="numeric"
                    onChangeText={(t) =>
                      setForm({
                        ...form,
                        price: t,
                      })
                    }
                    placeholder="120"
                    placeholderTextColor={
                      colors.textMuted
                    }
                  />
                </View>

                <View style={styles.flex1}>
                  <Text
                    style={[
                      styles.inputLabel,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    Unit
                  </Text>

                  <TextInput
                    style={[
                      styles.modalInput,
                      {
                        color: colors.text,
                        borderColor:
                          colors.border,
                        backgroundColor:
                          colors.background,
                    },
                  ]}
                  value={form.unit}
                  onChangeText={(t) =>
                    setForm({
                      ...form,
                      unit: t,
                    })
                  }
                  placeholder="plate"
                  placeholderTextColor={
                    colors.textMuted
                  }
                />
              </View>
            </View>

            <Text
              style={[
                styles.inputLabel,
                {
                  color: colors.textMuted,
                },
              ]}
            >
              Category
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  color: colors.text,
                  borderColor:
                    colors.border,
                  backgroundColor:
                    colors.background,
                },
              ]}
              value={form.category}
              onChangeText={(t) =>
                setForm({
                  ...form,
                  category: t,
                })
              }
              placeholder="Lunch Specials"
              placeholderTextColor={
                colors.textMuted
              }
            />

            {/* IMAGE PICKER */}

            <Text
              style={[
                styles.inputLabel,
                {
                  color: colors.textMuted,
                  marginTop: 18,
                },
              ]}
            >
              Thumbnail Style
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              style={{ marginTop: 10 }}
            >
              {PRESET_IMAGES.map((img) => (
                <TouchableOpacity
                  key={img.url}
                  activeOpacity={0.85}
                  onPress={() =>
                    setForm({
                      ...form,
                      image: img.url,
                    })
                  }
                  style={[
                    styles.presetCard,
                    {
                      borderColor:
                        form.image === img.url
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                >
                  <Image
                    source={{
                      uri: img.url,
                    }}
                    style={styles.presetImg}
                  />

                  <Text
                    style={[
                      styles.presetLabel,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {img.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.saveBtn,
                {
                  backgroundColor:
                    colors.primary,
                  marginBottom: 24, // Clean bottom structural alignment padding
                },
              ]}
              onPress={handleSave}
            >
              <Save size={18} color="#FFF" />

              <Text style={styles.saveBtnTxt}>
                {editingService
                  ? 'Save Changes'
                  : 'Publish Product'}
              </Text>
            </TouchableOpacity>

            {/* FIX: Removed the empty <View style={{ height: 40 }} /> container from the ScrollView root to clean up bottom space bounds */}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
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
    paddingTop: 4,
    paddingBottom: 120,
  },

  heroCard: {
    marginHorizontal: Spacing.md,
    marginTop: 12,
    marginBottom: 14,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  heroSub: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    paddingRight: 8,
  },

  heroBadge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },

  innerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },

  switcherTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
  },

  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1,
    gap: 7,
  },

  typeBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },

  tabsScroll: {
    paddingBottom: 12,
  },

  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    marginRight: 8,
  },

  tabText: {
    fontSize: 12,
    fontWeight: '800',
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },

  sectionSub: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '600',
  },

  emptyCard: {
    marginTop: 24,
    paddingVertical: 42,
    paddingHorizontal: 22,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
  },

  emptyIconWrap: {
    width: 74,
    height: 74,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
  },

  emptySub: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
  },

  emptyBtn: {
    marginTop: 22,
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  emptyBtnTxt: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 13,
  },

  fab: {
    position: 'absolute',
    right: 22,
    bottom: 28,
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 22,
    maxHeight: '88%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: '900',
  },

  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 7,
    marginTop: 14,
    textTransform: 'uppercase',
  },

  modalInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 14,
    fontWeight: '600',
  },

  modalRow: {
    flexDirection: 'row',
    gap: 12,
  },

  flex1: {
    flex: 1,
  },

  presetCard: {
    width: 96,
    borderRadius: 14,
    borderWidth: 2,
    overflow: 'hidden',
    marginRight: 10,
  },

  presetImg: {
    width: '100%',
    height: 70,
  },

  presetLabel: {
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  saveBtn: {
    marginTop: 28,
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

  saveBtnTxt: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
});