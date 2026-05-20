import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightColors, DarkColors, Spacing, Typography, setGlobalTheme } from '@/constants/Theme';
import { Translations, TranslationKey } from '@/constants/Translations';
import { BusinessType } from '@/constants/Types';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

import { MOCK_SESSION, UserRole } from '@/constants/Auth';

type Theme = 'light' | 'dark';
type Language = 'en' | 'hi' | 'pa' | 'ta';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  colors: typeof LightColors;
  t: (key: TranslationKey) => string;
  isLoading: boolean;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  businessType: BusinessType;
  setBusinessType: (type: BusinessType) => void;
  session: Session | null;
  user: User | null;
  profile: any;
  refreshProfile: () => Promise<void>;
  // E2E Data
  appointments: any[];
  addAppointment: (appointment: any) => void;
  updateAppointmentStatus: (id: string, status: string) => void;
  inventory: any[];
  updateStock: (id: string, delta: number) => void;
  ledger: any[];
  addLedgerEntry: (entry: any) => void;
  staff: any[];
  updateStaffStatus: (id: string, isPresent: boolean) => void;
  catalog: any[];
  addCatalogItem: (item: any) => void;
  updateCatalogItem: (id: string, item: any) => void;
  deleteCatalogItem: (id: string) => void;
  notifications: any[];
  markAllNotificationsRead: () => void;
  triggerNotification: (type: string, title: string, message: string) => void;
  updateProfile: (updates: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_CATALOG = [
  // Barber / Salon
  { id: 'cat-b1', name: 'Signature Haircut', price: 150, category: 'Hair', unit: 'session', businessType: 'Barber', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&q=80' },
  { id: 'cat-b2', name: 'Beard Trim & Styling', price: 80, category: 'Grooming', unit: 'session', businessType: 'Barber', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80' },
  { id: 'cat-b3', name: 'Premium Hair Spa & Wash', price: 350, category: 'Treatment', unit: 'session', businessType: 'Barber', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80' },

  // Tiffin
  { id: 'cat-t1', name: 'Monthly Veg Tiffin (Lunch + Dinner)', price: 3200, category: 'Monthly Plans', unit: 'month', businessType: 'Tiffin', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80' },
  { id: 'cat-t2', name: 'Weekly Veg Tiffin (2 Meals)', price: 900, category: 'Weekly Plans', unit: 'week', businessType: 'Tiffin', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&q=80' },
  { id: 'cat-t3', name: 'Single Premium Special Thali', price: 130, category: 'Single Meal', unit: 'thali', businessType: 'Tiffin', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80' },

  // Laundry
  { id: 'cat-l1', name: 'Wash & Iron (Regular Clothes)', price: 12, category: 'Wash & Fold', unit: 'kg', businessType: 'Laundry', image: 'https://images.unsplash.com/photo-1545180856-f2868ff128c7?w=400&q=80' },
  { id: 'cat-l2', name: 'Premium Dry Cleaning (Jacket/Coat)', price: 150, category: 'Dry Cleaning', unit: 'piece', businessType: 'Laundry', image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80' },
  { id: 'cat-l3', name: 'Steam Press Only', price: 6, category: 'Pressing', unit: 'piece', businessType: 'Laundry', image: 'https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=400&q=80' },

  // Kirana
  { id: 'cat-k1', name: 'Fortune Soyabean Oil 1L', price: 145, category: 'Groceries', unit: 'bottle', businessType: 'Kirana', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80' },
  { id: 'cat-k2', name: 'Aashirvaad Shudh Chakki Atta 5kg', price: 260, category: 'Flours', unit: 'bag', businessType: 'Kirana', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
  { id: 'cat-k3', name: 'Amul Gold Milk 1L', price: 66, category: 'Dairy', unit: 'packet', businessType: 'Kirana', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80' },

  // Hostel
  { id: 'cat-h1', name: 'Single Bed Room AC (Premium)', price: 14000, category: 'AC Rooms', unit: 'month', businessType: 'Hostel', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80' },
  { id: 'cat-h2', name: 'Double Sharing Room AC', price: 9500, category: 'AC Rooms', unit: 'month', businessType: 'Hostel', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80' },
  { id: 'cat-h3', name: 'Double Sharing Non-AC Room', price: 7500, category: 'Non-AC Rooms', unit: 'month', businessType: 'Hostel', image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&q=80' },

  // Cafe
  { id: 'cat-c1', name: 'Cold Coffee with Ice Cream', price: 90, category: 'Beverages', unit: 'glass', businessType: 'Cafe', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80' },
  { id: 'cat-c2', name: 'Cheese Garlic Bread (4 pcs)', price: 120, category: 'Snacks', unit: 'plate', businessType: 'Cafe', image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400&q=80' },
  { id: 'cat-c3', name: 'Double Cheese Margherita Pizza', price: 220, category: 'Pizza', unit: 'piece', businessType: 'Cafe', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80' },

  // Chemist (Pharmacy)
  { id: 'cat-ch1', name: 'Paracetamol 650mg (Dolo)', price: 30, category: 'OTC Medicines', unit: 'strip', businessType: 'Chemist', image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&q=80' },
  { id: 'cat-ch2', name: 'Othrivin Nasal Spray 10ml', price: 95, category: 'Nasal Care', unit: 'bottle', businessType: 'Chemist', image: 'https://images.unsplash.com/photo-1607619056574-7b8f30413736?w=400&q=80' },
  { id: 'cat-ch3', name: 'First Aid Kit (Essential)', price: 250, category: 'Wellness', unit: 'kit', businessType: 'Chemist', image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&q=80' },

  // Library
  { id: 'cat-lib1', name: 'Daily Desk Study Pass (6 Hours)', price: 50, category: 'Passes', unit: 'day', businessType: 'Library', image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&q=80' },
  { id: 'cat-lib2', name: 'Monthly Study Seat Reserve (24/7)', price: 1200, category: 'Sub Plans', unit: 'month', businessType: 'Library', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80' },

  // Gym
  { id: 'cat-gym1', name: 'Monthly Gym Membership', price: 1500, category: 'Memberships', unit: 'month', businessType: 'Gym', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80' },
  { id: 'cat-gym2', name: 'Personal Training Session', price: 500, category: 'Coaching', unit: 'session', businessType: 'Gym', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80' },

  // Tailor
  { id: 'cat-tl1', name: 'Shirt Stitching (Custom Fit)', price: 400, category: 'Stitching', unit: 'piece', businessType: 'Tailor', image: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=400&q=80' },
  { id: 'cat-tl2', name: 'Pant Alteration & Slimming', price: 80, category: 'Alterations', unit: 'piece', businessType: 'Tailor', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80' },

  // Stationery
  { id: 'cat-st1', name: 'A4 Spiral Notebook 200 Pages', price: 75, category: 'Notebooks', unit: 'piece', businessType: 'Stationery', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80' },
  { id: 'cat-st2', name: 'Highlighter Pack of 5 (Pastel)', price: 120, category: 'Pens & Markers', unit: 'pack', businessType: 'Stationery', image: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=400&q=80' }
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRoleState] = useState<UserRole>(MOCK_SESSION.role);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [businessType, setBusinessTypeState] = useState<BusinessType>('Barber');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    setGlobalTheme(theme);
  }, [theme]);
  
  // E2E Global State (now fetching from Supabase eventually)
  const [appointments, setAppointments] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>(INITIAL_CATALOG);
  const [notifications, setNotifications] = useState<any[]>([
    { id: '1', type: 'order', title: 'New Booking', message: 'Rahul Sharma booked a Fade Haircut for 10:30 AM tomorrow.', time: '2 mins ago', isUnread: true },
    { id: '2', type: 'stock', title: 'Low Inventory', message: 'Milk Carton (Full Cream) stock is below 10L.', time: '1 hour ago', isUnread: true },
  ]);

  // Load preferences and session on mount
  useEffect(() => {
    // 1. Listen for auth changes
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    // 2. Load preferences
    const loadPreferences = async () => {
      try {
        const [savedTheme, savedLang, savedBusType] = await Promise.all([
          AsyncStorage.getItem('app_theme'),
          AsyncStorage.getItem('app_lang'),
          AsyncStorage.getItem('app_business_type')
        ]);
        
        if (savedTheme) {
          setTheme(savedTheme as Theme);
        } else if (systemColorScheme) {
          setTheme(systemColorScheme);
        }

        if (savedLang) {
          setLanguageState(savedLang as Language);
        }

        if (savedBusType) {
          setBusinessTypeState(savedBusType as BusinessType);
        }
      } catch (e) {
        console.error("Failed to load prefs", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('app_theme', newTheme);
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('app_lang', lang);
  };

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
  };

  const setBusinessType = async (type: BusinessType) => {
    setBusinessTypeState(type);
    await AsyncStorage.setItem('app_business_type', type);
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!error && data) {
        setProfile(data);
        setUserRoleState('merchant');
        fetchGlobalData(data.id);
      } else {
        setProfile(null);
        setUserRoleState('customer');
      }
    } catch (e) {
      console.log("Profile fetch failed (might be customer)", e);
      setProfile(null);
      setUserRoleState('customer');
    }
  };

  const fetchGlobalData = async (merchantId: string) => {
    try {
      const [
        aptsRes, 
        invRes, 
        ledgerRes, 
        staffRes, 
        catRes, 
        notifRes
      ] = await Promise.all([
        supabase.from('appointments').select('*').eq('merchant_id', merchantId),
        supabase.from('inventory').select('*').eq('merchant_id', merchantId),
        supabase.from('khata_records').select('*').eq('merchant_id', merchantId),
        supabase.from('staff').select('*').eq('merchant_id', merchantId),
        supabase.from('services').select('*').eq('merchant_id', merchantId),
        supabase.from('notifications').select('*').eq('merchant_id', merchantId)
      ]);

      if (aptsRes.data) setAppointments(aptsRes.data);
      if (invRes.data) setInventory(invRes.data);
      if (ledgerRes.data) setLedger(ledgerRes.data);
      if (staffRes.data) setStaff(staffRes.data);
      if (catRes.data && catRes.data.length > 0) {
        const mappedCatalog = catRes.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          category: item.category,
          unit: item.unit,
          businessType: item.business_type || item.businessType,
          image: item.image
        }));
        const merged = [...mappedCatalog];
        INITIAL_CATALOG.forEach(initItem => {
          if (!merged.some(dbItem => dbItem.name.toLowerCase() === initItem.name.toLowerCase())) {
            merged.push(initItem);
          }
        });
        setCatalog(merged);
      } else {
        setCatalog(INITIAL_CATALOG);
      }
      if (notifRes.data && notifRes.data.length > 0) {
        setNotifications(notifRes.data);
      }
    } catch (e) {
      console.log("Failed to load global data", e);
    }
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchProfile(session.user.id);
    }
  };

  // E2E Actions
  const triggerNotification = async (type: string, title: string, message: string) => {
    try {
      const newNotif = {
        id: 'NOTIF-' + Math.floor(1000 + Math.random() * 9000),
        type,
        title,
        message,
        time: 'Just now',
        is_unread: true
      };

      // Add to local state immediately
      setNotifications(prev => [newNotif, ...prev]);

      // Save to Supabase if profile is loaded
      if (profile) {
        await supabase
          .from('notifications')
          .insert([{
            merchant_id: profile.id,
            type,
            title,
            message,
            time: 'Just now',
            is_unread: true
          }]);
      }
    } catch (e: any) {
      console.warn("Could not insert notification to DB:", e.message);
    }
  };

  const addAppointment = (apt: any) => {
    const newApt = { ...apt, id: Date.now().toString() };
    setAppointments([newApt, ...appointments]);
    triggerNotification('order', 'New Booking Received', `${apt.student_name || 'Student'} requested a slot at ${apt.slot_time || 'scheduled time'}.`);
  };

  const updateAppointmentStatus = (id: string, status: string) => {
    setAppointments(appointments.map(a => {
      if (a.id === id) {
        triggerNotification('order', 'Booking Status Updated', `Order ${a.id.substring(0, 8)} status changed to ${status}.`);
        return { ...a, status };
      }
      return a;
    }));
  };

  const updateStock = (id: string, delta: number) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        const nextStock = Math.max(0, item.stock + delta);
        if (nextStock <= 5) {
          triggerNotification('stock', 'Low Stock Warning', `${item.name} stock level is critically low (${nextStock} remaining).`);
        }
        return { ...item, stock: nextStock };
      }
      return item;
    }));
  };

  const addLedgerEntry = (entry: any) => {
    const newEntry = { ...entry, id: Date.now().toString(), date: new Date().toLocaleDateString() };
    setLedger([newEntry, ...ledger]);
    triggerNotification('payout', 'New Revenue Posted', `Log entries posted of ₹${entry.amount} for ${entry.description}.`);
  };

  const updateStaffStatus = (id: string, isPresent: boolean) => {
    setStaff(staff.map(s => {
      if (s.id === id) {
        triggerNotification('staff', 'Staff Attendance Changed', `${s.name || 'Staff member'} is now marked as ${isPresent ? 'Present' : 'Absent'}.`);
        return { ...s, isPresent };
      }
      return s;
    }));
  };

  const addCatalogItem = async (item: any) => {
    let newItem = { ...item, id: Date.now().toString() };
    if (profile?.id) {
      try {
        const { data, error } = await supabase
          .from('services')
          .insert([{
            merchant_id: profile.id,
            name: item.name,
            price: item.price,
            category: item.category,
            unit: item.unit,
            business_type: item.businessType,
            image: item.image
          }])
          .select()
          .single();
        if (!error && data) {
          newItem = {
            id: data.id,
            name: data.name,
            price: parseFloat(data.price),
            category: data.category,
            unit: data.unit,
            businessType: data.business_type || data.businessType,
            image: data.image
          };
        } else if (error) {
          console.warn("Supabase insert error, falling back:", error.message);
        }
      } catch (err) {
        console.warn("Failed to insert to Supabase:", err);
      }
    }
    setCatalog(prev => [newItem, ...prev]);
    triggerNotification('system', 'Catalog Item Added', `Successfully added ${item.name} to business catalog list.`);
  };

  const updateCatalogItem = async (id: string, item: any) => {
    if (profile?.id && !id.startsWith('cat-')) {
      try {
        const { error } = await supabase
          .from('services')
          .update({
            name: item.name,
            price: item.price,
            category: item.category,
            unit: item.unit,
            business_type: item.businessType,
            image: item.image
          })
          .eq('id', id);
        if (error) {
          console.warn("Supabase update error:", error.message);
        }
      } catch (err) {
        console.warn("Failed to update in Supabase:", err);
      }
    }
    setCatalog(prev => prev.map(s => s.id === id ? { ...s, ...item } : s));
  };

  const deleteCatalogItem = async (id: string) => {
    if (profile?.id && !id.startsWith('cat-')) {
      try {
        const { error } = await supabase
          .from('services')
          .delete()
          .eq('id', id);
        if (error) {
          console.warn("Supabase delete error:", error.message);
        }
      } catch (err) {
        console.warn("Failed to delete in Supabase:", err);
      }
    }
    setCatalog(prev => prev.filter(s => s.id !== id));
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, is_unread: false })));
  };

  const updateProfile = (updates: any) => {
    setProfile({ ...profile, ...updates });
  };

  const colors = theme === 'light' ? LightColors : DarkColors;

  const t = (key: TranslationKey): string => {
    const langSet = Translations[language] || Translations.en;
    return (langSet as any)[key] || (Translations.en as any)[key] || key;
  };

  return (
    <AppContext.Provider value={{ 
      theme, toggleTheme, language, setLanguage, colors, t, 
      isLoading, userRole, setUserRole, isDemoMode, setIsDemoMode,
      businessType, setBusinessType,
      session, user: session?.user || null, profile, refreshProfile,
      appointments, addAppointment, updateAppointmentStatus,
      inventory, updateStock,
      ledger, addLedgerEntry,
      staff, updateStaffStatus,
      catalog, addCatalogItem, updateCatalogItem, deleteCatalogItem,
      notifications, markAllNotificationsRead, triggerNotification,
      updateProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
