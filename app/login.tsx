import { GlassCard } from '@/components/GlassCard';
import { Typography } from '@/constants/Theme';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { router, Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Globe, KeyRound, Lock, Mail, Smartphone, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

WebBrowser.maybeCompleteAuthSession();

// Get the redirect URL for social auth
const redirectTo = Linking.createURL('/(tabs)');

export default function LoginScreen() {
  const { t, colors, setUserRole, setIsDemoMode } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  const [emailMode, setEmailMode] = useState<'password' | 'otp'>('password');
  
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleAuth = async () => {
    if (authMode === 'phone') {
      if (!otpSent) {
        if (!phone) {
          Alert.alert("Required", "Please enter your phone number");
          return;
        }
        setIsLoading(true);
        try {
          const { error } = await supabase.auth.signInWithOtp({ phone: '+91' + phone });
          if (error) throw error;
          setOtpSent(true);
          Alert.alert("OTP Sent", "A verification code has been sent to your phone number.");
        } catch (error: any) {
          Alert.alert("Auth Error", error.message);
        } finally {
          setIsLoading(false);
        }
      } else {
        if (!otp) {
          Alert.alert("Required", "Please enter the OTP code");
          return;
        }
        setIsLoading(true);
        try {
          const { error } = await supabase.auth.verifyOtp({
            phone: '+91' + phone,
            token: otp,
            type: 'sms',
          });
          if (error) throw error;
        } catch (error: any) {
          Alert.alert("Auth Error", error.message);
        } finally {
          setIsLoading(false);
        }
      }
    } else if (authMode === 'email') {
      if (isForgotPassword) {
        if (!email) {
          Alert.alert("Required", "Please enter your email address");
          return;
        }
        setIsLoading(true);
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: Linking.createURL('/reset-password')
          });
          if (error) throw error;
          Alert.alert("Reset Sent", "Check your email for reset instructions.");
          setIsForgotPassword(false);
        } catch (error: any) {
          Alert.alert("Reset Error", error.message);
        } finally {
          setIsLoading(false);
        }
      } else if (emailMode === 'otp') {
        if (!otpSent) {
          if (!email) {
            Alert.alert("Required", "Please enter your email address");
            return;
          }
          setIsLoading(true);
          try {
            const { error } = await supabase.auth.signInWithOtp({ 
              email,
              options: {
                shouldCreateUser: true,
                emailRedirectTo: Linking.createURL('/login')
              }
            });
            if (error) throw error;
            setOtpSent(true);
            Alert.alert("OTP Sent", "A verification link or code has been sent to your email address.");
          } catch (error: any) {
            Alert.alert("Auth Error", error.message);
          } finally {
            setIsLoading(false);
          }
        } else {
          if (!otp) {
            Alert.alert("Required", "Please enter the verification code");
            return;
          }
          setIsLoading(true);
          try {
            const { error } = await supabase.auth.verifyOtp({
              email,
              token: otp,
              type: 'email',
            });
            if (error) throw error;
          } catch (error: any) {
            Alert.alert("Auth Error", error.message);
          } finally {
            setIsLoading(false);
          }
        }
      } else if (emailMode === 'password') {
        if (isRegister) {
          if (!email || !password) {
            Alert.alert("Required", "Please fill in email and password fields");
            return;
          }
          setIsLoading(true);
          try {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            Alert.alert("Success", "Account created! Please check your email for verification.");
          } catch (error: any) {
            Alert.alert("Auth Error", error.message);
          } finally {
            setIsLoading(false);
          }
        } else {
          if (!email || !password) {
            Alert.alert("Required", "Please enter your email and password");
            return;
          }
          setIsLoading(true);
          try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
          } catch (error: any) {
            Alert.alert("Auth Error", error.message);
          } finally {
            setIsLoading(false);
          }
        }
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      let redirectUrl = Linking.createURL('/login');
      if (!redirectUrl || redirectUrl === '/' || redirectUrl === 'null') {
        redirectUrl = 'sevastack://login';
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true
        }
      });
      if (error) throw error;
      if (!data?.url) throw new Error("No authorization URL returned from Supabase.");

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type === 'success' && result.url) {
        const urlStr = result.url;
        let accessToken: string | null = null;
        let refreshToken: string | null = null;

        const parseParams = (str: string) => {
          const params: Record<string, string> = {};
          const pairs = str.split('&');
          for (const pair of pairs) {
            const split = pair.split('=');
            if (split.length === 2) {
              params[decodeURIComponent(split[0])] = decodeURIComponent(split[1]);
            }
          }
          return params;
        };

        // 1. Try parsing hash fragment
        const hashSplit = urlStr.split('#');
        if (hashSplit.length >= 2) {
          const params = parseParams(hashSplit[1]);
          accessToken = params['access_token'] || null;
          refreshToken = params['refresh_token'] || null;
        }

        // 2. Try parsing query parameters
        if (!accessToken || !refreshToken) {
          const querySplit = urlStr.split('?');
          if (querySplit.length >= 2) {
            const cleanQuery = querySplit[1].split('#')[0];
            const params = parseParams(cleanQuery);
            accessToken = params['access_token'] || null;
            refreshToken = params['refresh_token'] || null;
          }
        }

        // 3. Try expo-linking parse
        if (!accessToken || !refreshToken) {
          const parsed = Linking.parse(urlStr);
          if (parsed.queryParams) {
            const rawAccess = parsed.queryParams['access_token'];
            const rawRefresh = parsed.queryParams['refresh_token'];
            accessToken = Array.isArray(rawAccess) ? rawAccess[0] : (rawAccess || null);
            refreshToken = Array.isArray(rawRefresh) ? rawRefresh[0] : (rawRefresh || null);
          }
        }

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
          console.log('Google Auth completed successfully via WebBrowser!');
          router.replace('/(tabs)');
        } else {
          throw new Error("Could not extract session tokens from redirect URL.");
        }
      }
    } catch (err: any) {
      Alert.alert(t('error' as any) || "Auth Error", err.message || "Google configuration required in Supabase dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  const bypassLogin = async () => {
    setIsDemoMode(true);
    setUserRole('merchant');
    router.replace('/(tabs)');
  };

  const activeHeaderTitle = () => {
    if (isForgotPassword) return "Reset Password";
    if (isRegister) return t('create_account') || "Create Account";
    return t('welcome') || "Welcome Back";
  };

  const activeHeaderSubtitle = () => {
    if (isForgotPassword) return "Enter your registered email to continue";
    if (isRegister) return t('elevate') || "Sign up to register your business";
    return t('login_to_continue') || "Login to manage your merchant hub";
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[colors.primary + '30', colors.background, colors.primary + '15']}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={{ position: 'absolute', top: -50, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: colors.primary + '20' }} />
      <View pointerEvents="none" style={{ position: 'absolute', bottom: -50, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: (colors.secondary || colors.accent) + '15' }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
          bounces={false}
          style={{ backgroundColor: 'transparent' }}
        >
          <View style={{ paddingHorizontal: 20, paddingVertical: 60 }}>

            {/* Header Area */}
            <View style={styles.header}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + '25' }]}>
                <Lock size={26} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {activeHeaderTitle()}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {activeHeaderSubtitle()}
              </Text>
            </View>

            {/* Form Card */}
            <GlassCard style={styles.authCard}>
              
              {/* Main Auth Mode Tabs (Less Cluttered 2-Tab structure) */}
              {!isForgotPassword && (
                <View style={[styles.tabBar, { backgroundColor: colors.surfaceLight + '30', borderColor: colors.border }]}>
                  <TouchableOpacity
                    onPress={() => { setAuthMode('phone'); setOtpSent(false); }}
                    style={[styles.tab, authMode === 'phone' && { backgroundColor: colors.primary }]}
                  >
                    <Text style={[styles.tabText, { color: authMode === 'phone' ? '#FFF' : colors.textMuted }]}>
                      {t('phone') || 'Phone'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { setAuthMode('email'); setOtpSent(false); }}
                    style={[styles.tab, authMode === 'email' && { backgroundColor: colors.primary }]}
                  >
                    <Text style={[styles.tabText, { color: authMode === 'email' ? '#FFF' : colors.textMuted }]}>
                      Email
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.form}>
                
                {/* 1. Phone OTP Inputs */}
                {authMode === 'phone' && !isForgotPassword && (
                  <>
                    {!otpSent ? (
                      <View style={styles.phoneInputRow}>
                        <View style={[styles.countryCode, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
                          <Text style={{ color: colors.text, fontWeight: 'bold' }}>+91</Text>
                        </View>
                        <View style={[
                          styles.inputGroup, 
                          { 
                            backgroundColor: colors.surfaceLight, 
                            borderColor: focusedField === 'phone' ? colors.primary : colors.border,
                          }
                        ]}>
                          <Smartphone size={20} color={colors.textMuted} />
                          <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder={t('phone_number') || 'Phone Number'}
                            placeholderTextColor={colors.textMuted}
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                          />
                        </View>
                      </View>
                    ) : (
                      <View style={[
                        styles.inputGroup, 
                        { 
                          backgroundColor: colors.surfaceLight, 
                          borderColor: focusedField === 'otp' ? colors.primary : colors.border,
                        }
                      ]}>
                        <KeyRound size={20} color={colors.textMuted} />
                        <TextInput
                          style={[styles.input, { color: colors.text }]}
                          placeholder={t('enter_otp') || 'Enter OTP Code'}
                          placeholderTextColor={colors.textMuted}
                          keyboardType="number-pad"
                          value={otp}
                          onChangeText={setOtp}
                          onFocus={() => setFocusedField('otp')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </View>
                    )}
                  </>
                )}

                {/* 2. Email Section (Toggles Password and OTP internally) */}
                {authMode === 'email' && !isForgotPassword && (
                  <>
                    {emailMode === 'otp' ? (
                      // Email OTP Flow
                      <>
                        {!otpSent ? (
                          <View style={[
                            styles.inputGroup, 
                            { 
                              backgroundColor: colors.surfaceLight, 
                              borderColor: focusedField === 'email_otp' ? colors.primary : colors.border,
                            }
                          ]}>
                            <Mail size={20} color={colors.textMuted} />
                            <TextInput
                              style={[styles.input, { color: colors.text }]}
                              placeholder={t('email_addr') || 'Email Address'}
                              placeholderTextColor={colors.textMuted}
                              keyboardType="email-address"
                              autoCapitalize="none"
                              value={email}
                              onChangeText={setEmail}
                              onFocus={() => setFocusedField('email_otp')}
                              onBlur={() => setFocusedField(null)}
                            />
                          </View>
                        ) : (
                          <View style={[
                            styles.inputGroup, 
                            { 
                              backgroundColor: colors.surfaceLight, 
                              borderColor: focusedField === 'otp' ? colors.primary : colors.border,
                            }
                          ]}>
                            <KeyRound size={20} color={colors.textMuted} />
                            <TextInput
                              style={[styles.input, { color: colors.text }]}
                              placeholder="Verification Code"
                              placeholderTextColor={colors.textMuted}
                              keyboardType="number-pad"
                              value={otp}
                              onChangeText={setOtp}
                              onFocus={() => setFocusedField('otp')}
                              onBlur={() => setFocusedField(null)}
                            />
                          </View>
                        )}
                      </>
                    ) : (
                      // Email Password Flow
                      <>
                        <View style={[
                          styles.inputGroup, 
                          { 
                            backgroundColor: colors.surfaceLight, 
                            borderColor: focusedField === 'email' ? colors.primary : colors.border,
                          }
                        ]}>
                          <Mail size={20} color={colors.textMuted} />
                          <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder={t('email_addr') || 'Email Address'}
                            placeholderTextColor={colors.textMuted}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                          />
                        </View>

                        <View style={[
                          styles.inputGroup, 
                          { 
                            backgroundColor: colors.surfaceLight, 
                            borderColor: focusedField === 'password' ? colors.primary : colors.border,
                          }
                        ]}>
                          <Lock size={20} color={colors.textMuted} />
                          <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder={t('password') || 'Password'}
                            placeholderTextColor={colors.textMuted}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                          />
                        </View>
                      </>
                    )}

                    {/* Email Sub-Modes Switcher Row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2, paddingHorizontal: 4 }}>
                      {emailMode === 'password' ? (
                        <TouchableOpacity onPress={() => setIsForgotPassword(true)}>
                          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
                            Forgot Password?
                          </Text>
                        </TouchableOpacity>
                      ) : <View />}

                      <TouchableOpacity 
                        onPress={() => { setEmailMode(emailMode === 'password' ? 'otp' : 'password'); setOtpSent(false); }}
                      >
                        <Text style={{ color: colors.secondary || colors.primary, fontSize: 12, fontWeight: '700' }}>
                          {emailMode === 'password' ? 'Use Email OTP' : 'Use Password'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {/* 3. Password Reset Form Input */}
                {isForgotPassword && (
                  <View style={[
                    styles.inputGroup, 
                    { 
                      backgroundColor: colors.surfaceLight, 
                      borderColor: focusedField === 'email' ? colors.primary : colors.border,
                    }
                  ]}>
                    <Mail size={20} color={colors.textMuted} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder={t('email_addr') || 'Email Address'}
                      placeholderTextColor={colors.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                )}

                {/* Submit Action Button */}
                <TouchableOpacity
                  onPress={handleAuth}
                  disabled={isLoading}
                  style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }]}
                >
                  <Text style={styles.submitBtnText}>
                    {isLoading ? 'Processing...' : (
                      isForgotPassword ? 'Reset Password' : (
                        otpSent ? 'Verify Code' : (
                          authMode === 'phone' ? 'Send OTP' : (
                            emailMode === 'otp' ? 'Send Verification' : (
                              isRegister ? 'Sign Up' : 'Log In'
                            )
                          )
                        )
                      )
                    )}
                  </Text>
                </TouchableOpacity>

                {/* Footer Switcher */}
                <View style={styles.footer}>
                  {isForgotPassword ? (
                    <TouchableOpacity onPress={() => setIsForgotPassword(false)} style={styles.toggleMode}>
                      <Text style={{ color: colors.textMuted }}>
                        Back to{' '}
                        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
                          Log In
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => { setIsRegister(!isRegister); setOtpSent(false); }} style={styles.toggleMode}>
                      <Text style={{ color: colors.textMuted }}>
                        {isRegister ? t('have_account') || "Already have an account?" : t('no_account') || "Don't have an account?"}{' '}
                        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
                          {isRegister ? t('login') || "Log In" : t('sign_up') || "Sign Up"}
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Social Login / Bypass section */}
                {!isForgotPassword && (
                  <>
                    <View style={styles.socialDivider}>
                      <View style={[styles.line, { backgroundColor: colors.border }]} />
                      <Text style={[styles.lineText, { color: colors.textMuted }]}>
                        {t('continue_with') || 'OR CONTINUE WITH'}
                      </Text>
                      <View style={[styles.line, { backgroundColor: colors.border }]} />
                    </View>

                    <View style={styles.socialRowCompact}>
                      <TouchableOpacity
                        onPress={handleGoogleLogin}
                        style={[styles.socialBtnSmall, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      >
                        <Globe size={18} color={colors.text} />
                        <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>Google</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={bypassLogin}
                        style={[styles.socialBtnSmall, { backgroundColor: colors.surface, borderColor: colors.primary + '40' }]}
                      >
                        <Zap size={18} color={colors.primary} />
                        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Demo Bypass</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </GlassCard>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...Typography.h2,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
  },
  authCard: {
    padding: 16,
    borderRadius: 24,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    marginBottom: 20,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    gap: 10,
    flex: 1,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countryCode: {
    width: 58,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 2,
  },
  forgotBtnTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 8,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  footer: {
    marginTop: 4,
    alignItems: 'center',
  },
  toggleMode: {
    padding: 10,
  },
  socialDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  lineText: {
    marginHorizontal: 12,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  socialRowCompact: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  socialBtnSmall: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
