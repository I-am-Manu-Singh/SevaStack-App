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
      <Text style={[styles.trendCount, { color: colors.textMuted }]}>40+ {t('booked_today_suffix')}</Text>
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
const getStyles = (colors: any) =>
  StyleSheet.create({
    // ================= TRENDING CARD =================

    trendCard: {
      width: 220,

      padding: 12,

      marginRight: 12,

      borderRadius: 22,

      borderWidth: 1,

      borderColor: colors.border,

      overflow: 'hidden',
    },

    trendHeader: {
      flexDirection: 'row',

      justifyContent: 'space-between',
      alignItems: 'center',

      marginBottom: 10,
    },

    trendBadge: {
      flexDirection: 'row',
      alignItems: 'center',

      gap: 4,

      paddingHorizontal: 8,
      paddingVertical: 5,

      borderRadius: 999,
    },

    trendBadgeTxt: {
      color: '#FFF',

      fontSize: 8,

      fontWeight: '900',

      letterSpacing: 0.4,
    },

    trendCount: {
      fontSize: 9,
      paddingTop: 12,
      textAlign: 'center',
      fontWeight: '900',
    },

    trendMain: {
      flexDirection: 'row',

      alignItems: 'center',
    },

    trendImg: {
      width: 68,
      height: 68,

      borderRadius: 16,
    },

    trendInfo: {
      flex: 1,

      marginLeft: 10,

      justifyContent: 'center',
    },

    trendName: {
      fontSize: 13,

      fontWeight: '800',

      lineHeight: 18,
    },

    locRow: {
      flexDirection: 'row',

      alignItems: 'center',

      gap: 4,

      marginTop: 4,
    },

    locTxt: {
      flex: 1,

      fontSize: 10,

      fontWeight: '600',
    },

    priceRow: {
      flexDirection: 'row',

      justifyContent: 'space-between',
      alignItems: 'center',

      marginTop: 8,
    },

    priceTag: {
      fontSize: 16,

      fontWeight: '900',
    },

    ratingBadge: {
      flexDirection: 'row',

      alignItems: 'center',

      gap: 3,

      paddingHorizontal: 6,
      paddingVertical: 3,

      borderRadius: 999,

      backgroundColor: `${colors.primary}10`,
    },

    ratingTxt: {
      fontSize: 10,

      fontWeight: '800',
    },

    bookBtn: {
      marginTop: 12,

      height: 36,

      borderRadius: 14,

      flexDirection: 'row',

      justifyContent: 'center',
      alignItems: 'center',

      gap: 6,
    },

    bookTxt: {
      color: '#FFF',

      fontSize: 11,

      fontWeight: '800',
    },

    // ================= SPOTLIGHT CARD =================

    spotlightCard: {
      width: 170,

      marginRight: 12,
      marginBottom: 8,

      padding: 0,

      overflow: 'hidden',

      borderRadius: 22,

      borderWidth: 1,

      borderColor: colors.border,
    },

    spotlightImg: {
      width: '100%',

      height: 110,

      resizeMode: 'cover',
    },

    spotlightInfo: {
      padding: 12,
    },

    spotlightName: {
      fontSize: 13,

      fontWeight: '800',

      lineHeight: 18,
    },

    spotlightMeta: {
      flexDirection: 'row',

      alignItems: 'center',

      marginTop: 6,
    },

    metaItem: {
      flexDirection: 'row',

      alignItems: 'center',

      gap: 4,
    },

    metaTxt: {
      fontSize: 10,

      fontWeight: '700',
    },

    metaDot: {
      width: 4,
      height: 4,

      borderRadius: 999,

      marginHorizontal: 6,
    },

    spotlightType: {
      marginTop: 8,

      alignSelf: 'flex-start',

      fontSize: 9,

      fontWeight: '900',

      textTransform: 'uppercase',

      letterSpacing: 0.6,

      paddingHorizontal: 8,
      paddingVertical: 4,

      borderRadius: 999,

      backgroundColor: `${colors.primary}12`,
    },
  });