import { Appearance } from 'react-native';

export const LightColors = {
  primary: '#6366F1',
  secondary: '#F59E0B',
  accent: '#10B981',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  error: '#EF4444',
  success: '#10B981',
  glass: 'rgba(0, 0, 0, 0.03)',
  glassBorder: 'rgba(0, 0, 0, 0.08)',
};

export const DarkColors = {
  primary: '#6366F1', // Indigo
  secondary: '#F59E0B', // Amber/Saffron
  accent: '#10B981', // Emerald
  background: '#0F172A', // Slate 900
  surface: '#1E293B', // Slate 800
  surfaceLight: '#334155', // Slate 700
  text: '#F8FAFC', // Slate 50
  textMuted: '#94A3B8', // Slate 400
  border: '#334155',
  error: '#EF4444',
  success: '#10B981',
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
};

let currentAppTheme: 'light' | 'dark' = 'light';

export const setGlobalTheme = (theme: 'light' | 'dark') => {
  currentAppTheme = theme;
};

export const Colors = {
  get primary() {
    return currentAppTheme === 'dark' ? DarkColors.primary : LightColors.primary;
  },
  get secondary() {
    return currentAppTheme === 'dark' ? DarkColors.secondary : LightColors.secondary;
  },
  get accent() {
    return currentAppTheme === 'dark' ? DarkColors.accent : LightColors.accent;
  },
  get background() {
    return currentAppTheme === 'dark' ? DarkColors.background : LightColors.background;
  },
  get surface() {
    return currentAppTheme === 'dark' ? DarkColors.surface : LightColors.surface;
  },
  get surfaceLight() {
    return currentAppTheme === 'dark' ? DarkColors.surfaceLight : LightColors.surfaceLight;
  },
  get text() {
    return currentAppTheme === 'dark' ? DarkColors.text : LightColors.text;
  },
  get textMuted() {
    return currentAppTheme === 'dark' ? DarkColors.textMuted : LightColors.textMuted;
  },
  get border() {
    return currentAppTheme === 'dark' ? DarkColors.border : LightColors.border;
  },
  get error() {
    return currentAppTheme === 'dark' ? DarkColors.error : LightColors.error;
  },
  get success() {
    return currentAppTheme === 'dark' ? DarkColors.success : LightColors.success;
  },
  get glass() {
    return currentAppTheme === 'dark' ? DarkColors.glass : LightColors.glass;
  },
  get glassBorder() {
    return currentAppTheme === 'dark' ? DarkColors.glassBorder : LightColors.glassBorder;
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};
