import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// DEBUG LOGS (Temporary for troubleshooting)
if (typeof window !== 'undefined') {
  console.log('--- SUPABASE CONFIG CHECK ---');
  console.log('URL Present:', !!supabaseUrl);
  if (supabaseUrl) console.log('URL Prefix:', supabaseUrl.substring(0, 15) + '...');
  console.log('Key Present:', !!supabaseAnonKey);
  console.log('-----------------------------');
}

// Only initialize if we have the credentials, otherwise export a null-safe proxy or handle it in components
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any; 

