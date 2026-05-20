export type BusinessType = 'Barber' | 'Tailor' | 'Laundry' | 'Cafe' | 'Kirana' | 'Pharmacy' | 'Tiffin' | 'Milk' | 'Jewelry' | 'Hostel' | 'Library' | 'Stationery' | 'Travel' | 'Transport' | 'Handyman' | 'Tuition';

export interface Service {
  id: string;
  name: string;
  category: string;
  target?: string;
  price: number;
  duration?: string;
  unit?: string;
  image: string;
  businessType: BusinessType;
}

export interface Appointment {
  id: string;
  customerName: string;
  service: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  price: number;
  avatar: string;
  businessType: BusinessType;
  details?: string;
  isSubscription?: boolean;
}

export interface KhataEntry {
  id: string;
  customerName: string;
  amount: number;
  type: 'due' | 'paid';
  date: string;
}

export interface MerchantLead {
  id: string;
  studentName: string;
  interest: string;
  distance: string;
  time: string;
}

export interface HaircutStyle {
  id: string;
  name: string;
  image: string;
  tags: string[];
}

export interface TabConfig {
  id: string;
  name: string;
  label: string;
  icon: string;
  isVisible: boolean;
}

export interface AppCustomization {
  businessName: string;
  themeColor: string;
  tabs: TabConfig[];
}
