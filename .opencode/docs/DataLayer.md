# Data Layer

## Types (`types/index.ts`)

```ts
Transaction { id, type, amount, category, note, date, recurring, user_id }
Category    { id, name, type, user_id }
```

- `type`: `'inflow' | 'outflow'`
- `recurring`: `'daily' | 'weekly' | 'monthly' | 'yearly' | null`
- `sync_status` (local only): `'pending' | 'synced' | 'deleted'`

## Local SQLite (`db/`)

### database.ts
- `initDatabase()` — opens SQLite file, creates tables if not exist
- `getDb()` — returns the db instance (throws if not initialized)

### transactions.ts

| Function | Purpose |
|----------|---------|
| `getAllTransactions()` | All non-deleted transactions, ordered by date DESC |
| `insertTransaction(tx)` | Insert with sync_status='pending' |
| `updateTransaction(tx)` | Update and reset sync_status to 'pending' |
| `deleteTransaction(id)` | Soft delete (sets sync_status='deleted') |
| `getPendingTransactions()` | Records with status 'pending' or 'deleted' |
| `markTransactionSynced(id)` | Sets status to 'synced' |
| `upsertTransaction(tx)` | Insert or update (used by sync pull) |

### categories.ts
Same pattern as transactions: `getAll`, `insert`, `getPending`, `markSynced`, `upsert`, plus `deleteCategory` for soft-delete.

### seed.ts
- `seedDefaultCategories()` — inserts the 12 default categories if the table is empty

## Supabase (`lib/`)

### supabase.ts
Creates the Supabase client with AsyncStorage for session persistence.

### sync.ts
- `syncAll(userId)` — push pending local records up, pull remote records down
- Uses a mutex lock to prevent concurrent syncs
- Strips `sync_status`/timestamps before pushing (Supabase tables don't have these)

### realtime.ts
- `subscribeToChanges(userId, refresh)` — subscribes to INSERT/UPDATE/DELETE on transactions + categories
- `unsubscribe()` — cleans up all channels

## State Management (`store/`)

### AppContext.tsx
- On mount: init SQLite → seed defaults → load all data into state
- Exposes: transactions, categories, balance, add/update/delete functions, refresh
- All mutations write to SQLite first, then update in-memory state
- If signed in, fires `syncAll()` in background after each mutation
- Watches for user sign-in → triggers initial sync to pull cloud data

### AuthContext.tsx
- Exposes: session, user, isGuest, isLoading, signUp, signIn, signOut
- On mount: checks for persisted session
- `signUp` passes name via `options.data` for the Supabase trigger
- `signOut` clears session → redirects to /auth
