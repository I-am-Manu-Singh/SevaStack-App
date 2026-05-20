import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { ShieldCheck, UserCheck, Key, Lock, Fingerprint } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';

export default function SecurityScreen() {
  const { colors, theme } = useApp();
  const [twoFactor, setTwoFactor] = useState(true);
  const [biometric, setBiometric] = useState(false);

  const ROLES = [
    { id: '1', role: 'Store Manager', access: 'Full Access', users: 2 },
    { id: '2', role: 'Cashier', access: 'Billing & POS', users: 4 },
    { id: '3', role: 'Inventory Staff', access: 'Stock & Delivery', users: 3 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Access Control', headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.primary }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <GlassCard style={styles.heroCard}>
          <ShieldCheck size={40} color={colors.primary} />
          <Text style={[styles.heroTitle, { color: colors.text }]}>Security Settings</Text>
          <Text style={[styles.heroSub, { color: colors.textMuted }]}>Manage who has access to your business hub and protect sensitive data.</Text>
        </GlassCard>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>Authentication</Text>
        
        <GlassCard style={styles.settingCard}>
           <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: colors.primary + '20' }]}>
                 <Key size={20} color={colors.primary} />
              </View>
              <View>
                 <Text style={[styles.settingTitle, { color: colors.text }]}>Two-Factor Auth</Text>
                 <Text style={[styles.settingSub, { color: colors.textMuted }]}>Require OTP for login</Text>
              </View>
           </View>
           <Switch value={twoFactor} onValueChange={setTwoFactor} trackColor={{ true: colors.primary }} />
        </GlassCard>

        <GlassCard style={styles.settingCard}>
           <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: colors.accent + '20' }]}>
                 <Fingerprint size={20} color={colors.accent} />
              </View>
              <View>
                 <Text style={[styles.settingTitle, { color: colors.text }]}>Biometric Unlock</Text>
                 <Text style={[styles.settingSub, { color: colors.textMuted }]}>Use FaceID / TouchID</Text>
              </View>
           </View>
           <Switch value={biometric} onValueChange={setBiometric} trackColor={{ true: colors.primary }} />
        </GlassCard>

        <View style={styles.sectionHeader}>
           <Text style={[styles.sectionTitle, { color: colors.text }]}>Role Permissions</Text>
           <TouchableOpacity>
             <Text style={[styles.seeAll, { color: colors.primary }]}>Add Role</Text>
           </TouchableOpacity>
        </View>

        {ROLES.map(role => (
          <GlassCard key={role.id} style={styles.roleCard}>
             <View style={styles.roleHeader}>
                <View style={styles.roleLeft}>
                   <UserCheck size={18} color={colors.text} />
                   <Text style={[styles.roleName, { color: colors.text }]}>{role.role}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors.surface }]}>
                   <Text style={[styles.badgeTxt, { color: colors.textMuted }]}>{role.users} Users</Text>
                </View>
             </View>
             <View style={[styles.roleFooter, { borderTopColor: colors.border }]}>
                <Lock size={14} color={colors.primary} />
                <Text style={[styles.roleAccess, { color: colors.primary }]}>{role.access}</Text>
             </View>
          </GlassCard>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  heroCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  heroSub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '700',
  },
  settingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  settingSub: {
    fontSize: 11,
    marginTop: 2,
  },
  roleCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleName: {
    fontSize: 15,
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTxt: {
    fontSize: 10,
    fontWeight: '700',
  },
  roleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  roleAccess: {
    fontSize: 12,
    fontWeight: '700',
  }
});
