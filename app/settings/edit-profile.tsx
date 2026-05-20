import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Camera, Mail, Phone, MapPin, Briefcase, Save, Check, FileText } from 'lucide-react-native';
import { Spacing, Typography } from '@/constants/Theme';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/GlassCard';

interface InputFieldProps {
  field: string;
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  icon: any;
  multiline?: boolean;
  editable?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  colors: any;
  styles: any;
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
}

const InputField = React.memo(({
  field,
  label,
  value,
  onChange,
  placeholder,
  icon,
  multiline = false,
  editable = true,
  keyboardType = 'default',
  colors,
  styles,
  focusedField,
  setFocusedField
}: InputFieldProps) => {
  const Icon = icon;
  const isFocused = focusedField === field;
  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: isFocused ? colors.primary : colors.textMuted }]}>{label}</Text>
      <View style={[
        styles.inputWrapper, 
        { 
          backgroundColor: editable ? colors.surface : colors.surfaceLight, 
          borderColor: isFocused ? colors.primary : colors.border,
        },
        isFocused && {
          shadowColor: colors.primary,
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 8,
          elevation: 2,
        }
      ]}>
        <Icon size={18} color={isFocused ? colors.primary : colors.textMuted} />
        <TextInput
          style={[styles.textInput, { color: editable ? colors.text : colors.textMuted }, multiline && { height: 80, textAlignVertical: 'top' }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          editable={editable}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );
});

export default function EditProfileScreen() {
  const { colors, t, theme, profile, updateProfile } = useApp();
  const router = useRouter();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const [dbProfile, setDbProfile] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || '');
          const { data, error } = await supabase
            .from('merchants')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') throw error;
          if (data) {
            setDbProfile(data);
            setBusinessName(data.business_name || '');
            setDescription(data.description || '');
            setPhone(data.phone || '');
            setAddress(data.address || '');
            setLogoUrl(data.logo_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80');
          }
        } else {
          // Demo fallback
          if (profile) {
            setBusinessName(profile.business_name || '');
            setDescription(profile.description || '');
            setPhone(profile.phone || '');
            setAddress(profile.address || '');
            setLogoUrl(profile.logo_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80');
            setEmail('demo@merchantapp.com');
          }
        }
      } catch (err: any) {
        console.warn("Error loading profile:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!businessName.trim()) {
      Alert.alert("Required", "Business Name is required.");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && dbProfile) {
        const { error } = await supabase
          .from('merchants')
          .update({
            business_name: businessName.trim(),
            description: description.trim(),
            phone: phone.trim(),
            address: address.trim(),
            logo_url: logoUrl.trim()
          })
          .eq('id', dbProfile.id);

        if (error) throw error;
        
        updateProfile({
          business_name: businessName.trim(),
          description: description.trim(),
          phone: phone.trim(),
          address: address.trim(),
          logo_url: logoUrl.trim()
        });

        setSuccess(true);
        setTimeout(() => {
          router.back();
        }, 800);
      } else {
        updateProfile({
          business_name: businessName.trim(),
          description: description.trim(),
          phone: phone.trim(),
          address: address.trim(),
          logo_url: logoUrl.trim()
        });
        setSuccess(true);
        setTimeout(() => {
          router.back();
        }, 800);
      }
    } catch (err: any) {
      Alert.alert("Error Saving Profile", err.message);
    } finally {
      setSaving(false);
    }
  };

  // Removed renderInputField helper to prevent component recreation glitchiness.

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ 
        title: 'Edit Profile',
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text, fontWeight: '800' },
        headerTintColor: colors.primary,
        headerRight: () => (
          <TouchableOpacity onPress={handleSave} disabled={saving || success} style={styles.headerSaveBtn}>
            {saving ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : success ? (
              <Check size={20} color={colors.success || '#10B981'} />
            ) : (
              <Save size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        )
      }} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Avatar Glow Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarGlowContainer}>
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              style={styles.avatarBorderGlow}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Image 
                source={{ uri: logoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' }} 
                style={styles.avatar} 
              />
            </LinearGradient>
            <TouchableOpacity 
              style={[styles.cameraBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                Alert.prompt(
                  "Update Logo URL",
                  "Enter the image URL for your business logo:",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Update", onPress: (url?: string) => url && setLogoUrl(url) }
                  ],
                  "plain-text",
                  logoUrl
                );
              }}
              activeOpacity={0.8}
            >
              <Camera size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.changePhotoTxt, { color: colors.primary }]}>{t('change_photo')}</Text>
        </View>

        {/* Form Inputs */}
        <GlassCard style={styles.formCard}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>{t('business_profile')}</Text>
          <InputField field="businessName" label="Business Name *" value={businessName} onChange={setBusinessName} placeholder="Name of your center/shop" icon={Briefcase} colors={colors} styles={styles} focusedField={focusedField} setFocusedField={setFocusedField} />
          <InputField field="description" label="Business Description" value={description} onChange={setDescription} placeholder="A brief summary of your service" icon={FileText} multiline colors={colors} styles={styles} focusedField={focusedField} setFocusedField={setFocusedField} />

          <Text style={[styles.sectionHeading, { color: colors.text, marginTop: 16 }]}>{t('contact_details')}</Text>
          <InputField field="email" label="Account Email (Non-editable)" value={email} onChange={() => {}} placeholder="admin@sevastack.com" icon={Mail} editable={false} keyboardType="email-address" colors={colors} styles={styles} focusedField={focusedField} setFocusedField={setFocusedField} />
          <InputField field="phone" label="Phone Number" value={phone} onChange={setPhone} placeholder="Your contact number" icon={Phone} keyboardType="phone-pad" colors={colors} styles={styles} focusedField={focusedField} setFocusedField={setFocusedField} />
          <InputField field="address" label="Business Address" value={address} onChange={setAddress} placeholder="Physical location details" icon={MapPin} multiline colors={colors} styles={styles} focusedField={focusedField} setFocusedField={setFocusedField} />
        </GlassCard>

        {/* Dynamic Save Action button */}
        <TouchableOpacity 
          style={styles.saveBtnContainer}
          onPress={handleSave}
          disabled={saving || success}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={success ? [colors.success || '#10B981', colors.success || '#10B981'] : [colors.primary, colors.accent]}
            style={styles.saveBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>{success ? "Profile Updated Successfully!" : t('save_changes')}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  avatarGlowContainer: {
    position: 'relative',
    width: 106,
    height: 106,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBorderGlow: {
    width: 106,
    height: 106,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 33,
    backgroundColor: '#E2E8F0',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
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
  changePhotoTxt: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  formCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    marginBottom: Spacing.xl,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  inputContainer: {
    gap: 6,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    minHeight: 50,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 8,
  },
  headerSaveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveBtnContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  saveBtnGradient: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
