import { StyleSheet } from 'react-native';
import { Spacing, Typography, LightColors } from './Theme';

export const getGlobalStyles = (colors: typeof LightColors) => {
  return StyleSheet.create({
    // Core Layout Containers
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: Spacing.md,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xl,
    },

    // Form inputs and Labels
    inputLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
    },
    input: {
      height: 52,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      color: colors.text,
      paddingHorizontal: 16,
      fontSize: 14,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
      paddingTop: 12,
    },

    // Standard Cards & Dividers
    glassCard: {
      borderRadius: 16,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: colors.surface,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: Spacing.md,
    },
    emptyCard: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xxl,
      gap: 12,
    },

    // Unified Buttons
    primaryButton: {
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    primaryButtonText: {
      color: '#FFF',
      fontSize: 15,
      fontWeight: '800',
    },
    outlineButton: {
      height: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    outlineButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
    },

    // Typography
    headerArea: {
      marginBottom: Spacing.lg,
      paddingHorizontal: 4,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.5,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
      marginVertical: Spacing.sm,
      marginLeft: 4,
    },
    descriptionText: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textMuted,
      marginTop: 4,
    },

    // Badges
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      color: '#FFF',
      fontSize: 10,
      fontWeight: '800',
    },

    // Tab Bars & Category Switchers
    tabBar: {
      flexDirection: 'row',
      borderRadius: 16,
      padding: 4,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginBottom: Spacing.lg,
    },
    tab: {
      flex: 1,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabText: {
      fontSize: 11,
      fontWeight: '800',
    },
  });
};
