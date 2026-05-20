import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Alert, 
  ActivityIndicator, 
  TextInput, 
  Modal,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  Globe, 
  Bell, 
  Lock, 
  Shield, 
  Eye, 
  Trash2, 
  Moon, 
  Sun, 
  User, 
  ChevronRight, 
  Users, 
  Palette, 
  Clock, 
  IndianRupee, 
  PlusCircle, 
  X,
  ShieldCheck,
  BookOpen
} from 'lucide-react-native';
import { Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
];

export default function SettingsScreen() {
  const { theme, toggleTheme, language, setLanguage, colors, t, userRole, setUserRole } = useApp();
  const [profile, setProfile] = useState<any>(null);
  const [activeHours, setActiveHours] = useState('09:00 AM - 08:30 PM');
  const [holidayMode, setHolidayMode] = useState(false);
  const [notifs, setNotifs] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [tempHours, setTempHours] = useState('');
  
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [newTypeId, setNewTypeId] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDesc, setNewTypeDesc] = useState('');
  const [newTypeIcon, setNewTypeIcon] = useState('Briefcase');
  const [newTypeRoute, setNewTypeRoute] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Change Password state
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const router = useRouter();

  const handleUpdatePassword = async () => {
    if (!newPass.trim()) {
      Alert.alert("Required", "Please enter a new password.");
      return;
    }
    if (newPass.length < 6) {
      Alert.alert("Invalid", "Password must be at least 6 characters.");
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.auth.updateUser({ password: newPass });
        if (error) throw error;
        Alert.alert("Success", "Password updated successfully!");
        setShowPassModal(false);
        setNewPass('');
        setConfirmPass('');
      } else {
        Alert.alert("Demo Mode", "Password updated locally.");
        setShowPassModal(false);
        setNewPass('');
        setConfirmPass('');
      }
    } catch (err: any) {
      Alert.alert("Update Failed", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  async function fetchSettingsProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('merchants')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (data) {
          setProfile(data);
          setActiveHours(data.active_hours || '09:00 AM - 08:30 PM');
          setHolidayMode(data.holiday_mode || false);
        }
      }
    } catch (err) {
      console.warn("Could not fetch profile in settings:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettingsProfile();
  }, []);

  const handleToggleHoliday = async (value: boolean) => {
    setHolidayMode(value);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && profile) {
        const { error } = await supabase
          .from('merchants')
          .update({ holiday_mode: value })
          .eq('id', profile.id);
        if (error) throw error;
        Alert.alert("Success", `Holiday Mode ${value ? 'Enabled' : 'Disabled'}`);
      } else {
        Alert.alert("Demo Mode", "Holiday mode updated locally.");
      }
    } catch (err: any) {
      Alert.alert("Update Failed", err.message);
      setHolidayMode(!value);
    }
  };

  const handleSaveHours = async () => {
    if (!tempHours.trim()) {
      Alert.alert("Required", "Please enter valid active hours.");
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && profile) {
        const { error } = await supabase
          .from('merchants')
          .update({ active_hours: tempHours })
          .eq('id', profile.id);
        if (error) throw error;
        setActiveHours(tempHours);
        setShowHoursModal(false);
        Alert.alert("Success", "Active hours updated successfully.");
      } else {
        setActiveHours(tempHours);
        setShowHoursModal(false);
        Alert.alert("Demo Mode", "Active hours updated locally.");
      }
    } catch (err: any) {
      Alert.alert("Update Failed", err.message);
    }
  };

  const handleAddBusinessType = async () => {
    if (!newTypeId.trim() || !newTypeName.trim()) {
      Alert.alert("Required", "ID and Name fields are required.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const routeVal = newTypeRoute.trim() || `/business/${newTypeId.trim()}-manager`;
      const { error } = await supabase
        .from('business_types')
        .insert([{
          id: newTypeId.trim().toLowerCase(),
          name: newTypeName.trim(),
          description: newTypeDesc.trim(),
          icon_name: newTypeIcon.trim(),
          route: routeVal
        }]);

      if (error) throw error;
      
      Alert.alert("Success", "New Business Hub Added successfully!");
      setShowTypeModal(false);
      
      // Reset form
      setNewTypeId('');
      setNewTypeName('');
      setNewTypeDesc('');
      setNewTypeIcon('Briefcase');
      setNewTypeRoute('');
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to add business type. Check database connection or primary key constraint.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account Permanently",
      "Are you sure you want to delete your account? This will clean up your local session database and sign you out.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Account", 
          style: "destructive", 
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert("Error", error.message);
            } else {
              Alert.alert("Account Deleted", "Your local session has been closed.");
            }
          } 
        }
      ]
    );
  };

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
        title: 'Settings',
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text, fontWeight: '800' },
        headerTintColor: colors.primary
      }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Profile / Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('personal')}</Text>
          <GlassCard style={{ padding: 0, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
            <TouchableOpacity 
              style={styles.row}
              onPress={() => router.push('/settings/edit-profile')}
              activeOpacity={0.7}
            >
              <View style={styles.labelGroup}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '12' }]}>
                  <User size={18} color={colors.primary} />
                </View>
                <Text style={[styles.label, { color: colors.text }]}>{t('edit_details')}</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity 
              style={styles.row}
              onPress={() => {
                Alert.alert(
                  "Switch Account Profile",
                  "Select a profile mode for local development and testing:",
                  [
                    {
                      text: "🎓 Student / Resident",
                      onPress: () => {
                        setUserRole('customer');
                        Alert.alert("Success", "Switched to Student/Resident view.");
                      }
                    },
                    {
                      text: "🏪 Merchant Partner",
                      onPress: () => {
                        setUserRole('merchant');
                        Alert.alert("Success", "Switched to Merchant Partner view.");
                      }
                    },
                    {
                      text: "🛡️ System Administrator",
                      onPress: () => {
                        setUserRole('admin');
                        Alert.alert("Success", "Switched to System Administrator view.");
                      }
                    },
                    {
                      text: "Cancel",
                      style: "cancel"
                    }
                  ]
                );
              }}
              activeOpacity={0.7}
            >
              <View style={styles.labelGroup}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accent + '12' }]}>
                  <Users size={18} color={colors.accent} />
                </View>
                <View>
                  <Text style={[styles.label, { color: colors.text }]}>App Mode</Text>
                  <Text style={[styles.subLabel, { color: colors.textMuted }]}>
                    Active Profile: {userRole === 'customer' ? 'Student' : userRole === 'merchant' ? 'Merchant' : 'Admin'}
                  </Text>
                </View>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity 
              style={styles.row}
              onPress={() => router.push('/settings/customization')}
              activeOpacity={0.7}
            >
              <View style={styles.labelGroup}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '12' }]}>
                  <Palette size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.label, { color: colors.text }]}>UI Customization</Text>
                  <Text style={[styles.subLabel, { color: colors.textMuted }]}>Theme, colors & layout customization</Text>
                </View>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity 
              style={styles.row}
              onPress={() => router.push('/settings/verification' as any)}
              activeOpacity={0.7}
            >
              <View style={styles.labelGroup}>
                <View style={[styles.iconContainer, { backgroundColor: colors.success + '12' }]}>
                  <ShieldCheck size={18} color={colors.success || '#10B981'} />
                </View>
                <View>
                  <Text style={[styles.label, { color: colors.text }]}>KYC Verification</Text>
                  <Text style={[styles.subLabel, { color: colors.textMuted }]}>Verify business credentials</Text>
                </View>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* Business Settings Section */}
        {userRole === 'merchant' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Business Operations</Text>
            <GlassCard style={{ padding: 0, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
              <TouchableOpacity 
                style={styles.row}
                onPress={() => {
                  setTempHours(activeHours);
                  setShowHoursModal(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.labelGroup}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.primary + '12' }]}>
                    <Clock size={18} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.label, { color: colors.text }]}>Active Hours</Text>
                    <Text style={[styles.subLabel, { color: colors.textMuted }]}>{activeHours}</Text>
                  </View>
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.row}>
                <View style={styles.labelGroup}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.error + '12' }]}>
                    <Shield size={18} color={colors.error} />
                  </View>
                  <View>
                    <Text style={[styles.label, { color: colors.text }]}>Holiday Mode</Text>
                    <Text style={[styles.subLabel, { color: colors.textMuted }]}>Auto-decline new requests</Text>
                  </View>
                </View>
                <Switch 
                  value={holidayMode} 
                  onValueChange={handleToggleHoliday}
                  trackColor={{ false: colors.border, true: colors.error + '50' }}
                  thumbColor={holidayMode ? colors.error : '#f4f3f4'}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <TouchableOpacity 
                style={styles.row}
                onPress={() => router.push('/settings/billing-plans' as any)}
                activeOpacity={0.7}
              >
                <View style={styles.labelGroup}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.accent + '12' }]}>
                    <IndianRupee size={18} color={colors.accent} />
                  </View>
                  <View>
                    <Text style={[styles.label, { color: colors.text }]}>Subscription & Commission</Text>
                    <Text style={[styles.subLabel, { color: colors.textMuted }]}>Manage plans and subscription billing</Text>
                  </View>
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <TouchableOpacity 
                style={styles.row}
                onPress={() => router.push('/settings/platform-ledger' as any)}
                activeOpacity={0.7}
              >
                <View style={styles.labelGroup}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.primary + '12' }]}>
                    <BookOpen size={18} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.label, { color: colors.text }]}>Platform Ledger</Text>
                    <Text style={[styles.subLabel, { color: colors.textMuted }]}>View splits, payouts and margins</Text>
                  </View>
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <TouchableOpacity 
                style={styles.row}
                onPress={() => setShowTypeModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.labelGroup}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.accent + '12' }]}>
                    <PlusCircle size={18} color={colors.accent} />
                  </View>
                  <View>
                    <Text style={[styles.label, { color: colors.text }]}>Add New Business Hub</Text>
                    <Text style={[styles.subLabel, { color: colors.textMuted }]}>Create dynamic dashboard hub types</Text>
                  </View>
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </GlassCard>
          </View>
        )}

        {/* Preferences / Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('visual_lang')}</Text>
          <GlassCard style={{ padding: 0, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
            <View style={styles.row}>
              <View style={styles.labelGroup}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '12' }]}>
                  {theme === 'dark' ? <Moon size={18} color={colors.primary} /> : <Sun size={18} color={colors.primary} />}
                </View>
                <View>
                  <Text style={[styles.label, { color: colors.text }]}>{t('dark_mode')}</Text>
                  <Text style={[styles.subLabel, { color: colors.textMuted }]}>{theme === 'dark' ? 'Vibrant Slate Dark' : 'Soft Glass Light'}</Text>
                </View>
              </View>
              <Switch 
                value={theme === 'dark'} 
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={theme === 'dark' ? colors.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.langHeader}>
              <View style={styles.labelGroup}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accent + '12' }]}>
                  <Globe size={18} color={colors.accent} />
                </View>
                <Text style={[styles.label, { color: colors.text }]}>{t('app_lang')}</Text>
              </View>
            </View>
            <View style={styles.langGrid}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity 
                  key={lang.code} 
                  style={[
                    styles.langBtn,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    language === lang.code && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setLanguage(lang.code as any)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.langNative,
                    { color: colors.text },
                    language === lang.code && { color: '#FFF' }
                  ]}>
                    {lang.native}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Security & Notifications</Text>
          <GlassCard style={{ padding: 0, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
            <View style={styles.row}>
              <View style={styles.labelGroup}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '12' }]}>
                  <Bell size={18} color={colors.primary} />
                </View>
                <Text style={[styles.label, { color: colors.text }]}>Push Notifications</Text>
              </View>
              <Switch 
                value={notifs} 
                onValueChange={setNotifs}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={notifs ? colors.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.row}>
              <View style={styles.labelGroup}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accent + '12' }]}>
                  <Eye size={18} color={colors.accent} />
                </View>
                <Text style={[styles.label, { color: colors.text }]}>Marketing Offers</Text>
              </View>
              <Switch 
                value={marketing} 
                onValueChange={setMarketing}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={marketing ? colors.primary : '#f4f3f4'}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.row} onPress={() => setShowPassModal(true)} activeOpacity={0.7}>
              <View style={styles.labelGroup}>
                <View style={[styles.iconContainer, { backgroundColor: colors.textMuted + '12' }]}>
                  <Lock size={18} color={colors.textMuted} />
                </View>
                <Text style={[styles.label, { color: colors.text }]}>Change Password</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* Delete Account */}
        <TouchableOpacity style={[styles.deleteBtn, { borderColor: colors.error + '25' }]} onPress={handleDeleteAccount} activeOpacity={0.7}>
          <Trash2 size={18} color={colors.error} />
          <Text style={styles.deleteText}>Delete Account Permanently</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Hours Modal */}
      <Modal
        visible={showHoursModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowHoursModal(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Active Hours</Text>
              <TouchableOpacity onPress={() => setShowHoursModal(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              value={tempHours}
              onChangeText={setTempHours}
              placeholder="e.g. 09:00 AM - 08:30 PM"
              placeholderTextColor={colors.textMuted}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.border + '30' }]} 
                onPress={() => setShowHoursModal(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.primary }]} 
                onPress={handleSaveHours}
              >
                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showPassModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPassModal(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPassModal(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              value={newPass}
              onChangeText={setNewPass}
              placeholder="New Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />

            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background, marginTop: 10 }]}
              value={confirmPass}
              onChangeText={setConfirmPass}
              placeholder="Confirm New Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.border + '30' }]} 
                onPress={() => setShowPassModal(false)}
                disabled={isSubmitting}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.primary }]} 
                onPress={handleUpdatePassword}
                disabled={isSubmitting}
              >
                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Update</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* Add Custom Business Type Modal */}
      <Modal
        visible={showTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Business Type</Text>
              <TouchableOpacity onPress={() => setShowTypeModal(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 350 }}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Unique Category ID *</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                value={newTypeId}
                onChangeText={setNewTypeId}
                placeholder="e.g. drycleaning"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Display Name *</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                value={newTypeName}
                onChangeText={setNewTypeName}
                placeholder="e.g. Premium Dry Cleaning"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Short Description</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                value={newTypeDesc}
                onChangeText={setNewTypeDesc}
                placeholder="e.g. Delicate fabrics care & dynamic locker slots"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Lucide Icon Name</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                value={newTypeIcon}
                onChangeText={setNewTypeIcon}
                placeholder="e.g. Waves, Truck, Scissors, Coffee"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Dashboard Route (Optional)</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                value={newTypeRoute}
                onChangeText={setNewTypeRoute}
                placeholder="e.g. /business/laundry-manager"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.border + '30' }]} 
                onPress={() => setShowTypeModal(false)}
                disabled={isSubmitting}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.primary }]} 
                onPress={handleAddBusinessType}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Add Hub</Text>
                )}
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  subLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    opacity: 0.08,
  },
  langHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 10,
  },
  langBtn: {
    width: '48%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langNative: {
    fontSize: 14,
    fontWeight: '800',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  deleteText: {
    fontWeight: '800',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalInput: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginLeft: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  modalBtnText: {
    fontWeight: '800',
    fontSize: 13,
  },
});
