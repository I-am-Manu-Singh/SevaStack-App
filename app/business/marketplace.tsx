import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MapPin, Star, ChevronRight, ShoppingBag, Truck, Zap } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { useApp } from '@/lib/AppContext';
import { GlassCard } from '@/components/GlassCard';
import { StatusBar } from 'expo-status-bar';

const NEARBY_PARTNERS = [
  { id: 'p1', name: 'Agarwal Kirana Store', distance: '0.2 km', type: 'Supplies', rating: 4.8, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80' },
  { id: 'p2', name: 'Kota Stationery Hub', distance: '0.5 km', type: 'Stationery', rating: 4.7, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80' },
  { id: 'p3', name: 'Fresh Milk Dairy', distance: '0.8 km', type: 'Dairy', rating: 4.9, image: 'https://images.unsplash.com/photo-1550583724-125581f778d3?w=400&q=80' },
];

export default function MarketplaceScreen() {
  const { colors, t } = useApp();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />
      <Stack.Screen options={{ title: t('local_market') }} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
           <Text style={[styles.title, { color: colors.text }]}>Local Merchant Network</Text>
           <Text style={[styles.subtitle, { color: colors.textMuted }]}>
             Connect with nearby shops to source materials, share deliveries, and grow together.
           </Text>
        </View>

        <GlassCard style={styles.banner}>
           <View style={styles.bannerContent}>
              <Zap size={30} color={colors.primary} />
              <View style={{ flex: 1 }}>
                 <Text style={[styles.bannerTitle, { color: colors.text }]}>Bulk Order Discounts</Text>
                 <Text style={[styles.bannerSub, { color: colors.textMuted }]}>Get up to 15% off when you partner with 3+ nearby shops.</Text>
              </View>
           </View>
        </GlassCard>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Nearby Partners</Text>
        {NEARBY_PARTNERS.map(partner => (
          <TouchableOpacity key={partner.id} activeOpacity={0.9}>
            <GlassCard style={styles.partnerCard}>
               <Image source={{ uri: partner.image }} style={styles.partnerImg} />
               <View style={styles.partnerInfo}>
                  <View style={styles.partnerHeader}>
                     <Text style={[styles.partnerName, { color: colors.text }]}>{partner.name}</Text>
                     <View style={styles.ratingBox}>
                        <Star size={10} color={Colors.secondary} fill={Colors.secondary} />
                        <Text style={styles.ratingTxt}>{partner.rating}</Text>
                     </View>
                  </View>
                  <Text style={[styles.partnerType, { color: colors.primary }]}>{partner.type}</Text>
                  <View style={styles.metaRow}>
                     <MapPin size={12} color={colors.textMuted} />
                     <Text style={[styles.metaTxt, { color: colors.textMuted }]}>{partner.distance} away</Text>
                  </View>
               </View>
               <ChevronRight size={20} color={colors.textMuted} />
            </GlassCard>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Quick Actions</Text>
        <View style={styles.actionRow}>
           <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ShoppingBag size={20} color={colors.primary} />
              <Text style={[styles.actionTxt, { color: colors.text }]}>Order Stock</Text>
           </TouchableOpacity>
           <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Truck size={20} color={Colors.success} />
              <Text style={[styles.actionTxt, { color: colors.text }]}>Request Delivery</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  banner: {
    marginBottom: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  bannerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
  },
  partnerImg: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  partnerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partnerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  partnerType: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  metaTxt: {
    fontSize: 11,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  actionTxt: {
    fontSize: 12,
    fontWeight: '700',
  }
});
