const fetch = require('node-fetch');

const url = 'https://rbwfqwdmoxbpbhmlkori.supabase.co/rest/v1/';
const headers = {
  'apikey': 'sb_publishable_zUnn-dv-VljnddbpzMOu2w_6qOvs7dw'
};

async function run() {
  try {
    const res = await fetch(url, { headers });
    const data = await res.json();
    console.log("Full data:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
