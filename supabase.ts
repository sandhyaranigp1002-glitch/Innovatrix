import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getDataSourceInfo() {
  if (isSupabaseConfigured) {
    return {
      mode: 'supabase' as const,
      label: 'Cloud Multi-User (Supabase)',
      description: 'Connected to remote Supabase PostgreSQL database with active Row-Level Security policies.',
    };
  }
  return {
    mode: 'local' as const,
    label: 'Demo Mode (Local Storage)',
    description: 'Running entirely in browser storage. Data is preserved locally on this device, but not synchronized across real external users.',
  };
}
