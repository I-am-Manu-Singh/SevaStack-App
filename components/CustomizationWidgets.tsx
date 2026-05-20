import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch } from 'react-native';
import { 
  Palette, 
  Eye, 
  EyeOff, 
  Layout, 
  ChevronRight,
  Sparkles,
  Smartphone
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../constants/Theme';
import { GlassCard } from './GlassCard';
import { useApp } from '../lib/AppContext';

/**
 *  Branding Widget
 * Business name and theme color customization
 */
export const BrandingWidget = ({ name, color, onNameChange, onColorPress }: { 
  name: string, 
  color: string, 
  onNameChange: (t: string) => void, 
  onColorPress: () => void 
}) => {
  const { colors } = useApp();
  
  return (
    <GlassCard style={styles.card}>
      <Text style={[styles.label, { color: colors.textMuted }]}>BUSINESS NAME</Text>
      <TextInput 
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        value={name}
        onChangeText={onNameChange}
        placeholder="e.g. Seva Barber Kota"
        placeholderTextColor={colors.textMuted}
      />

      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={[styles.label, { color: colors.textMuted }]}>PRIMARY BRAND COLOR</Text>
          <TouchableOpacity onPress={onColorPress} style={[styles.colorItem, { borderColor: colors.border }]}>
             <View style={[styles.colorBall, { backgroundColor: color }]} />
             <Text style={[styles.colorText, { color: colors.text }]}>{color}</Text>
             <Palette size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </GlassCard>
  );
};

/**
 *  Navigation Tab Widget
 * Individual tab configuration card
 */
export const NavTabWidget = ({ tab, onToggle, onRename }: { 
  tab: any, 
  onToggle: () => void, 
  onRename: (t: string) => void 
}) => {
  const { colors } = useApp();
  
  return (
    <GlassCard style={styles.tabCard}>
      <View style={styles.tabContent}>
        <View style={[styles.iconBox, { backgroundColor: tab.isVisible ? colors.primary + '15' : colors.surfaceLight + '30' }]}>
           <Layout size={20} color={tab.isVisible ? colors.primary : colors.textMuted} />
        </View>
        <View style={styles.flex1}>
           <TextInput 
             style={[styles.tabInput, { color: tab.isVisible ? colors.text : colors.textMuted }]}
             value={tab.label}
             onChangeText={onRename}
           />
        </View>
        <TouchableOpacity onPress={onToggle} style={styles.eyeBtn}>
           {tab.isVisible ? (
             <Eye size={20} color={colors.primary} />
           ) : (
             <EyeOff size={20} color={colors.textMuted} />
           )}
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
};

/**
 *  Layout Template Widget
 * Card for selecting app layout templates
 */
export const LayoutTemplateWidget = ({ template, onSelect }: { template: any, onSelect: () => void }) => {
  const { colors } = useApp();
  
  return (
    <TouchableOpacity onPress={onSelect}>
      <GlassCard style={styles.templateCard}>
        <View style={[styles.tmplIcon, { backgroundColor: colors.surfaceLight + '30' }]}>
           <Smartphone size={20} color={colors.primary} />
        </View>
        <View style={styles.flex1}>
           <Text style={[styles.tmplName, { color: colors.text }]}>{template.name}</Text>
           <Text style={[styles.tmplDesc, { color: colors.textMuted }]}>{template.description}</Text>
        </View>
        <Sparkles size={16} color={Colors.secondary} />
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  colorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 12,
  },
  colorBall: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  colorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  tabCard: {
    padding: 12,
    marginBottom: 12,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabInput: {
    fontSize: 16,
    fontWeight: '700',
    padding: 0,
  },
  eyeBtn: {
    padding: 4,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 12,
    gap: 14,
  },
  tmplIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tmplName: {
    fontSize: 15,
    fontWeight: '700',
  },
  tmplDesc: {
    fontSize: 11,
    marginTop: 2,
  }
});
