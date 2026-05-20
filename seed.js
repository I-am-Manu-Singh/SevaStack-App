const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rbwfqwdmoxbpbhmlkori.supabase.co';
const supabaseAnonKey = 'sb_publishable_zUnn-dv-VljnddbpzMOu2w_6qOvs7dw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TEST_EMAIL = 'demo@sevastack.org';
const TEST_PASSWORD = 'password123';

async function seed() {
  console.log(`Step 1: Signing up or signing in user ${TEST_EMAIL}...`);
  
  let userId;
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    options: {
      data: {
        full_name: 'Manpreet Singh'
      }
    }
  });

  if (signUpError) {
    if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
      console.log('User already registered, logging in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      if (signInError) {
        console.error('Sign in failed:', signInError);
        return;
      }
      userId = signInData.user.id;
    } else {
      console.error('Sign up failed:', signUpError);
      return;
    }
  } else {
    userId = signUpData.user.id;
    console.log('Successfully registered user with ID:', userId);
  }

  console.log(`Step 2: Cleaning old merchant profile for user ID: ${userId} to avoid broken update triggers...`);
  const { error: deleteMerchantError } = await supabase
    .from('merchants')
    .delete()
    .eq('user_id', userId);

  if (deleteMerchantError) {
    console.error('Failed to delete existing merchant:', deleteMerchantError);
    return;
  }

  console.log('Inserting fresh merchant profile...');
  const merchantPayload = {
    user_id: userId,
    business_name: 'The Royal Cut',
    full_name: 'Manpreet Singh',
    phone: '+919876543210',
    business_type: 'Barber',
    address: 'Hostel Zone, block-A, Kota',
    is_verified: true,
    image_url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&q=80'
  };

  const { data: inserted, error: insertError } = await supabase
    .from('merchants')
    .insert([merchantPayload])
    .select()
    .single();

  if (insertError) {
    console.error('Failed to insert merchant:', insertError);
    return;
  }

  const merchant = inserted;
  const merchantId = merchant.id;
  console.log('Merchant profile set up successfully, ID:', merchantId);

  console.log('Step 3: Seeding services...');
  const servicesToInsert = [
    { 
      merchant_id: merchantId, 
      name: 'Signature Haircut', 
      description: 'Standard hair styling and trim.',
      price: 150.00, 
      duration_minutes: 30,
      category: 'Hair', 
      is_available: true,
      business_type: 'Barber', 
      image_url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&q=80' 
    },
    { 
      merchant_id: merchantId, 
      name: 'Beard Trim & Styling', 
      description: 'Beard grooming, shape-up, and oil conditioning.',
      price: 80.00, 
      duration_minutes: 20,
      category: 'Grooming', 
      is_available: true,
      business_type: 'Barber', 
      image_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80' 
    },
    { 
      merchant_id: merchantId, 
      name: 'Premium Hair Spa', 
      description: 'Scalp massage, deep conditioning treatment.',
      price: 350.00, 
      duration_minutes: 45,
      category: 'Treatment', 
      is_available: true,
      business_type: 'Barber', 
      image_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80' 
    }
  ];
  const { error: sError } = await supabase.from('services').insert(servicesToInsert);
  if (sError) console.error('Error seeding services:', sError);

  console.log('Step 4: Seeding appointments...');
  const now = new Date();
  const getISOString = (hoursOffset, minutesOffset = 0) => {
    const d = new Date(now);
    d.setHours(d.getHours() + hoursOffset);
    d.setMinutes(d.getMinutes() + minutesOffset);
    return d.toISOString();
  };

  const appointmentsToInsert = [
    { 
      merchant_id: merchantId, 
      customer_name: 'Rahul Sharma', 
      service_name: 'Signature Haircut', 
      scheduled_at: getISOString(-2), // 2 hours ago
      price: 150.00, 
      status: 'completed', 
      business_type: 'Barber' 
    },
    { 
      merchant_id: merchantId, 
      customer_name: 'Aarav Patel', 
      service_name: 'Beard Trim & Styling', 
      scheduled_at: getISOString(1), // 1 hour from now
      price: 80.00, 
      status: 'confirmed', 
      business_type: 'Barber' 
    },
    { 
      merchant_id: merchantId, 
      customer_name: 'Ishaan Kishen', 
      service_name: 'Signature Haircut', 
      scheduled_at: getISOString(3), // 3 hours from now
      price: 150.00, 
      status: 'pending', 
      business_type: 'Barber' 
    },
    { 
      merchant_id: merchantId, 
      customer_name: 'Priya Singh', 
      service_name: 'Premium Hair Spa', 
      scheduled_at: getISOString(-4), // 4 hours ago
      price: 350.00, 
      status: 'completed', 
      business_type: 'Barber' 
    }
  ];
  const { error: aError } = await supabase.from('appointments').insert(appointmentsToInsert);
  if (aError) console.error('Error seeding appointments:', aError);

  console.log('Step 5: Seeding staff...');
  const staffToInsert = [
    { merchant_id: merchantId, name: 'Vikram Singh', role: 'Senior Barber', phone: '+919999999991', status: 'Active', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80' },
    { merchant_id: merchantId, name: 'Amit Kumar', role: 'Hair Stylist', phone: '+919999999992', status: 'Active', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
    { merchant_id: merchantId, name: 'Rajesh Lal', role: 'Helper', phone: '+919999999993', status: 'Off-Duty', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80' }
  ];
  const { error: stError } = await supabase.from('staff').insert(staffToInsert);
  if (stError) console.error('Error seeding staff:', stError);

  console.log('Step 6: Seeding inventory...');
  const inventoryToInsert = [
    { merchant_id: merchantId, item_name: 'Hair Gel (Set Wet)', stock: 25, threshold: 5, unit: 'pcs', category: 'Styling' },
    { merchant_id: merchantId, item_name: 'Shampoo (Amul)', stock: 5, threshold: 10, unit: 'pcs', category: 'Washing' },
    { merchant_id: merchantId, item_name: 'Razor Blades', stock: 120, threshold: 20, unit: 'pcs', category: 'Grooming' }
  ];
  const { error: iError } = await supabase.from('inventory').insert(inventoryToInsert);
  if (iError) console.error('Error seeding inventory:', iError);

  console.log('Step 7: Seeding khata records (ledger)...');
  const khataToInsert = [
    { merchant_id: merchantId, student_name: 'Rahul Sharma', hostel_address: 'Hostel Zone, block-A', amount_due: 150.00, credit_limit: 1000.00, status: 'active' },
    { merchant_id: merchantId, student_name: 'Priya Singh', hostel_address: 'Hostel Zone, block-B', amount_due: 350.00, credit_limit: 1500.00, status: 'active' },
    { merchant_id: merchantId, student_name: 'Amit Kumar', hostel_address: 'Hostel Zone, block-C', amount_due: 0.00, credit_limit: 500.00, status: 'settled' }
  ];
  const { error: kError } = await supabase.from('khata_records').insert(khataToInsert);
  if (kError) console.error('Error seeding ledger:', kError);

  console.log('Step 8: Seeding notifications...');
  const notificationsToInsert = [
    { merchant_id: merchantId, type: 'order', title: 'New Booking', message: 'Ishaan Kishen booked a Signature Haircut.', time: 'Just now', is_unread: true },
    { merchant_id: merchantId, type: 'stock', title: 'Low Inventory', message: 'Shampoo stock is below threshold limit.', time: '1 hour ago', is_unread: true }
  ];
  const { error: nError } = await supabase.from('notifications').insert(notificationsToInsert);
  if (nError) console.error('Error seeding notifications:', nError);

  console.log('Database seeding completed successfully!');
}

seed();
