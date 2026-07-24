# Task 3: Wire Sync Engine & Refactor AppContext

**Status:** DONE

**Commits created:**
- `662746a` — feat: add sync engine and wire AppContext to SQLite

**Test summary:**
- `npx tsc --noEmit` — passes with zero errors

**Files changed:**
- `lib/sync.ts` — created with `syncAll(userId)` push/pull logic (no unused `useAuth` import)
- `store/AppContext.tsx` — refactored from in-memory `useReducer` to SQLite-backed state with `useState` + `useEffect` init, auto-sync for signed-in users, `refresh()`, and `loading` state
- `app/home.tsx` — added `RefreshControl` pull-to-refresh that calls `syncAll` (if signed in) then `refresh()`

**Concerns:**
- Background `syncAll` calls are fire-and-forget with `.catch(() => {})`; concurrent syncs could race if user makes rapid mutations
- `syncAll` fetches ALL remote records (no pagination); may need cursor-based sync for scale
- Default categories seeded into SQLite only when categories table is empty (matches old in-memory behavior)
