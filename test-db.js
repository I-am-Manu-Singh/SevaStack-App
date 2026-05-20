const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rbwfqwdmoxbpbhmlkori.supabase.co';
const supabaseAnonKey = 'sb_publishable_zUnn-dv-VljnddbpzMOu2w_6qOvs7dw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking table counts...");
  const tables = ['hostel_residents', 'hostel_gate_passes', 'tiffin_subscriptions', 'laundry_orders', 'staff', 'inventory', 'notifications'];
  for (const t of tables) {
    const res = await supabase.from(t).select('*', { count: 'exact', head: true });
    console.log(`Table ${t}: count = ${res.count}, error = ${res.error ? res.error.message : 'none'}`);
  }
}

run();
