import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '../constants/Theme';
import { BlurView } from 'expo-blur';
import { useApp } from '../lib/AppContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: any;
  intensity?: number;
  padding?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  style,
  intensity = 20,
  padding
}) => {
  const { theme, colors } = useApp();
  
  return (
    <View style={[
      styles.outerContainer, 
      { 
        backgroundColor: 'transparent', 
        borderColor: colors.glassBorder 
      },
      style
    ]}>
      <BlurView 
        intensity={intensity} 
        tint={theme === 'dark' ? 'dark' : 'light'} 
        style={[styles.blurContainer, padding !== undefined && { padding }]}
      >
        <View style={styles.innerContainer}>
          {children}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    marginVertical: Spacing.sm,
  },
  blurContainer: {
    padding: Spacing.md,
  },
  innerContainer: {
    // Let card content size naturally
  },
});
