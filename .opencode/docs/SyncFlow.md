# Sync Flow

## States

- **Guest mode** (default): all data in local SQLite only. No cloud calls.
- **Signed in**: local SQLite + Supabase cloud. Two-way sync.

## Push (local → cloud)

Triggered on:
- Adding/updating/deleting a transaction
- Adding a category
- Pull-to-refresh on dashboard
- Sign-in on a new device

Process:
1. Query all records with `sync_status = 'pending'` or `'deleted'`
2. For each pending record: strip local-only fields → upsert to Supabase
3. For each deleted record: DELETE from Supabase
4. Mark as `synced` in local SQLite

## Pull (cloud → local)

Process:
1. SELECT all remote records filtered by `user_id`
2. For each: upsert into local SQLite with `sync_status = 'synced'`
3. Refresh in-memory state from SQLite

## Real-time

- When signed in, subscribes to Postgres changes on `transactions` and `categories`
- Another device makes a change → Supabase pushes notification
- App handles INSERT/UPDATE (upsert into SQLite) and DELETE (soft delete)
- Calls `refresh()` to update the UI

## Conflict Resolution

**Last-write-wins** based on `updated_at`. Local changes are pushed and overwrite whatever is on the server. Since this is a single-user app (different devices, same account), conflicts are rare and last-write-wins is acceptable.

## Sequence Diagram

```
User adds transaction
       │
       ▼
AppContext.addTransaction()
       │
       ├───► SQLite: insert with sync_status='pending'
       │
       ├───► setTransactions() → UI updates immediately
       │
       └───► [if signed in] syncAll(user.id)
                          │
                          ├───► SQLite: get pending records
                          │
                          ├───► Supabase: upsert each
                          │
                          ├───► SQLite: mark as synced
                          │
                          └───► Supabase: SELECT remote
                              └───► SQLite: upsert each
                                  └───► refresh() → UI syncs
```
