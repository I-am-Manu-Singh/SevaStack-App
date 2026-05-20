import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Truck, Map, ChevronRight, RefreshCw } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import { useApp } from '../lib/AppContext';

/**
 * Subscription / Tracker Widget
 * For businesses like Milk, Tiffin, Laundry
 */
export const DeliveryTrackerWidget = ({ title, desc, onTrack }: { 
  title: string, 
  desc: string, 
  onTrack: () => void 
}) => {
  const { colors } = useApp();
  const styles = getStyles(colors);
  
  return (
    <GlassCard style={styles.banner}>
      <View style={styles.main}>
        <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
           <Truck size={24} color={colors.primary} />
        </View>
        <View style={styles.info}>
           <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
           <Text style={[styles.desc, { color: colors.textMuted }]}>{desc}</Text>
        </View>
        <TouchableOpacity style={[styles.trackBtn, { backgroundColor: colors.primary }]} onPress={onTrack}>
           <Map size={16} color="#FFF" />
           <Text style={styles.trackTxt}>Road Map</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
         <View style={styles.statusRow}>
            <RefreshCw size={12} color={colors.success || '#10B981'} />
            <Text style={[styles.statusTxt, { color: colors.success || '#10B981' }]}>GPS Active • Live syncing</Text>
         </View>
         <ChevronRight size={14} color={colors.textMuted} />
      </View>
    </GlassCard>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  banner: {
    padding: 0,
    marginBottom: 20,
    overflow: 'hidden',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
  },
  main: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  desc: {
    fontSize: 11,
    marginTop: 2,
  },
  trackBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trackTxt: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderTopWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusTxt: {
    fontSize: 10,
    fontWeight: '700',
  }
});
