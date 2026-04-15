import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const sessionId = 'c5ec26f1-50a1-45bb-8027-a822074d43db';
  console.log('Testing fetch for session:', sessionId);
  const { data, error } = await supabase
    .from('cohost_requests')
    .select('*, profiles(username, display_name)')
    .eq('session_id', sessionId);
  console.log('Data:', data);
  console.log('Error:', error);
}

test();
