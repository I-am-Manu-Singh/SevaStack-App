const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://rbwfqwdmoxbpbhmlkori.supabase.co', 'sb_publishable_zUnn-dv-VljnddbpzMOu2w_6qOvs7dw');

const candidates = [
  'room', 'room_number', 'items', 'items_count', 'service_type', 'service', 'amount', 'price', 'status', 'delicate_tag', 'delicate'
];

async function testColumn(col) {
  const obj = {};
  obj[col] = (col === 'items' || col === 'items_count' || col === 'amount' || col === 'price') ? 5 : 'Test';
  const res = await supabase.from('laundry_orders').insert(obj);
  
  if (res.error && res.error.code === 'PGRST204') {
    return false; // Does not exist
  }
  return true; // Exists
}

async function run() {
  console.log("Checking laundry_orders table columns...");
  const results = {};
  for (const col of candidates) {
    const exists = await testColumn(col);
    results[col] = exists;
  }
  console.log("Column Exists Status for laundry_orders:", results);
}

run();
