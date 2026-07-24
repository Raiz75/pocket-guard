# Pocket Guard Developer Docs

Welcome to the Pocket Guard codebase documentation.

## Quick Start

```bash
npm install
npx expo start         # Development
npx expo run:android   # Build APK
```

## Docs Index

| Document | Description |
|----------|-------------|
| [[Architecture]] | High-level architecture, data flow, design decisions |
| [[Navigation]] | Route structure, drawer items, auth flow |
| [[DataLayer]] | Types, SQLite CRUD, Supabase client, sync, realtime |
| [[ComponentLibrary]] | All reusable components, screens, shared patterns |
| [[SyncFlow]] | How local-to-cloud sync works (push, pull, real-time) |
| [[AddingFeatures]] | Guide for adding new screens, entities, migrations |

## Key Files

| File | Purpose |
|------|---------|
| `store/AppContext.tsx` | Central state — SQLite-backed, triggers sync |
| `store/AuthContext.tsx` | Auth state — guest or signed in |
| `lib/sync.ts` | Push/pull sync engine |
| `lib/realtime.ts` | Real-time subscriptions |
| `db/database.ts` | SQLite init and table DDL |
| `db.sql` | Supabase schema (manual paste into SQL Editor) |
| `app/_layout.tsx` | Drawer navigator + providers |
