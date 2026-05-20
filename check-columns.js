const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rbwfqwdmoxbpbhmlkori.supabase.co';
const supabaseAnonKey = 'sb_publishable_zUnn-dv-VljnddbpzMOu2w_6qOvs7dw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking columns of staff table...");
  const { data: staffData, error: staffError } = await supabase
    .from('staff')
    .select('*')
    .limit(1);
  console.log("Staff columns data:", staffData, "Error:", staffError);

  console.log("Checking columns of merchants table...");
  const { data: merchantData, error: merchantError } = await supabase
    .from('merchants')
    .select('*')
    .limit(1);
  console.log("Merchants columns data:", merchantData, "Error:", merchantError);
}

run();
