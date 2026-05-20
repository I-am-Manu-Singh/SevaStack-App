import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Switch, Platform } from 'react-native';
import { 
  Globe, 
  Moon, 
  ChevronRight, 
  Edit3,
  Crown,
  Sparkles,
  CheckCircle2
} from 'lucide-react-native';
import { Spacing, Typography } from '../constants/Theme';
import { GlassCard } from './GlassCard';
import { useApp } from '../lib/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Identity Widget
 */
export const IdentityWidget = ({ user, role, onEdit }: { user: any, role: string, onEdit: () => void }) => {
  const { colors } = useApp();
  const styles = getStyles(colors);

  const isMerchant = role === 'merchant';
  const isOwner = role === 'admin';

  return (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={isOwner ? ['#EC4899', '#8B5CF6'] : isMerchant ? [colors.primary, colors.accent] : ['#3B82F6', '#2DD4BF']}
          style={styles.avatarGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        </LinearGradient>
        <TouchableOpacity 
          style={[styles.editBadge, { backgroundColor: colors.surface, borderColor: colors.border }]} 
          onPress={onEdit}
          activeOpacity={0.8}
        >
          <Edit3 size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.profileInfo}>
        <View style={styles.nameRow}>
          <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
          {isOwner && <CheckCircle2 size={18} color="#8B5CF6" />}
        </View>
        <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user.email}</Text>
        
        <LinearGradient
          colors={isOwner ? ['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.15)'] : isMerchant ? ['rgba(99, 102, 241, 0.15)', 'rgba(16, 185, 129, 0.15)'] : ['rgba(59, 130, 246, 0.15)', 'rgba(45, 212, 191, 0.15)']}
          style={styles.roleBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[styles.roleBadgeText, { color: isOwner ? '#C084FC' : isMerchant ? colors.primary : '#38BDF8' }]}>
            {role.toUpperCase()}
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
};

/**
 * Preference Widget
 */
export const PreferenceWidget = () => {
  const { colors, theme, toggleTheme, language, setLanguage, t } = useApp();
  const styles = getStyles(colors);

  const cycleLanguage = () => {
    const langs: ('en' | 'hi' | 'pa' | 'ta')[] = ['en', 'hi', 'pa', 'ta'];
    const currentIndex = langs.indexOf(language);
    const nextIndex = (currentIndex + 1) % langs.length;
    setLanguage(langs[nextIndex]);
  };

  const getLangDisplay = (lang: string) => {
    switch(lang) {
      case 'en': return 'English';
      case 'hi': return 'हिंदी';
      case 'pa': return 'ਪੰਜਾਬੀ';
      case 'ta': return 'தமிழ்';
      default: return 'English';
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('preferences')}</Text>
      <GlassCard style={{ padding: 0, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
        <View style={styles.prefItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Moon size={18} color={colors.primary} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>{t('dark_mode')}</Text>
          </View>
          <Switch 
            value={theme === 'dark'} 
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary + '50' }}
            thumbColor={theme === 'dark' ? colors.primary : '#f4f3f4'}
          />
        </View>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.menuItem} onPress={cycleLanguage} activeOpacity={0.7}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconContainer, { backgroundColor: colors.accent + '15' }]}>
              <Globe size={18} color={colors.accent} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>{t('app_lang')}</Text>
          </View>
          <View style={styles.itemRight}>
             <Text style={[styles.valTxt, { color: colors.primary }]}>{getLangDisplay(language)}</Text>
             <ChevronRight size={18} color={colors.textMuted} />
          </View>
        </TouchableOpacity>
      </GlassCard>
    </View>
  );
};

/**
 * Subscription Widget
 */
export const SubscriptionWidget = () => {
  const { colors, t } = useApp();
  const styles = getStyles(colors);

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.subContainer}>
      <LinearGradient
        colors={['#F59E0B', '#D97706', '#B45309']}
        style={styles.subCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.subHeader}>
          <View style={styles.goldBadge}>
             <Crown size={22} color="#FFF" />
          </View>
          <View style={styles.subInfo}>
             <Text style={styles.subTitle}>{t('subscription')} {t('premium')}</Text>
             <Text style={styles.subDate}>{t('expires_in')} 12 {t('days_suffix')} • {t('active_plan')}</Text>
          </View>
          <TouchableOpacity style={styles.renewBtn} activeOpacity={0.8}>
             <Text style={styles.renewText}>{t('renew')}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Decorative subtle sparkles */}
        <View style={styles.sparkleDecoration}>
          <Sparkles size={40} color="rgba(255, 255, 255, 0.15)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGradient: {
    padding: 3,
    borderRadius: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 21,
    backgroundColor: '#E2E8F0',
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
    marginLeft: 4,
  },
  prefItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    opacity: 0.08,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valTxt: {
    fontSize: 13,
    fontWeight: '700',
  },
  subContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    elevation: 4,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  subCardGradient: {
    padding: 20,
    position: 'relative',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    zIndex: 2,
  },
  goldBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  subInfo: {
    flex: 1,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.2,
  },
  subDate: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  renewBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  renewText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  sparkleDecoration: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.6,
  }
});
