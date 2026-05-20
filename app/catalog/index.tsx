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
  RefreshControl
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { StatusBar } from 'expo-status-bar';

import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  Clock,
  IndianRupee,
  Sparkles,
  Scissors,
  Shirt,
  Waves,
  Coffee,
  ChevronRight,
  ShoppingBag,
  Stethoscope,
  Truck,
  Utensils,
  Gem,
  X,
  Save,
  BookOpen
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { Service, BusinessType } from '@/constants/Types';
import { useApp } from '@/lib/AppContext';
import { CatalogItemWidget } from '@/components/CatalogWidgets';

const BUSINESS_TYPES: { type: BusinessType, icon: any, label: string }[] = [
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

const PRESET_IMAGES = [
  { label: 'Snacks / Food', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80' },
  { label: 'Beverages', url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&q=80' },
  { label: 'Salon / Haircut', url: 'https://images.unsplash.com/photo-1521566652839-697aa473761a?w=400&q=80' },
  { label: 'Laundry Care', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80' },
  { label: 'Stationery / Books', url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&q=80' },
  { label: 'General / Tiffin', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80' }
];

export default function CatalogManagerScreen() {
  const { colors, t, theme, userRole, businessType, profile } = useApp();
  const [selectedType, setSelectedType] = useState<BusinessType>(businessType || 'Barber');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Merchants profile details
  const [activeMerchantId, setActiveMerchantId] = useState<string | null>(profile?.id || null);
  const [merchantName, setMerchantName] = useState<string>('');

  const [isModalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const router = useRouter();

  // Form State
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
    unit: '',
    image: PRESET_IMAGES[0].url
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  // Load catalog services dynamically
  const loadCatalogData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch active merchant details if they are merchant role
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

      // 2. Fetch services based on merchant ID or selectedType if admin
      let query = supabase.from('services').select('*');
      if (userRole === 'merchant' && currentMerchantId) {
        query = query.eq('merchant_id', currentMerchantId);
      } else {
        // Admin or Customer preview filters by business type
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
          image: item.image || PRESET_IMAGES[0].url
        }));
        setServices(mapped);
      }
    } catch (e: any) {
      console.warn("Error loading catalog:", e.message);
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

  const filteredServices = services.filter(s =>
    (searchQuery === '' || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const categories = ['All', ...Array.from(new Set(filteredServices.map(s => s.category)))];

  const finalServices = activeTab === 'All'
    ? filteredServices
    : filteredServices.filter(s => s.category === activeTab);

  const openModal = (service: Service | null = null) => {
    if (service) {
      setEditingService(service);
      setForm({
        name: service.name,
        price: service.price.toString(),
        category: service.category,
        unit: service.unit || '',
        image: service.image || PRESET_IMAGES[0].url
      });
    } else {
      setEditingService(null);
      setForm({ 
        name: '', 
        price: '', 
        category: '', 
        unit: '', 
        image: PRESET_IMAGES[0].url 
      });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      Alert.alert("Error", "Name and Price are required.");
      return;
    }

    try {
      const priceVal = parseFloat(form.price);
      if (isNaN(priceVal)) {
        Alert.alert("Error", "Price must be a valid number.");
        return;
      }

      if (editingService) {
        // UPDATE
        const { error } = await supabase
          .from('services')
          .update({
            name: form.name,
            price: priceVal,
            category: form.category || 'General',
            unit: form.unit,
            image: form.image
          })
          .eq('id', editingService.id);

        if (error) throw error;
        Alert.alert("Success", "Catalog product updated.");
      } else {
        // INSERT
        if (!activeMerchantId) {
          Alert.alert("Authentication Error", "No linked merchant profile found to add this product to.");
          return;
        }

        const { error } = await supabase
          .from('services')
          .insert([{
            merchant_id: activeMerchantId,
            name: form.name,
            price: priceVal,
            category: form.category || 'General',
            unit: form.unit,
            business_type: selectedType,
            image: form.image
          }]);

        if (error) throw error;
        Alert.alert("Success", "Catalog product added successfully.");
      }

      setModalVisible(false);
      loadCatalogData();
    } catch (err: any) {
      Alert.alert("Operation Failed", err.message);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to delete this from your catalog?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('services')
                .delete()
                .eq('id', id);

              if (error) throw error;
              Alert.alert("Deleted", "Item removed successfully.");
              loadCatalogData();
            } catch (err: any) {
              Alert.alert("Error", err.message);
            }
          }
        }
      ]
    );
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
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ title: 'Catalog Manager' }} />

      <View style={styles.searchContainer}>
        <View style={[styles.innerSearch, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search items by name..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Admin Switcher Row */}
        {userRole === 'admin' && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted, marginBottom: 8, textTransform: 'uppercase' }}>
              Filter by Hub Category (Admin Mode)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSwitcher}>
              {BUSINESS_TYPES.map(({ type, icon: Icon, label }) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    setSelectedType(type);
                    setActiveTab('All');
                  }}
                  style={[
                    styles.typeBtn,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    selectedType === type && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                >
                  <Icon size={14} color={selectedType === type ? '#FFF' : colors.textMuted} />
                  <Text style={[
                    styles.typeBtnText,
                    { color: colors.textMuted },
                    selectedType === type && { color: '#FFF' }
                  ]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Categories Tab selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveTab(cat)}
              style={[
                styles.tabBtn,
                { backgroundColor: colors.surface },
                activeTab === cat && { backgroundColor: colors.primary }
              ]}
            >
              <Text style={[
                styles.tabText,
                { color: colors.textMuted },
                activeTab === cat && { color: '#FFF' }
              ]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {userRole === 'merchant' ? (merchantName || 'My Catalog') : `${selectedType} Hub Catalog`}
            </Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
              {userRole === 'merchant' ? `Verified merchant products (${selectedType})` : 'Registered platform items'}
            </Text>
          </View>
          <Text style={[styles.countText, { color: colors.textMuted }]}>{finalServices.length} items</Text>
        </View>

        {finalServices.map((service) => (
          <CatalogItemWidget
            key={service.id}
            item={service}
            onEdit={() => openModal(service)}
            onDelete={() => handleDelete(service.id)}
          />
        ))}

        {finalServices.length === 0 && (
          <View style={styles.emptyContainer}>
            <ShoppingBag size={48} color={colors.textMuted} style={{ marginBottom: 12, opacity: 0.5 }} />
            <Text style={[styles.emptyTextTitle, { color: colors.text }]}>Catalog is Empty</Text>
            <Text style={[styles.emptyTextSub, { color: colors.textMuted }]}>
              Create your first product or service option below to start receiving student orders.
            </Text>
          </View>
        )}

        {userRole === 'merchant' && (
          <TouchableOpacity 
            style={[styles.addNewMainBtn, { backgroundColor: colors.primary }]} 
            onPress={() => openModal()}
            activeOpacity={0.8}
          >
            <Plus size={20} color="#FFF" />
            <Text style={styles.addNewBtnText}>Add Product / Service</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <GlassCard style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingService ? 'Edit Product Details' : 'Register Catalog Item'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Product/Service Name</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
                placeholder="e.g. Premium Butter Paneer"
                placeholderTextColor={colors.textMuted}
              />

              <View style={styles.modalRow}>
                <View style={styles.flex1}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Price (₹)</Text>
                  <TextInput
                    style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                    value={form.price}
                    onChangeText={(t) => setForm({ ...form, price: t })}
                    keyboardType="numeric"
                    placeholder="150"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={styles.flex1}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Sale Unit (e.g. plate, kg)</Text>
                  <TextInput
                    style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                    value={form.unit}
                    onChangeText={(t) => setForm({ ...form, unit: t })}
                    placeholder="plate"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Category</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={form.category}
                onChangeText={(t) => setForm({ ...form, category: t })}
                placeholder="e.g. Lunch Specials"
                placeholderTextColor={colors.textMuted}
              />

              {/* Photo Preset Picker */}
              <Text style={[styles.inputLabel, { color: colors.textMuted, marginTop: 20 }]}>Select Thumbnail Style</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
                {PRESET_IMAGES.map((imgPreset) => (
                  <TouchableOpacity
                    key={imgPreset.url}
                    onPress={() => setForm({ ...form, image: imgPreset.url })}
                    style={[
                      styles.presetCard,
                      { borderColor: colors.border },
                      form.image === imgPreset.url && { borderColor: colors.primary, borderWidth: 2 }
                    ]}
                  >
                    <Image source={{ uri: imgPreset.url }} style={styles.presetImg} />
                    <Text style={[styles.presetLabel, { color: colors.text }]}>{imgPreset.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity 
                style={[styles.saveBtn, { backgroundColor: colors.primary }]} 
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Save size={18} color="#FFF" />
                <Text style={styles.saveBtnText}>{editingService ? 'Apply Updates' : 'Publish Product'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingTop: 0,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  innerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  typeSwitcher: {
    marginBottom: 8,
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
  },
  typeBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tabsScroll: {
    gap: 8,
    marginBottom: Spacing.lg,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addNewMainBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: Spacing.lg,
  },
  addNewBtnText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '800',
  },
  emptyContainer: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTextTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyTextSub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 14,
    textTransform: 'uppercase',
  },
  modalInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontWeight: '600',
    borderWidth: 1,
  },
  modalRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  presetCard: {
    width: 90,
    height: 80,
    borderRadius: 10,
    borderWidth: 1.5,
    marginRight: 8,
    overflow: 'hidden',
    alignItems: 'center',
  },
  presetImg: {
    width: '100%',
    height: '60%',
  },
  presetLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 28,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
