import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
} from 'react-native-reanimated';
import { Spacing, Typography } from '../constants/Theme';
import { useApp } from '../lib/AppContext';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const { colors } = useApp();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary };
      case 'secondary':
        return { backgroundColor: colors.secondary };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  return (
    <AnimatedTouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.container,
        getVariantStyles(),
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : '#FFF'} />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[
            styles.text,
            variant === 'outline' && { color: colors.primary },
            variant === 'ghost' && { color: colors.primary },
            textStyle,
          ]}>
            {title}
          </Text>
        </>
      )}
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
  },
  text: {
    ...Typography.body,
    fontWeight: '600',
    color: '#FFF',
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
});
