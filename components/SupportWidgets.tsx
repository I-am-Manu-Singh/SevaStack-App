import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, LayoutAnimation } from 'react-native';
import { 
  MessageCircle, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  Clock,
  ExternalLink
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../constants/Theme';
import { GlassCard } from './GlassCard';
import { useApp } from '../lib/AppContext';

/**
 *  Contact Channel Widget
 * Premium card for support channels
 */
export const ContactChannelWidget = ({ type, label, desc, icon: Icon }: { 
  type: 'chat' | 'call', 
  label: string, 
  desc: string, 
  icon: any 
}) => {
  const { colors } = useApp();
  
  const handlePress = () => {
    if (type === 'call') {
      Linking.openURL('tel:+910000000000');
    } else {
      // Navigate to chat or open WhatsApp
      Linking.openURL('https://wa.me/910000000000');
    }
  };

  return (
    <TouchableOpacity style={styles.channelBtn} onPress={handlePress}>
      <GlassCard style={styles.channelCard}>
        <View style={[styles.iconBox, { backgroundColor: type === 'call' ? Colors.accent + '15' : colors.primary + '15' }]}>
           <Icon size={24} color={type === 'call' ? Colors.accent : colors.primary} />
        </View>
        <Text style={[styles.channelLabel, { color: colors.text }]}>{label}</Text>
        <View style={styles.statusRow}>
           <Clock size={10} color={colors.textMuted} />
           <Text style={[styles.channelDesc, { color: colors.textMuted }]}>{desc}</Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

/**
 *  FAQ Accordion Widget
 * Expandable FAQ items
 */
export const FAQWidget = ({ question, answer }: { question: string, answer: string }) => {
  const [expanded, setExpanded] = useState(false);
  const { colors } = useApp();

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity onPress={toggle} activeOpacity={0.7} style={[styles.faqOuter, { borderBottomColor: colors.border }]}>
      <View style={styles.faqHeader}>
         <Text style={[styles.faqQuestion, { color: colors.text }]}>{question}</Text>
         {expanded ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />}
      </View>
      {expanded && (
        <View style={styles.faqBody}>
           <Text style={[styles.faqAnswer, { color: colors.textMuted }]}>{answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  channelBtn: {
    flex: 1,
  },
  channelCard: {
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  channelLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  channelDesc: {
    fontSize: 10,
    fontWeight: '600',
  },
  faqOuter: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  faqBody: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 8,
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 20,
  }
});
