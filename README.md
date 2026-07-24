# Pocket Guard

A cross-platform (Android + iOS) cashflow tracking app built with React Native (Expo). Tracks income and expenses with local-first persistence and optional Supabase cloud sync.

## Features

- **Dashboard** — view balance, monthly income/expenses, recent transactions
- **Add Transactions** — inflow/outflow with amount, category, note, and recurring intervals
- **Categories** — default income/expense categories, add custom ones
- **Recurring** — view and manage recurring transactions
- **Profile** — sign up / sign in for optional cloud sync
- **Offline-first** — all data stored locally in SQLite, syncs to Supabase when online

## Tech Stack

- **Framework:** React Native (Expo SDK 57)
- **Routing:** Expo Router (file-based)
- **Navigation:** Drawer (hamburger menu)
- **Local DB:** expo-sqlite
- **Cloud:** Supabase (auth + database + real-time)
- **Animations:** react-native-reanimated + react-native-gesture-handler

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase (optional — app works offline without it)

1. Create a free project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key into `.env` (use `.env.example` as template)
3. Open Supabase SQL Editor and run the contents of `db.sql`

### 3. Run the app

```bash
npx expo start
```

Scan the QR code with **Expo Go** (Android/iOS) or run on an emulator:

```bash
npx expo run:android   # needs Android Studio
npx expo run:ios       # needs Xcode (Mac only)
```

## Project Structure

```
pocket-guard/
├── app/            # Expo Router screens
├── components/     # Reusable UI components
├── constants/      # Colors, default categories
├── db/             # SQLite database layer
├── lib/            # Supabase client, sync engine, realtime
├── store/          # React Context providers (auth, app state)
├── types/          # TypeScript types
├── db.sql          # Supabase schema (paste into SQL Editor)
└── .env.example    # Environment variable template
```
