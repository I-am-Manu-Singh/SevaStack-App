const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rbwfqwdmoxbpbhmlkori.supabase.co';
const supabaseAnonKey = 'sb_publishable_zUnn-dv-VljnddbpzMOu2w_6qOvs7dw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TEST_EMAIL = 'demo@sevastack.org';
const TEST_PASSWORD = 'password123';

async function run() {
  console.log("Signing in...");
  await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  });

  const merchantId = 'c998be97-7b5e-4f01-8e0b-bcc4bcad2daa';

  console.log("=== STAFF ===");
  const { data, error } = await supabase
    .from('staff')
    .insert([{ merchant_id: merchantId, name: 'Temp Staff', role: 'Barber' }])
    .select();
  if (error) {
    console.log("Staff error:", error);
  } else if (data && data[0]) {
    console.log("Staff columns:", Object.keys(data[0]));
    await supabase.from('staff').delete().eq('id', data[0].id);
  }
}

run();
