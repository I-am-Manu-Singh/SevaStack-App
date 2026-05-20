import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { Layout, Palette, Sidebar, Square, Type, MousePointer2 } from 'lucide-react-native';
import { Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';

export default function CustomizationScreen() {
  const { colors, t } = useApp();
  const [glassEffect, setGlassEffect] = React.useState(true);
  const [compactMode, setCompactMode] = React.useState(false);
  const [showQuickActions, setShowQuickActions] = React.useState(true);
  
  const ACCENT_COLORS = [
    { name: 'Indigo', color: '#6366F1' },
    { name: 'Emerald', color: '#10B981' },
    { name: 'Rose', color: '#F43F5E' },
    { name: 'Amber', color: '#F59E0B' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: t('ui_customization') }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('interface_style')}</Text>
          <GlassCard style={styles.card}>
            <View style={styles.row}>
              <View style={styles.labelGroup}>
                <Palette size={20} color={colors.primary} />
                <View>
                  <Text style={[styles.label, { color: colors.text }]}>{t('glass_effect')}</Text>
                  <Text style={[styles.subLabel, { color: colors.textMuted }]}>{t('glass_effect_desc')}</Text>
                </View>
              </View>
              <Switch 
                value={glassEffect} 
                onValueChange={setGlassEffect}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <View style={styles.labelGroup}>
                <Square size={20} color={colors.primary} />
                <View>
                  <Text style={[styles.label, { color: colors.text }]}>{t('compact_dashboard')}</Text>
                  <Text style={[styles.subLabel, { color: colors.textMuted }]}>{t('compact_dashboard_desc')}</Text>
                </View>
              </View>
              <Switch 
                value={compactMode} 
                onValueChange={setCompactMode}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('accent_color')}</Text>
          <View style={styles.colorGrid}>
            {ACCENT_COLORS.map((c) => (
              <TouchableOpacity key={c.name} style={styles.colorItem}>
                <View style={[styles.colorCircle, { backgroundColor: c.color }]} />
                <Text style={[styles.colorName, { color: colors.text }]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('navigation')}</Text>
          <GlassCard style={styles.card}>
            <View style={styles.row}>
              <View style={styles.labelGroup}>
                <MousePointer2 size={20} color={colors.primary} />
                <View>
                  <Text style={[styles.label, { color: colors.text }]}>{t('quick_action_btn')}</Text>
                  <Text style={[styles.subLabel, { color: colors.textMuted }]}>{t('quick_action_btn_desc')}</Text>
                </View>
              </View>
              <Switch 
                value={showQuickActions} 
                onValueChange={setShowQuickActions}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </GlassCard>
        </View>

        <TouchableOpacity 
           style={[styles.resetBtn, { borderColor: colors.error }]}
           onPress={() => console.log("Reset UI")}
        >
           <Text style={[styles.resetText, { color: colors.error }]}>{t('reset_defaults')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
    marginLeft: 4,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    ...Typography.body,
    fontWeight: '600',
  },
  subLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.md,
  },
  colorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  colorItem: {
    alignItems: 'center',
    gap: 8,
  },
  colorCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  colorName: {
    fontSize: 10,
    fontWeight: '700',
  },
  resetBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  resetText: {
    fontWeight: 'bold',
  }
});
