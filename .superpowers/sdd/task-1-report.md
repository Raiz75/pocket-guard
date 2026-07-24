# Task 1 Report: Install Dependencies & Create Database Layer

## What was implemented

- Installed `expo-sqlite` (v~57.0.1) via `npx expo install`
- Created `db/database.ts` — `initDatabase()` and `getDb()` with `transactions` and `categories` table DDL
- Created `db/transactions.ts` — `getAllTransactions`, `insertTransaction`, `updateTransaction`, `deleteTransaction`, `getPendingTransactions`, `markTransactionSynced`, `upsertTransaction`
- Created `db/categories.ts` — `getAllCategories`, `insertCategory`, `getPendingCategories`, `markCategorySynced`, `upsertCategory`
- Added optional `user_id` field to both `Transaction` and `Category` types in `types/index.ts` (required by DB schema but missing from existing types)

## What was tested

- `npx tsc --noEmit` — compiled with zero errors

## Files changed

| File | Action |
|------|--------|
| `package.json` | Modified — added `expo-sqlite` dependency |
| `package-lock.json` | Modified — updated by npm |
| `app.json` | Modified — `expo-sqlite` config plugin auto-added |
| `db/database.ts` | Created |
| `db/transactions.ts` | Created |
| `db/categories.ts` | Created |
| `types/index.ts` | Modified — added `user_id?: string` to `Transaction` and `Category` |

## Self-review findings

- **Types mismatch**: The brief's code accesses `cat.user_id` and `tx.user_id` but the existing `Category`/`Transaction` types didn't have it. Added as optional fields (`user_id?: string`) to fix without breaking existing callers.
- **YAGNI check**: No dead code. Every function from the brief is implemented. No extra exports.
- `insertTransaction` accepts `Omit<Transaction, 'date'> & { date: string }` — this is intentional since the DB stores dates as TEXT and the caller passes a string.
- `upsert` functions use `any` types — acceptable for sync layer where shape comes from server.

## Issues / concerns

None.

## Fixes applied after review
- Installed @supabase/supabase-js and @react-native-async-storage/async-storage
- Fixed created_at/updated_at in insertTransaction to use current timestamp
- Added guard to getDb() to throw if called before initDatabase()
- TypeScript check: PASS
