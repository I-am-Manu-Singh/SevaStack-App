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
    .insert([{ merchant_id: merchantId, name: 'Temp Service', price: 10.0 }])
    .select();
  if (sErr) {
    console.log("Service Insert Error:", sErr);
  } else if (service && service[0]) {
    console.log("Service columns:", Object.keys(service[0]));
    await supabase.from('services').delete().eq('id', service[0].id);
  }

  console.log("=== APPOINTMENTS ===");
  // We don't know the exact columns, let's try to insert minimal valid row
  // We got "Could not find 'time' column of 'appointments'"
  // Let's try inserting with customer_name and see what is required
  const { data: appt, error: aErr } = await supabase
    .from('appointments')
    .insert([{ merchant_id: merchantId, customer_name: 'Temp Customer' }])
    .select();
  if (aErr) {
    console.log("Appointment Insert Error:", aErr);
  } else if (appt && appt[0]) {
    console.log("Appointment columns:", Object.keys(appt[0]));
    await supabase.from('appointments').delete().eq('id', appt[0].id);
  }

  console.log("=== INVENTORY ===");
  // We got "null value in column 'item_name' violates not-null"
  const { data: inv, error: iErr } = await supabase
    .from('inventory')
    .insert([{ merchant_id: merchantId, item_name: 'Temp Item' }])
    .select();
  if (iErr) {
    console.log("Inventory Insert Error:", iErr);
  } else if (inv && inv[0]) {
    console.log("Inventory columns:", Object.keys(inv[0]));
    await supabase.from('inventory').delete().eq('id', inv[0].id);
  }

  console.log("=== KHATA RECORDS ===");
  // We got "null value in column 'student_name' violates not-null"
  const { data: khata, error: kErr } = await supabase
    .from('khata_records')
    .insert([{ merchant_id: merchantId, student_name: 'Temp Student' }])
    .select();
  if (kErr) {
    console.log("Khata Insert Error:", kErr);
  } else if (khata && khata[0]) {
    console.log("Khata columns:", Object.keys(khata[0]));
    await supabase.from('khata_records').delete().eq('id', khata[0].id);
  }
}

run();
