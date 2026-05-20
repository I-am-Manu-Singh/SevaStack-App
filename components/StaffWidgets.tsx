import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { 
  MessageSquare, 
  Calendar, 
  Star, 
  MoreVertical,
  Activity,
  Award
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../constants/Theme';
import { GlassCard } from './GlassCard';
import { useApp } from '../lib/AppContext';

/**
 * ‍ Staff Member Widget
 * Dynamic card showing staff status, role, and quick engagement tools
 */
export const StaffMemberWidget = ({ member, onStatusToggle }: { member: any, onStatusToggle: (id: string, isPresent: boolean) => void }) => {
  const { colors, t } = useApp();

  return (
    <GlassCard style={styles.staffCard}>
      <View style={styles.staffMain}>
        <View style={styles.staffImageContainer}>
          <Image source={{ uri: member.avatar }} style={styles.staffImage} />
          <View style={[
            styles.statusIndicator, 
            { backgroundColor: member.isPresent ? Colors.success : Colors.error, borderColor: colors.surface }
          ]} />
        </View>
        <View style={styles.staffInfo}>
          <View style={styles.staffHeader}>
            <Text style={[styles.staffName, { color: colors.text }]}>{member.name}</Text>
            <TouchableOpacity onPress={() => onStatusToggle(member.id, !member.isPresent)}>
               <View style={[
                 styles.attendanceBtn, 
                 { backgroundColor: member.isPresent ? Colors.error + '15' : Colors.success + '15' }
               ]}>
                 <Text style={[
                   styles.attendanceBtnText, 
                   { color: member.isPresent ? Colors.error : Colors.success }
                 ]}>
                    {member.isPresent ? t('go_offline') : t('mark_online')}
                 </Text>
               </View>
            </TouchableOpacity>
          </View>
          <Text style={[styles.staffRole, { color: colors.textMuted }]}>{member.role}</Text>
          <View style={styles.metaRow}>
            <View style={styles.ratingRow}>
              <Star size={12} fill={Colors.secondary} color={Colors.secondary} />
              <Text style={[styles.ratingText, { color: Colors.secondary }]}>{member.rating}</Text>
            </View>
            <View style={styles.tasksRow}>
               <Activity size={12} color={colors.primary} />
               <Text style={[styles.tasksText, { color: colors.primary }]}>{member.tasks} {t('tasks_completed')}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.staffDivider, { backgroundColor: colors.border }]} />

      <View style={styles.staffFooter}>
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => Linking.openURL('sms:+910000000000')}
          >
            <MessageSquare size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
            <Calendar size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.quickStat}>
           <Text style={[styles.statValue, { color: colors.text }]}>₹{member.tasks * 100}</Text>
           <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('todays_value')}</Text>
        </View>
      </View>
    </GlassCard>
  );
};

/**
 *  Staff Performance Widget
 * Summary card for the team lead
 */
export const TeamSummaryWidget = ({ count, activeCount }: { count: number, activeCount: number }) => {
  const { colors, t } = useApp();
  
  return (
    <GlassCard style={styles.summaryCard}>
      <View style={styles.summaryGrid}>
         <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: colors.text }]}>{count}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{t('active_staff')}</Text>
         </View>
         <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
         <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: Colors.accent }]}>{activeCount}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{t('working_now')}</Text>
         </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  staffCard: {
    padding: 16,
    marginBottom: 16,
  },
  staffMain: {
    flexDirection: 'row',
    gap: 16,
  },
  staffImageContainer: {
    position: 'relative',
  },
  staffImage: {
    width: 60,
    height: 60,
    borderRadius: 15,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  staffInfo: {
    flex: 1,
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  staffName: {
    fontSize: 17,
    fontWeight: '700',
  },
  staffRole: {
    fontSize: 13,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  staffDivider: {
    height: 1,
    marginVertical: 12,
    opacity: 0.1,
  },
  staffFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '800',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  currentTask: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  attendanceBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  attendanceBtnText: {
    fontSize: 10,
    fontWeight: '800',
  },
  tasksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tasksText: {
    fontSize: 11,
    fontWeight: '600',
  },
  quickStat: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  summaryCard: {
    padding: 16,
    marginBottom: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryVal: {
    fontSize: 24,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    opacity: 0.2,
  }
});
