const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rbwfqwdmoxbpbhmlkori.supabase.co';
const supabaseAnonKey = 'sb_publishable_zUnn-dv-VljnddbpzMOu2w_6qOvs7dw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking table counts...");
  const merchants = await supabase.from('merchants').select('*', { count: 'exact', head: true });
  console.log("Merchants count:", merchants.count, "error:", merchants.error);

  const appointments = await supabase.from('appointments').select('*', { count: 'exact', head: true });
  console.log("Appointments count:", appointments.count, "error:", appointments.error);

  const profiles = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  console.log("Profiles count:", profiles.count, "error:", profiles.error);
}

run();
