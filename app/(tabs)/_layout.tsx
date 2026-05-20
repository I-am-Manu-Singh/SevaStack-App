import React from 'react';
import { StyleSheet, TouchableOpacity, Alert, Modal, View, Text, Linking } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as LucideIcons from 'lucide-react-native';
import { MOCK_SESSION } from '@/constants/Auth';
import { DEFAULT_CONFIG } from '@/constants/AppConfigs';
import { useApp } from '@/lib/AppContext';
import { Typography } from '@/constants/Theme';

// Helper to get Lucide icon component by name
const IconByName = ({ name, color, size = 24 }: { name: string, color: string, size?: number }) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <IconComponent size={size} color={color} />;
};

const QuickActionsModal = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
  const { colors, t, userRole: role } = useApp();
  const router = useRouter();

  const ACTIONS = role === 'customer' ? [
    { id: 'search_shops', label: 'Find Shops', icon: 'Search', color: '#10B981', route: '/discover' },
    { id: 'scan_qr', label: 'Scan QR', icon: 'QrCode', color: '#F59E0B', route: null },
    { id: 'support', label: 'Help', icon: 'HelpCircle', color: '#EC4899', route: null },
  ] : role === 'admin' ? [
    { id: 'system_stats', label: 'Platform Stats', icon: 'Activity', color: '#10B981', route: null },
    { id: 'users', label: 'Manage Users', icon: 'Users', color: '#6366F1', route: null },
    { id: 'merchants', label: 'Merchants', icon: 'Store', color: '#F59E0B', route: null },
  ] : [
    { id: 'add_product', label: 'Add Product', icon: 'PlusSquare', color: '#10B981', route: '/catalog' },
    { id: 'inventory', label: 'Inventory', icon: 'Package', color: '#6366F1', route: '/tools/inventory' },
    { id: 'share_qr', label: 'Share QR', icon: 'QrCode', color: '#F59E0B', route: null },
    { id: 'staff_duty', label: 'On Duty', icon: 'UserCheck', color: '#EC4899', route: '/(tabs)/staff' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Quick Actions</Text>
            <TouchableOpacity onPress={onClose}>
               <LucideIcons.X size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionGrid}>
            {ACTIONS.map(action => (
              <TouchableOpacity 
                key={action.id}
                style={[styles.actionItem, { borderColor: colors.border }]}
                onPress={() => {
                  onClose();
                  if (action.route) router.push(action.route as any);
                  else Alert.alert(action.label, `Opening ${action.label}...`);
                }}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                  <IconByName name={action.icon} color={action.color} size={28} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default function TabLayout() {
  const { t, colors, theme, session, profile, userRole: role } = useApp();
  const [showQuickActions, setShowQuickActions] = React.useState(false);
  const router = useRouter();
  
  const HeaderActions = () => (
    <View style={styles.headerActions}>
      <TouchableOpacity 
        onPress={() => router.push('/notifications')}
        style={[styles.headerBtn, { backgroundColor: colors.surfaceLight + '10' }]}
      >
        <LucideIcons.Bell size={20} color={colors.text} />
        <View style={styles.notifBadge} />
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => router.push('/profile')}
        style={[styles.headerBtn, { backgroundColor: colors.surfaceLight + '10' }]}
      >
        <LucideIcons.User size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 65,
          paddingTop: 8,
          paddingBottom: 8,
        },
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '800',
          fontSize: 18,
        },
        headerRight: () => <HeaderActions />,
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: role === 'customer' ? 'Home' : role === 'admin' ? 'Admin' : 'Dashboard',
          tabBarIcon: ({ color }) => <IconByName name="LayoutDashboard" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="discover"
        options={{
          title: role === 'customer' ? 'Explore' : 'Hubs',
          tabBarIcon: ({ color }) => <IconByName name="Compass" color={color} />,
        }}
      />

      <Tabs.Screen
        name="quick-actions"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={[styles.centerActionContainer, { backgroundColor: colors.surface }]}>
              <LinearGradient
                colors={[colors.primary, colors.accent]}
                style={styles.centerActionGradient}
              >
                 <LucideIcons.Plus size={28} color="#FFF" />
              </LinearGradient>
            </View>
          ),
          tabBarLabel: () => null,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            setShowQuickActions(true);
          },
        }}
      />

      <Tabs.Screen
        name="staff"
        options={{
          title: 'Staff',
          tabBarIcon: ({ color }) => <IconByName name="Users" color={color} />,
          href: role === 'customer' ? null : '/staff',
        }}
      />

      <Tabs.Screen
        name="manage"
        options={{
          title: role === 'customer' ? 'Bookings' : 'Orders',
          tabBarIcon: ({ color }) => <IconByName name="Calendar" color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>

    <QuickActionsModal 
      visible={showQuickActions} 
      onClose={() => setShowQuickActions(false)} 
    />
    
    {/* WhatsApp Floating Action Button */}
    {role === 'merchant' && (
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => Linking.openURL('https://wa.me/917357077395')} // Merchant Support Number
      >
        <LucideIcons.MessageCircle size={24} color="#FFF" />
      </TouchableOpacity>
    )}
    </>
  );
}

const styles = StyleSheet.create({
  centerActionContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginTop: -28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 6,
    borderColor: 'transparent', // Will be set by backgroundColor in component
  },
  centerActionGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 16,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  notifBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#25D366', // WhatsApp Green
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    ...Typography.h3,
    fontSize: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionItem: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    ...Typography.body,
    fontWeight: '700',
    fontSize: 14,
  },
});
