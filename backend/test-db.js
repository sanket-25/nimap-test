require('dotenv').config();
const supabase = require('./config/db');

async function testConnection() {
  console.log('Testing database connection...');
  console.log('SUPABASE_HOST:', process.env.SUPABASE_HOST);
  console.log('SUPABASE_DB:', process.env.SUPABASE_DB);
  console.log('SUPABASE_USER:', process.env.SUPABASE_USER);
  console.log('SUPABASE_PORT:', process.env.SUPABASE_PORT);

  try {
    const { data: nowData, error: nowError } = await supabase.rpc('now');
    // supabase.rpc('now') may not be enabled; fallback to select
    if (nowError) {
      console.warn('RPC now not available, performing simple query');
      // perform workaround query with select on any table or use from
    }
    console.log('✅ Supabase client initialized');

    // try selecting from categories table to ensure schema applied
    const { data: cats, error: catsError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    console.log('\n📋 Categories query:');
    if (catsError) {
      console.error('Categories query error (likely no table or permissions):', catsError.message);
      console.log('❌ It looks like the database schema may not be created or accessible.');
    } else {
      console.log('Categories row sample:', cats);
    }
  } catch (error) {
    console.error('❌ Supabase connection test failed:');
    console.error('Error:', error.message);
  }
  process.exit(0);
}

testConnection();
