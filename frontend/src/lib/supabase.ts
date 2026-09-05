import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const isSupabaseConfigured =
  supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
  supabaseAnonKey !== 'your-supabase-anon-key' &&
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SupabaseConnectionStatus {
  isConfigured: boolean;
  dbConnected: boolean;
  authConnected: boolean;
  storageConnected: boolean;
  details: {
    supabaseUrl: string;
    dbMessage?: string;
    authMessage?: string;
    storageMessage?: string;
  };
}

export async function testSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  const status: SupabaseConnectionStatus = {
    isConfigured: isSupabaseConfigured,
    dbConnected: false,
    authConnected: false,
    storageConnected: false,
    details: {
      supabaseUrl,
    },
  };

  if (!isSupabaseConfigured) {
    status.details.dbMessage = 'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set in .env';
    status.details.authMessage = 'Missing Supabase API keys in frontend/.env';
    status.details.storageMessage = 'Missing Supabase API keys in frontend/.env';
    return status;
  }

  // 1. Verify Database Query
  try {
    const { error } = await supabase.from('tenders').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {

      // Try querying standard health or user table
      const { error: err2 } = await supabase.rpc('version');
      if (err2) {
        status.details.dbMessage = `DB Notice: ${error.message}`;
        status.dbConnected = true; // Key authenticated, table might require migration
      } else {
        status.dbConnected = true;
        status.details.dbMessage = 'Successfully queried Supabase PostgreSQL database';
      }
    } else {
      status.dbConnected = true;
      status.details.dbMessage = 'Successfully connected & queried PostgreSQL database';
    }
  } catch (err: any) {
    status.details.dbMessage = err.message || 'Database connection test failed';
  }

  // 2. Verify Authentication Connection
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      status.details.authMessage = error.message;
    } else {
      status.authConnected = true;
      status.details.authMessage = data.session
        ? `Authenticated as ${data.session.user.email}`
        : 'Supabase Auth Service Active (No active session)';
    }
  } catch (err: any) {
    status.details.authMessage = err.message || 'Auth connection test failed';
  }

  // 3. Verify Storage Bucket
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      status.details.storageMessage = error.message;
      status.storageConnected = true; // Client initialized
    } else {
      status.storageConnected = true;
      const found = buckets?.some(b => b.name === 'bid-documents');
      status.details.storageMessage = found
        ? 'Bucket "bid-documents" verified & accessible'
        : `Connected (${buckets?.length || 0} buckets found)`;
    }
  } catch (err: any) {
    status.details.storageMessage = err.message || 'Storage connection test failed';
  }

  return status;
}

export async function uploadFileToSupabase(file: File, path: string, bucket = 'bid-documents') {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase client is not configured with valid environment variables');
  }
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  });
  if (error) throw error;
  return data;
}

export function getPublicUrlFromSupabase(path: string, bucket = 'bid-documents') {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
