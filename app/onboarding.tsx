import React from 'react';
import { StyleSheet, Text, View, ImageBackground, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/Theme';
import { Button } from '@/components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/lib/AppContext';

export default function OnboardingScreen() {
  const { t, colors } = useApp();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <ImageBackground 
        source={require('../assets/images/splash_premium.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', 'rgba(15, 23, 42, 0.8)', colors.background]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Text style={styles.tagline}>{t('tagline')}</Text>
            <Text style={[styles.description, { color: colors.textMuted }]}>
              {t('description')}
            </Text>
            
            <View style={styles.buttonContainer}>
              <Button 
                title={t('get_started')} 
                onPress={() => router.push('/login')} 
                style={styles.btn}
              />
              <Button 
                title={t('im_merchant')} 
                variant="outline"
                onPress={() => router.push('/login')} 
                style={styles.btn}
              />
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 60,
  },
  content: {
    alignItems: 'center',
  },
  tagline: {
    ...Typography.h1,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  btn: {
    width: '100%',
  },
});
