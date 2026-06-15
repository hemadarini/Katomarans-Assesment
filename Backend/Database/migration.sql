-- PostgreSQL database migration script for URLytics  Auth
-- Run this script to create the necessary tables in your PostgreSQL database

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index on refresh_token for fast token lookup during refresh/logout
CREATE INDEX IF NOT EXISTS idx_users_refresh_token ON users(refresh_token);

-- Create urls table if not exists
CREATE TABLE IF NOT EXISTS urls (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_url TEXT NOT NULL,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    clicks INT DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on short_code for instant redirection redirects
CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);

-- Index on user_id to query a user's collection of shortened links
CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls(user_id);

-- Create visits table for analytics click logging
CREATE TABLE IF NOT EXISTS visits (
    id SERIAL PRIMARY KEY,
    url_id INT NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
    browser VARCHAR(50) DEFAULT 'Unknown',
    device VARCHAR(50) DEFAULT 'Desktop',
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on url_id for rapid analytics aggregations
CREATE INDEX IF NOT EXISTS idx_visits_url_id ON visits(url_id);


-- DB MIGRATION ALTER COMMANDS FOR EXISTING DATABASES:
-- Run these if your tables already exist in your local PostgreSQL:
-- ALTER TABLE urls ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
-- ALTER TABLE visits ADD COLUMN IF NOT EXISTS browser VARCHAR(50) DEFAULT 'Unknown';
-- ALTER TABLE visits ADD COLUMN IF NOT EXISTS device VARCHAR(50) DEFAULT 'Desktop';



