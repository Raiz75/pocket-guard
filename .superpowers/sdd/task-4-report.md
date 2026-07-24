# Task 4: Add Real-Time Subscriptions — Report

**Status:** DONE

## Changes

- **Created** `lib/realtime.ts` — `subscribeToChanges(userId, refresh)` subscribes to Supabase Realtime channels for `transactions` and `categories` tables. Handles insert/update via `upsertTransaction`/`upsertCategory` and delete via `deleteTransaction`, then calls `refresh()`. `unsubscribe()` removes all channels.
- **Modified** `store/AppContext.tsx` — Added a `useEffect` that wires `subscribeToChanges(user.id, refresh)` when signed in, with cleanup calling `unsubscribe()`. Moved `refresh` definition above the effect to avoid hoisting issues.

## Key design decisions followed:
1. No `require()` in the handler — imports are at the top of `lib/realtime.ts`
2. No `useApp` import in `lib/realtime.ts` — `refresh` is a callback parameter
3. Wire-up in `store/AppContext.tsx` (not root layout) via `useEffect`

## Verification
- `npx tsc --noEmit` — passes with zero errors

## Commits
No commits — no git repo detected.
