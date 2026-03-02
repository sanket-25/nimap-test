// switch to using supabase-js client instead of raw PG connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and anon key must be defined in environment');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  // choose streaming or other options if needed
});

module.exports = supabase;
