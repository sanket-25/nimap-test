const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.SUPABASE_HOST,
  database: process.env.SUPABASE_DB,
  user: process.env.SUPABASE_USER,
  password: process.env.SUPABASE_PASSWORD,
  port: Number(process.env.SUPABASE_PORT),
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
