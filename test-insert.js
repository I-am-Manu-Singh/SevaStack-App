const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rbwfqwdmoxbpbhmlkori.supabase.co';
const supabaseAnonKey = 'sb_publishable_zUnn-dv-VljnddbpzMOu2w_6qOvs7dw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Attempting non-existent column insertion...");
  const { data, error } = await supabase
    .from('staff')
    .insert([
      {
        name: 'Test Staff',
        non_existent_column_abc: 'value'
      }
    ]);
  console.log("Result:", data, "Error:", error);
}

run();
