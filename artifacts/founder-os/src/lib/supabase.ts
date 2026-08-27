import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rinjnowkibgnfamdkyeu.supabase.co';
const supabaseAnonKey = 'sb_publishable_F1CNwz7rQ9i5fKP-5tK0Sg_5A7mvRjC';

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
