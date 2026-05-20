import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Theme';
import { AppProvider, useApp } from '@/lib/AppContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'onboarding',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppProvider>
      <RootLayoutNav />
    </AppProvider>
  );
}


import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

function RootLayoutNav() {
  const { theme, colors, isLoading: isPrefsLoading, isDemoMode, setIsDemoMode, session } = useApp();
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // Handle Deep Linking for OAuth & Password Reset
  useEffect(() => {
    const handleDeepLink = async (url: string | null) => {
      if (!url) return;
      console.log('Received deep link URL:', url);
      
      const hashSplit = url.split('#');
      if (hashSplit.length < 2) {
        const querySplit = url.split('?');
        if (querySplit.length < 2) return;
      }
      
      const fragment = hashSplit[1] || url.split('?')[1];
      const params = new URLSearchParams(fragment);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');
      
      if (accessToken && refreshToken) {
        setIsAuthLoading(true);
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) throw error;
          
          console.log('Session set successfully from deep link!');
          
          try {
            await WebBrowser.dismissBrowser();
          } catch (e) {
            console.log('Error dismissing browser:', e);
          }
          
          if (url.includes('reset-password') || type === 'recovery') {
            router.replace('/reset-password');
          } else {
            router.replace('/(tabs)');
          }
        } catch (err: any) {
          Alert.alert("Auth Error", "Failed to restore session: " + err.message);
        } finally {
          setIsAuthLoading(false);
        }
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);
  
  // Handle Protected Routes
  useEffect(() => {
    if (isAuthLoading || isPrefsLoading) return;

    const inTabsGroup = segments[0] === '(tabs)';
    
    if (!session && inTabsGroup && !isDemoMode) {
      // Not logged in, redirect to onboarding
      router.replace('/onboarding');
    } else if (session && !inTabsGroup) {
      // Logged in, redirect to main app
      router.replace('/(tabs)');
    }
  }, [session, segments, isAuthLoading, isPrefsLoading, isDemoMode]);

  if (isAuthLoading || isPrefsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const NavigationTheme = theme === 'dark' ? {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
  } : {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
  };

  return (
    <ThemeProvider value={NavigationTheme}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} translucent backgroundColor="transparent" />
      <Stack screenOptions={{ 
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '800',
          color: colors.text,
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="login" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
