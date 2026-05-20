import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking } from 'react-native';
import { 
  Clock, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Wrench, 
  Plane, 
  TrendingUp,
  ChevronRight,
  MoreVertical
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../constants/Theme';
import { GlassCard } from './GlassCard';
import { useApp } from '../lib/AppContext';

/**
 *  Analytics Widget for Business
 */
export const AnalyticsWidget = ({ revenue, growth = '+12.5%' }: { revenue: number, growth?: string }) => {
  const { colors, t } = useApp();
  
  return (
    <GlassCard style={styles.analyticsCard}>
      <View style={styles.analyticsHeader}>
        <View>
          <Text style={[styles.analyticsSubtitle, { color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }]}>
            {t('potential_revenue' as any)}
          </Text>
          <Text style={[styles.analyticsTitle, { color: colors.text }]}>₹{revenue.toLocaleString()}</Text>
        </View>
        <View style={[styles.growthBadge, { backgroundColor: colors.success + '15' }]}>
          <TrendingUp size={12} color={colors.success} />
          <Text style={[styles.growthText, { color: colors.success }]}>{growth}</Text>
        </View>
      </View>
    </GlassCard>
  );
};

/**
 *  Order / Booking Item Widget
 */
export const BookingWidget = ({ 
  item, 
  onStatusChange 
}: { 
  item: any, 
  onStatusChange: (id: string, status: any) => void 
}) => {
  const { colors } = useApp();

  const handleCall = () => {
    if (item.phone) Linking.openURL(`tel:${item.phone}`);
  };

  const getStatusColor = () => {
    switch (item.status) {
      case 'confirmed': return Colors.success;
      case 'completed': return Colors.primary;
      case 'pending': return Colors.secondary;
      case 'cancelled': return Colors.error;
      default: return colors.textMuted;
    }
  };

  return (
    <GlassCard style={styles.orderCard}>
      <View style={styles.orderMain}>
        <View style={styles.avatarContainer}>
          {item.businessType === 'Handyman' ? (
            <View style={[styles.typeIconBox, { backgroundColor: Colors.primary + '20' }]}>
              <Wrench size={24} color={Colors.primary} />
            </View>
          ) : item.businessType === 'Travel' ? (
            <View style={[styles.typeIconBox, { backgroundColor: Colors.accent + '20' }]}>
              <Plane size={24} color={Colors.accent} />
            </View>
          ) : (
            <Image 
              source={{ uri: item.avatar || 'https://via.placeholder.com/100' }} 
              style={styles.customerAvatar} 
            />
          )}
        </View>

        <View style={styles.orderInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.customerName, { color: colors.text }]}>{item.customerName}</Text>
            {item.businessType === 'Handyman' && (
              <View style={[styles.tag, { backgroundColor: colors.surfaceLight }]}>
                <Text style={[styles.tagText, { color: colors.textMuted }]}>TICKET</Text>
              </View>
            )}
          </View>
          <Text style={[styles.serviceName, { color: colors.textMuted }]}>
            {item.service}
          </Text>
          <View style={styles.timeRow}>
            <Clock size={12} color={colors.textMuted} />
            <Text style={[styles.timeText, { color: colors.textMuted }]}>{item.time || 'Today'}</Text>
          </View>
        </View>

        <View style={styles.priceCol}>
          <Text style={[styles.orderPrice, { color: colors.text }]}>₹{item.price}</Text>
          <View style={[styles.statusTag, { backgroundColor: getStatusColor() + '15' }]}>
             <Text style={[styles.statusText, { color: getStatusColor() }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {item.details && (
        <View style={[styles.detailsSection, { backgroundColor: colors.surface + '40' }]}>
           <MessageSquare size={12} color={colors.textMuted} />
           <Text style={[styles.detailsText, { color: colors.textMuted }]}>{item.details}</Text>
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      
      <View style={styles.orderActions}>
        <View style={styles.actionGroup}>
           <TouchableOpacity onPress={handleCall} style={[styles.actionBtn, { borderColor: colors.border }]}>
             <Phone size={16} color={colors.primary} />
           </TouchableOpacity>
           <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.border }]}>
             <MessageSquare size={16} color={colors.secondary} />
           </TouchableOpacity>
        </View>

        <View style={styles.decisionGroup}>
           {item.status === 'pending' && (
             <TouchableOpacity 
               onPress={() => onStatusChange(item.id, 'confirmed')} 
               style={[styles.confirmBtn, { backgroundColor: Colors.success }]}
             >
               <CheckCircle2 size={16} color="#FFF" />
               <Text style={styles.btnTxt}>Confirm</Text>
             </TouchableOpacity>
           )}
           {item.status !== 'cancelled' && item.status !== 'completed' && (
             <TouchableOpacity 
                onPress={() => onStatusChange(item.id, 'cancelled')} 
                style={[styles.cancelBtn, { borderColor: Colors.error }]}
             >
               <XCircle size={16} color={Colors.error} />
             </TouchableOpacity>
           )}
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  analyticsCard: {
    marginBottom: 20,
    padding: 20,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analyticsSubtitle: {
    fontSize: 12,
  },
  analyticsTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  growthText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  orderCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  orderMain: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerAvatar: {
    width: '100%',
    height: '100%',
  },
  typeIconBox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  serviceName: {
    fontSize: 12,
    marginTop: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
  },
  priceCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 8,
    fontWeight: '900',
  },
  detailsSection: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsText: {
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 16,
    flex: 1,
  },
  divider: {
    height: 1,
    opacity: 0.1,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    alignItems: 'center',
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  decisionGroup: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtn: {
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cancelBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTxt: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  }
});
