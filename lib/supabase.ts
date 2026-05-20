import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// These should be in your .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://rbwfqwdmoxbpbhmlkori.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_zUnn-dv-VljnddbpzMOu2w_6qOvs7dw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/* 
  Usage examples for your Multi-Merchant App:

  1. Fetching Services for a specific business:
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId);

  2. Booking an appointment:
  const { data, error } = await supabase
    .from('appointments')
    .insert([
      { customer_id: user.id, service_id: sId, time: slotTime }
    ]);
*/
