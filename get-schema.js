const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rbwfqwdmoxbpbhmlkori.supabase.co';
const supabaseAnonKey = 'sb_publishable_zUnn-dv-VljnddbpzMOu2w_6qOvs7dw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TEST_EMAIL = 'demo@sevastack.org';
const TEST_PASSWORD = 'password123';

async function run() {
  console.log("Signing in...");
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  });

  if (signInError) {
    console.error("Sign in failed:", signInError);
    return;
  }

  const merchantId = 'c998be97-7b5e-4f01-8e0b-bcc4bcad2daa';

  console.log("=== SERVICES ===");
  const { data: service, error: sErr } = await supabase
    .from('services')
    .insert([{ merchant_id: merchantId, name: 'Temp' }])
    .select();
  console.log("Service row:", service, "Error:", sErr);
  if (service && service[0]) {
    await supabase.from('services').delete().eq('id', service[0].id);
  }

  console.log("=== APPOINTMENTS ===");
  const { data: appt, error: aErr } = await supabase
    .from('appointments')
    .insert([{ merchant_id: merchantId, customer_name: 'Temp', time: 'Temp' }])
    .select();
  console.log("Appointment row:", appt, "Error:", aErr);
  if (appt && appt[0]) {
    await supabase.from('appointments').delete().eq('id', appt[0].id);
  }

  console.log("=== INVENTORY ===");
  const { data: inv, error: iErr } = await supabase
    .from('inventory')
    .insert([{ merchant_id: merchantId }])
    .select();
  console.log("Inventory row:", inv, "Error:", iErr);
  if (inv && inv[0]) {
    await supabase.from('inventory').delete().eq('id', inv[0].id);
  }

  console.log("=== KHATA RECORDS ===");
  const { data: khata, error: kErr } = await supabase
    .from('khata_records')
    .insert([{ merchant_id: merchantId }])
    .select();
  console.log("Khata row:", khata, "Error:", kErr);
  if (khata && khata[0]) {
    await supabase.from('khata_records').delete().eq('id', khata[0].id);
  }
}

run();
