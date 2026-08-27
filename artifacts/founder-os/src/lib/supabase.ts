import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fajofzkvmccjmmjtfpmv.supabase.co';
const supabaseAnonKey = 'sb_publishable_544zFdW3hWrMFRPS_UMsEg_cjlU_y36';

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
