-- ============================================================
-- Pocket Guard - Supabase Database Setup
-- Paste this entire file into Supabase SQL Editor and run it
-- ============================================================

-- 1. Create tables
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('inflow','outflow')),
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  note TEXT DEFAULT '',
  recurring TEXT CHECK(recurring IN ('daily','weekly','monthly','yearly')),
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('inflow','outflow'))
);

-- 2. Enable Row Level Security
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: each user can only see/edit their own data
-- ============================================================

-- Users table
CREATE POLICY "users can insert own row" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users can read own row" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users can update own row" ON users FOR UPDATE USING (auth.uid() = id);

-- Transactions table
CREATE POLICY "own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

-- Categories table
CREATE POLICY "own categories" ON categories FOR ALL USING (auth.uid() = user_id);

-- 4. Auto-create user row on sign-up
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
