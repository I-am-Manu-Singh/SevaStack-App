import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl, Image, TextInput, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { 
  Plus, 
  Search, 
  Calendar,
  MoreVertical,
  Clock,
  Activity,
  UserCheck,
  UserX,
  Phone,
  MessageSquare,
  X
} from 'lucide-react-native';
import { Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

export default function StaffScreen() {
  const { t, colors, theme, profile } = useApp();
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStaff = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('merchant_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchStaff();
  };

  const activeStaffCount = staff.filter(s => s.status === 'Active').length;
  const coveragePercent = staff.length > 0 ? Math.round((activeStaffCount / staff.length) * 100) : 0;

  const toggleStaffStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Off-Duty' : 'Active';
    // Optimistic UI update
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    
    try {
      const { error } = await supabase
        .from('staff')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) {
        // Revert on error
        setStaff(prev => prev.map(s => s.id === id ? { ...s, status: currentStatus } : s));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ 
        title: 'Staff Management',
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text, fontWeight: '800' },
        headerTintColor: colors.primary,
        headerRight: () => (
          <TouchableOpacity 
            style={[styles.headerAddBtn, { backgroundColor: colors.primary }]}
            onPress={() => alert("Staff onboarding flow placeholder")}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#FFF" />
          </TouchableOpacity>
        )
      }} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Dynamic Attendance Dashboard */}
        <View style={styles.attendanceSummary}>
           <GlassCard style={{ padding: 12, borderWidth: 1, borderColor: colors.border }}>
              <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                   <View style={[styles.summaryIconBadge, { backgroundColor: colors.primary + '12' }]}>
                     <Clock size={20} color={colors.primary} />
                   </View>
                   <Text style={[styles.summaryVal, { color: colors.text }]}>{activeStaffCount}</Text>
                   <Text style={[styles.summaryLab, { color: colors.textMuted }]}>{t('on_duty')}</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryItem}>
                   <View style={[styles.summaryIconBadge, { backgroundColor: colors.success + '12' }]}>
                     <Activity size={20} color={colors.success || '#10B981'} />
                   </View>
                   <Text style={[styles.summaryVal, { color: colors.text }]}>{coveragePercent}%</Text>
                   <Text style={[styles.summaryLab, { color: colors.textMuted }]}>{t('coverage')}</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryItem}>
                   <View style={[styles.summaryIconBadge, { backgroundColor: colors.accent + '12' }]}>
                     <UserCheck size={20} color={colors.accent} />
                   </View>
                   <Text style={[styles.summaryVal, { color: colors.text }]}>{staff.length}</Text>
                   <Text style={[styles.summaryLab, { color: colors.textMuted }]}>Total Staff</Text>
                </View>
              </View>
           </GlassCard>
        </View>

        {/* Staff Search/Filter */}
        <View style={styles.filterRow}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Search size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('search_staff') || 'Search staff name or role...'}
              placeholderTextColor={colors.textMuted}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity 
            style={[styles.filterBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Calendar size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Staff List Rendering */}
        <View style={styles.staffList}>
          {isLoading ? (
            // Skeleton Loader
            [1, 2, 3].map((key) => (
              <GlassCard key={key} style={{ borderWidth: 1, borderColor: colors.border }}>
                <View style={[styles.skeletonRow, { opacity: 0.3 }]}>
                  <View style={[styles.skeletonAvatar, { backgroundColor: colors.border }]} />
                  <View style={styles.skeletonTextContainer}>
                    <View style={[styles.skeletonText, { backgroundColor: colors.border, width: '60%' }]} />
                    <View style={[styles.skeletonText, { backgroundColor: colors.border, width: '40%', marginTop: 8 }]} />
                  </View>
                </View>
              </GlassCard>
            ))
          ) : filteredStaff.length === 0 ? (
            // Empty State
            <View style={styles.emptyState}>
              <UserX size={44} color={colors.textMuted} style={{ opacity: 0.5 }} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Staff Found</Text>
              <Text style={[styles.emptySub, { color: colors.textMuted }]}>Add your employees to start managing your team.</Text>
            </View>
          ) : (
            filteredStaff.map((member) => {
              const isActive = member.status === 'Active';
              return (
                <GlassCard key={member.id} style={{ padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 20 }}>
                  <View style={styles.staffMain}>
                    <View style={styles.staffImageContainer}>
                      <View style={[styles.staffImageWrapper, { borderColor: isActive ? colors.success || '#10B981' : colors.error }]}>
                        {member.avatar_url ? (
                          <Image source={{ uri: member.avatar_url }} style={styles.staffImage} />
                        ) : (
                          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textMuted }}>
                            {member.name.charAt(0)}
                          </Text>
                        )}
                      </View>
                      <View style={[
                        styles.statusIndicator, 
                        { backgroundColor: isActive ? '#10B981' : '#EF4444', borderColor: colors.surface }
                      ]} />
                    </View>
                    
                    <View style={styles.staffInfo}>
                      <View style={styles.staffHeader}>
                        <View>
                          <Text style={[styles.staffName, { color: colors.text }]}>{member.name}</Text>
                          <Text style={[styles.staffRole, { color: colors.textMuted }]}>{member.role}</Text>
                        </View>
                        <TouchableOpacity activeOpacity={0.6}>
                          <MoreVertical size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.primary + '12' }]} activeOpacity={0.7}>
                          <Phone size={13} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.accent + '12' }]} activeOpacity={0.7}>
                          <MessageSquare size={13} color={colors.accent} />
                        </TouchableOpacity>
                        
                        <View style={{ flex: 1 }} />
                        
                        <TouchableOpacity 
                          style={[
                            styles.attendanceBtn, 
                            { backgroundColor: isActive ? '#EF4444' + '14' : '#10B981' + '14' }
                          ]}
                          onPress={() => toggleStaffStatus(member.id, member.status)}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.attendanceBtnText, 
                            { color: isActive ? '#EF4444' : '#10B981' }
                          ]}>
                            {isActive ? 'Mark Off-Duty' : 'Mark Active'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </GlassCard>
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  headerAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceSummary: {
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryVal: {
    fontSize: 20,
    fontWeight: '900',
  },
  summaryLab: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryDivider: {
    width: 1,
    height: 48,
    opacity: 0.08,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  staffList: {
    gap: 12,
  },
  staffMain: {
    flexDirection: 'row',
    gap: 12,
  },
  staffImageContainer: {
    position: 'relative',
  },
  staffImageWrapper: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  staffImage: {
    width: '100%',
    height: '100%',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 2.5,
  },
  staffInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  staffName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  staffRole: {
    fontSize: 12,
    marginTop: 1,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  quickAction: {
    width: 28,
    height: 28,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  attendanceBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: Spacing.md,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: 24,
    fontWeight: '600',
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skeletonAvatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonText: {
    height: 14,
    borderRadius: 6,
  }
});
