import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iferziidmcsxfarwwkep.supabase.co';
const supabaseAnonKey = 'sb_publishable_fMaGt9N3Els5gWtoxuTLnQ_XKN8hLrP';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'implicit',
      },
    })
  : null;
