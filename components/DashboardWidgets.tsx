import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Linking } from 'react-native';
import { MapPin, Clock, Phone, MessageSquare, ChevronRight, QrCode, Sparkles } from 'lucide-react-native';
import { Spacing, Typography } from '../constants/Theme';
import { GlassCard } from './GlassCard';
import { useApp } from '../lib/AppContext';

/**
 * Stats Card Widget
 * Shows a key metric with a mini trend indicator
 */
export const StatWidget = ({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  trend = '+12%' 
}: { 
  label: string; 
  value: string; 
  icon: any; 
  color: string;
  trend?: string;
}) => {
  const { colors } = useApp();
  const styles = getStyles(colors);
  
  return (
    <GlassCard style={styles.statCard}>
      <View style={[styles.statIconBadge, { backgroundColor: `${color}15` }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
        <View style={styles.trendContainer}>
          <Text style={[styles.trendText, { color: colors.success || '#10B981' }]}>{trend}</Text>
          <Text style={[styles.trendLabel, { color: colors.textMuted }]}> vs yesterday</Text>
        </View>
      </View>
    </GlassCard>
  );
};

/**
 * Student Lead Widget
 * Implemented lead card with real contact actions
 */
export const LeadWidget = ({ lead }: { lead: any }) => {
  const { colors, t } = useApp();
  const styles = getStyles(colors);

  const handleCall = () => {
    if (lead.phone) Linking.openURL(`tel:${lead.phone}`);
    else alert("No phone number provided for this lead.");
  };

  const handleChat = () => {
    alert("Opening secure chat with student...");
  };

  return (
    <GlassCard style={styles.leadCard}>
      <View style={styles.leadHeader}>
        <View style={[styles.leadAvatar, { backgroundColor: colors.primary + '15' }]}>
           <Text style={[styles.avatarTxt, { color: colors.primary }]}>
             {(lead.student_name || lead.studentName || '?')[0].toUpperCase()}
           </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.leadName, { color: colors.text }]}>{lead.student_name || lead.studentName}</Text>
          <Text style={[styles.leadInterest, { color: colors.primary }]}>{lead.interest}</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
           <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.leadMetaRow}>
        <View style={styles.metaItem}>
          <MapPin size={12} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>{lead.distance || '2km'} away</Text>
        </View>
        <View style={styles.metaItem}>
          <Clock size={12} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>{lead.time || '10m ago'}</Text>
        </View>
      </View>

      <View style={styles.leadActions}>
        <TouchableOpacity onPress={handleCall} style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Phone size={14} color={colors.text} />
          <Text style={[styles.actionBtnTxt, { color: colors.text }]}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleChat} style={[styles.actionBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
          <MessageSquare size={14} color="#FFF" />
          <Text style={[styles.actionBtnTxt, { color: '#FFF' }]}>Chat</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
};

/**
 * Quick Payment Widget
 * Integrated UPI card
 */
export const QuickPayWidget = ({ upiId = 'merchant@upi', onPress }: { upiId?: string, onPress?: () => void }) => {
  const { colors, t } = useApp();
  const styles = getStyles(colors);
  
  const handleShare = async () => {
    await Share.share({
      message: `Pay me via UPI: ${upiId}`,
    });
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <GlassCard style={styles.payCard}>
        <View style={styles.payHeader}>
          <View style={[styles.qrIconContainer, { backgroundColor: colors.primary + '15' }]}>
            <QrCode size={26} color={colors.primary} />
          </View>
          <View style={styles.payInfo}>
            <Text style={[styles.payTitle, { color: colors.text }]}>{t('upi_payment' as any) || 'UPI QR Code'}</Text>
            <Text style={[styles.paySub, { color: colors.textMuted }]}>{upiId}</Text>
          </View>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Share</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

/**
 * Merchant Insight Widget
 * Proactive business growth tips
 */
export const InsightWidget = () => {
  const { colors, t } = useApp();
  const styles = getStyles(colors);
  
  return (
    <GlassCard style={styles.insightCard}>
      <View style={styles.insightHeader}>
         <View style={[styles.insightIcon, { backgroundColor: (colors.secondary || colors.accent) + '15' }]}>
            <Sparkles size={16} color={colors.secondary || colors.accent} />
         </View>
         <Text style={[styles.insightTitle, { color: colors.text }]}>Merchant Insight</Text>
      </View>
      <Text style={[styles.insightText, { color: colors.textMuted }]}>
        Student demand for <Text style={{ color: colors.primary, fontWeight: '700' }}>Night Canteens</Text> is up by 40% this week. Consider extending your hours until 11 PM.
      </Text>
      <TouchableOpacity style={styles.insightAction}>
         <Text style={[styles.insightActionTxt, { color: colors.primary }]}>Try Suggestion</Text>
         <ChevronRight size={14} color={colors.primary} />
      </TouchableOpacity>
    </GlassCard>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  statCard: {
    width: 160,
    padding: 16,
    marginRight: 12,
    borderRadius: 20,
    borderColor: colors.border,
  },
  statIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '800',
  },
  trendLabel: {
    fontSize: 10,
  },
  leadCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 20,
    borderColor: colors.border,
  },
  leadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leadAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTxt: {
    fontWeight: '800',
    fontSize: 15,
  },
  leadName: {
    fontSize: 16,
    fontWeight: '700',
  },
  leadInterest: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  moreBtn: {
    padding: 4,
  },
  leadMetaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  leadActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
  },
  actionBtnTxt: {
    fontWeight: '700',
    fontSize: 13,
  },
  payCard: {
    padding: 16,
    marginBottom: 20,
    borderRadius: 20,
    borderColor: colors.border,
  },
  payHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qrIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payInfo: {
    flex: 1,
  },
  payTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  paySub: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  shareBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  insightCard: {
    padding: 16,
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  insightText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  insightActionTxt: {
    fontSize: 12,
    fontWeight: '800',
  }
});
