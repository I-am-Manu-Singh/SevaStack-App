import { StyleSheet, Dimensions } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/Theme';

const { width, height } = Dimensions.get('window');

export const G = StyleSheet.create({
  // Layout
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Typography
  h1: { ...Typography.h1, color: Colors.text },
  h2: { ...Typography.h2, color: Colors.text },
  h3: { ...Typography.h3, color: Colors.text },
  body: { ...Typography.body, color: Colors.text },
  caption: { ...Typography.caption, color: Colors.textMuted },
  label: { ...Typography.caption, color: Colors.text, fontWeight: '600' },
  errorText: { color: Colors.error, fontSize: 12, marginTop: 4 },

  // Sections
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
  },

  // Cards
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glass,
    marginBottom: Spacing.md,
  },

  // Inputs
  inputContainer: {
    marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Typography.body,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  // Buttons Helper
  btnPrimary: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Utilities
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceLight,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
});
