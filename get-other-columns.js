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

  const { data: mData } = await supabase.from('merchants').select('*').limit(1);
  if (mData && mData[0]) {
    console.log("Merchant columns:", Object.keys(mData[0]));
  }

  const { data: nData } = await supabase.from('notifications').select('*').limit(1);
  if (nData && nData[0]) {
    console.log("Notification columns:", Object.keys(nData[0]));
  }
}

run();
