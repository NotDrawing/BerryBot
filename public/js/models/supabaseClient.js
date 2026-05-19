import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://otibvoqmgsybpfaqiyun.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aWJ2b3FtZ3N5YnBmYXFpeXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzI4NDcsImV4cCI6MjA5MTcwODg0N30.KQpiRCulIi6c5p021OqqOPS8oyr_-mSfhM70qAwcz9I';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: localStorage,
        flowType: 'pkce' // Importante para OAuth
    }
});

export default supabase;
export { supabase };