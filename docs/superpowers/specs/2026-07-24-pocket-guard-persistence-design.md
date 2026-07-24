# Pocket Guard — Offline-First Persistence with Optional Cloud Sync

## Overview
Add offline-first data persistence with optional Supabase cloud sync. Local SQLite via `expo-sqlite` stores all data on-device. Supabase provides cross-device sync, real-time updates, and backup — only if the user chooses to sign up.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                 Pocket Guard App                │
│                                                 │
│  ┌──────────────┐      Reads/Writes             │
│  │  Local SQLite │ ◄───────────────────         │
│  │  (expo-sqlite)│                               │
│  └──────┬───────┘                               │
│         │ sync (if signed in)                    │
│         ▼                                        │
│  ┌──────────────┐                               │
│  │   Supabase   │                               │
│  │   (Cloud)    │                               │
│  └──────────────┘                               │
└─────────────────────────────────────────────────┘
```

## Modes

### Guest Mode (default, no sign-up)
- All reads/writes hit local SQLite only
- No cloud sync, no account needed
- Data persists on-device across app restarts
- "Sign In" prompt available in Profile

### Signed-In Mode (optional)
- Everything in Guest mode, plus:
- Sync engine pushes local changes to Supabase and pulls remote changes
- Real-time subscriptions: changes from other devices appear automatically
- Signing in on a new device pulls all cloud data into local SQLite
- Signing up from guest mode pushes existing local data to the new Supabase account

## Data Model

### Local SQLite Tables

```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT NOT NULL CHECK(type IN ('inflow','outflow')),
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  note TEXT DEFAULT '',
  recurring TEXT CHECK(recurring IN ('daily','weekly','monthly','yearly', NULL)),
  date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  sync_status TEXT DEFAULT 'pending' CHECK(sync_status IN ('pending','synced','deleted'))
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('inflow','outflow')),
  sync_status TEXT DEFAULT 'pending' CHECK(sync_status IN ('pending','synced','deleted'))
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### Supabase Tables (same minus sync_status)

Plus Row Level Security: each query scoped to `auth.uid()`.

## Sync Flow

### Write Path
1. App writes to local SQLite with `sync_status = 'pending'`
2. UI updates immediately (optimistic)
3. If signed in and online → sync engine pushes pending records to Supabase → marks `synced`
4. If offline → stays `pending`. Pushed on next sync.

### Read Path
1. App always reads from local SQLite (instant, no loading)
2. Pull-to-refresh: push pending → pull remote changes → merge into SQLite
3. Delete records locally with `sync_status = 'deleted'` → next sync removes from Supabase

### Real-Time (only when signed in)
- After sync, subscribe to Supabase Realtime channel for `transactions` and `categories`
- Changes from other devices push a notification → app updates local SQLite in-place
- User sees changes without manual refresh

## Auth Flow

### Sign Up
- Email + password + name
- Supabase Auth creates auth user
- Client inserts row into `users` table
- Local data tagged with new `user_id` → first sync pushes everything up

### Sign In
- Email + password
- Validates via Supabase Auth
- Pulls all remote data into local SQLite (upserts by id)

### Session Persistence
- Supabase stores session token securely
- On launch: check session validity → signed in or guest
- Session refresh handled by Supabase client automatically

## Tech Stack
- **expo-sqlite** — local SQLite database
- **@supabase/supabase-js** — Supabase client (auth + data + real-time)
- **@react-native-async-storage/async-storage** — session storage for Supabase (its default adapter)
