# Architecture Overview

Pocket Guard is a **local-first, optionally cloud-synced** cashflow tracking app built with React Native (Expo SDK 57).

## High-Level Flow

```
User Action → React Screen → AppContext (in-memory state)
                                  ↓
                           SQLite (local DB)
                                  ↓
                     ┌──── sync (if signed in) ────┐
                     ↓                              ↓
               Supabase Auth                  Supabase DB
              (email/password)            (transactions, categories)
                                              ↕
                                     Real-time subscriptions
                                    (other devices get updates)
```

## Data Direction

- **Reads:** always from in-memory React state → populated from SQLite on app launch
- **Writes:** always to SQLite first (optimistic), then sync to Supabase in background
- **Sync:** triggered by pull-to-refresh, sign-in, and after every mutation (if signed in)
- **Real-time:** when signed in, Supabase pushes changes from other devices → SQLite upsert → state refresh

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| SQLite as source of truth | Works offline, instant reads, no loading states |
| In-memory state snapshot | React re-renders are fast; avoids reading SQLite on every render |
| Sync is fire-and-forget | Mutations never wait for network — UI stays fast |
| Guest mode by default | No friction to start using the app |
| Account creation optional | Local data is promoted to cloud on sign-up |

## Folder Layout

```
app/          → Expo Router screens (file-based routing)
components/   → Reusable UI (modals, cards)
constants/    → Theme colors, default categories
db/           → SQLite CRUD functions
lib/          → Supabase client, sync engine, realtime
store/        → React Context providers (auth + app state)
types/        → TypeScript type definitions
```
