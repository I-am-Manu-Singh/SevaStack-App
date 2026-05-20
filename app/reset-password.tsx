import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Lock, CheckCircle2, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const { colors, t } = useApp();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert("Required", "Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Invalid", "Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      Alert.alert("Reset Error", err.message || "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={[colors.primary + '20', colors.background]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.content}>
          <GlassCard style={styles.successCard}>
            <CheckCircle2 size={60} color={colors.success} style={{ marginBottom: Spacing.md }} />
            <Text style={[styles.title, { color: colors.text }]}>Password Updated</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Your password has been successfully updated. You can now access your dashboard.
            </Text>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary }]}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.btnText}>Go to Dashboard</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ 
        headerShown: true,
        title: "Reset Password",
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.replace('/login')} style={{ marginRight: 12 }}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
        )
      }} />
      <LinearGradient
        colors={[colors.primary + '20', colors.background]}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <GlassCard style={styles.card}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
              <Lock size={32} color={colors.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Create New Password</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
              Enter a secure password containing at least 6 characters.
            </Text>

            <View style={styles.inputContainer}>
              <Lock size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                placeholder="New Password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                placeholder="Confirm Password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary }]}
              onPress={handleResetPassword}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.btnText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </GlassCard>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  card: {
    padding: Spacing.xl,
    alignItems: 'center',
    borderRadius: 24,
  },
  successCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    borderRadius: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    ...Typography.h3,
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    ...Typography.body,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 44,
    paddingRight: 16,
    fontSize: 14,
  },
  btn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  btnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
