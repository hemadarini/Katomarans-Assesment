import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve environment variables path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;

// Connection Pool Configuration
const isProduction = process.env.NODE_ENV === 'production';
const hasRemoteDbUrl = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'URLytics '}`,
  ssl: (isProduction || hasRemoteDbUrl) ? { rejectUnauthorized: false } : false,
});

// Handle pool errors on idle clients to prevent crashing the server
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle database client:', err.message);
});

// Test Database Connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

export const query = (text, params) => pool.query(text, params);
export default pool;
