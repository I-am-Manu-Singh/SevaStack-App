import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Zap, MapPin, Star, ArrowRight } from 'lucide-react-native';
import { Spacing } from '../constants/Theme';
import { GlassCard } from './GlassCard';
import { useApp } from '../lib/AppContext';

const MOCK_TRENDING = {
  name: "Custom Stitching",
  shop: "Elite Tailors",
  price: "499",
  rating: "4.8",
  image: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=400&q=80"
};

/**
 * Trending Service Widget
 * Showcases what other students are booking
 */
export const TrendingServiceWidget = ({ item = MOCK_TRENDING }: { item?: any }) => {
  const { colors, t } = useApp();
  const styles = getStyles(colors);
  
  return (
    <GlassCard style={styles.trendCard}>
      <View style={styles.trendHeader}>
         <View style={[styles.trendBadge, { backgroundColor: colors.secondary || colors.accent }]}>
            <Zap size={10} color="#FFF" />
            <Text style={styles.trendBadgeTxt}>{t('trending').toUpperCase()}</Text>
         </View>
         <Text style={[styles.trendCount, { color: colors.textMuted }]}>40+ {t('booked_today_suffix')}</Text>
      </View>
      <View style={styles.trendMain}>
         <Image source={{ uri: item.image }} style={styles.trendImg} />
         <View style={styles.trendInfo}>
            <Text style={[styles.trendName, { color: colors.text }]}>{t(item.name as any)}</Text>
            <View style={styles.locRow}>
               <MapPin size={10} color={colors.textMuted} />
               <Text style={[styles.locTxt, { color: colors.textMuted }]}>{t(item.shop as any)}</Text>
            </View>
            <View style={styles.priceRow}>
               <Text style={[styles.priceTag, { color: colors.accent }]}>₹{item.price}</Text>
               <View style={styles.ratingBadge}>
                  <Star size={10} color={colors.secondary || colors.accent} fill={colors.secondary || colors.accent} />
                  <Text style={[styles.ratingTxt, { color: colors.text }]}>{item.rating}</Text>
               </View>
            </View>
         </View>
      </View>
      <TouchableOpacity style={[styles.bookBtn, { backgroundColor: colors.primary }]} activeOpacity={0.8}>
         <Text style={styles.bookTxt}>{t('book_now')}</Text>
         <ArrowRight size={14} color="#FFF" />
      </TouchableOpacity>
    </GlassCard>
  );
};

const MOCK_SPOTLIGHT = {
  name: "The Royal Cut",
  image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&q=80",
  rating: "4.9",
  distance: "1.2 km",
  type: "Barber"
};

/**
 * Local Business Spotlight Widget
 * Horizontal card for featured local shops
 */
export const ShopSpotlightWidget = ({ shop = MOCK_SPOTLIGHT }: { shop?: any }) => {
  const { colors, t } = useApp();
  const styles = getStyles(colors);

  return (
    <TouchableOpacity activeOpacity={0.9}>
       <GlassCard style={styles.spotlightCard}>
          <Image source={{ uri: shop.image }} style={styles.spotlightImg} />
          <View style={styles.spotlightInfo}>
             <Text style={[styles.spotlightName, { color: colors.text }]}>{t(shop.name as any)}</Text>
              <View style={styles.spotlightMeta}>
                 <View style={styles.metaItem}>
                    <Star size={10} color={colors.secondary || colors.accent} fill={colors.secondary || colors.accent} />
                    <Text style={[styles.metaTxt, { color: colors.secondary || colors.accent }]}>{shop.rating}</Text>
                 </View>
                 <View style={[styles.metaDot, { backgroundColor: colors.border }]} />
                 <Text style={[styles.metaTxt, { color: colors.textMuted }]}>{shop.distance}</Text>
              </View>
              <Text style={[styles.spotlightType, { color: colors.primary }]}>{t(shop.type as any)}</Text>
          </View>
       </GlassCard>
    </TouchableOpacity>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  trendCard: {
    padding: 16,
    width: 260,
    marginRight: 16,
    borderRadius: 20,
    borderColor: colors.border,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendBadgeTxt: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  trendCount: {
    fontSize: 10,
    fontWeight: '600',
  },
  trendMain: {
    flexDirection: 'row',
    gap: 12,
  },
  trendImg: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  trendInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  trendName: {
    fontSize: 14,
    fontWeight: '700',
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locTxt: {
    fontSize: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  priceTag: {
    fontSize: 14,
    fontWeight: '800',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingTxt: {
    fontSize: 10,
    fontWeight: '700',
  },
  bookBtn: {
    marginTop: 16,
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  bookTxt: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  spotlightCard: {
    width: 160,
    padding: 0,
    overflow: 'hidden',
    marginRight: 16,
    marginBottom: 10,
    borderRadius: 20,
    borderColor: colors.border,
  },
  spotlightImg: {
    width: '100%',
    height: 100,
  },
  spotlightInfo: {
    padding: 10,
  },
  spotlightName: {
    fontSize: 13,
    fontWeight: '700',
  },
  spotlightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaTxt: {
    fontSize: 10,
    fontWeight: '700',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  spotlightType: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'uppercase',
  }
});
