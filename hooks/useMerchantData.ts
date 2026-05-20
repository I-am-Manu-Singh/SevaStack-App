import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export function useMerchantData() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<PostgrestError | null>(null);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const profileRes = await supabase.from('merchants').select('*').eq('user_id', user.id).single();
      if (profileRes.error) throw profileRes.error;

      const merchant = profileRes.data;

      // Fetch appointments, leads, and services for this merchant
      const [appointmentsRes, leadsRes, servicesRes] = await Promise.all([
        supabase.from('appointments').select('*').eq('merchant_id', merchant.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('leads').select('*').eq('merchant_id', merchant.id).limit(10),
        supabase.from('services').select('*').eq('merchant_id', merchant.id).limit(20)
      ]);

      setData({
        profile: merchant,
        appointments: appointmentsRes.data || [],
        leads: leadsRes.data || [],
        services: servicesRes.data || [],
      });
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refresh: fetchData };
}
