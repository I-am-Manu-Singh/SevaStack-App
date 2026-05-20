import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { 
  Tag, 
  IndianRupee, 
  Edit2, 
  Trash2,
  ChevronRight
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../constants/Theme';
import { GlassCard } from './GlassCard';
import { useApp } from '../lib/AppContext';

/**
 *  Catalog Item Widget
 * Detailed card for managing products or services
 */
export const CatalogItemWidget = ({ 
  item, 
  onEdit, 
  onDelete 
}: { 
  item: any, 
  onEdit: () => void, 
  onDelete: () => void 
}) => {
  const { colors } = useApp();
  
  return (
    <GlassCard style={styles.serviceCard}>
      <View style={styles.cardMain}>
        <Image source={{ uri: item.image }} style={styles.serviceImg} />
        <View style={styles.serviceInfo}>
          <Text style={[styles.serviceName, { color: colors.text }]}>{item.name}</Text>
          <View style={styles.metaRow}>
            <Tag size={12} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>{item.category}</Text>
          </View>
          <View style={styles.priceRow}>
            <IndianRupee size={16} color={Colors.accent} />
            <Text style={styles.priceText}>{item.price}{item.unit ? `/${item.unit}` : ''}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Edit2 size={16} color={colors.primary} />
          <Text style={[styles.actionTxt, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>
        <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
          <Trash2 size={16} color={Colors.error} />
          <Text style={[styles.actionTxt, { color: Colors.error }]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  serviceCard: {
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardMain: {
    flexDirection: 'row',
    padding: 12,
  },
  serviceImg: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.accent,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    height: 44,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  actionTxt: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
    opacity: 0.2,
  },
});
