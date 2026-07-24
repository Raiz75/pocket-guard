### Task 3: Wire Sync Engine

**Files:**
- Create: `lib/sync.ts`
- Modify: `store/AppContext.tsx` (replace in-memory with SQLite + trigger sync)

- [ ] **Step 1: Create `lib/sync.ts` - push & pull logic**

```ts
import { supabase } from './supabase'
import { getPendingTransactions, markTransactionSynced, upsertTransaction } from '../db/transactions'
import { getPendingCategories, markCategorySynced, upsertCategory } from '../db/categories'
import { useAuth } from '../store/AuthContext'

export async function syncAll(userId: string): Promise<void> {
  // Push pending local changes
  const pendingTxs = await getPendingTransactions()
  for (const tx of pendingTxs) {
    const payload = { ...tx, user_id: userId }
    if (tx.sync_status === 'deleted') {
      await supabase.from('transactions').delete().eq('id', tx.id)
    } else {
      await supabase.from('transactions').upsert(payload).eq('id', tx.id)
    }
    await markTransactionSynced(tx.id)
  }

  const pendingCats = await getPendingCategories()
  for (const cat of pendingCats) {
    await supabase.from('categories').upsert({ ...cat, user_id: userId }).eq('id', cat.id)
    await markCategorySynced(cat.id)
  }

  // Pull remote changes
  const { data: remoteTxs } = await supabase.from('transactions').select('*')
  if (remoteTxs) {
    for (const tx of remoteTxs) {
      await upsertTransaction(tx)
    }
  }

  const { data: remoteCats } = await supabase.from('categories').select('*')
  if (remoteCats) {
    for (const cat of remoteCats) {
      await upsertCategory(cat)
    }
  }
}
```

- [ ] **Step 2: Refactor `store/AppContext.tsx` to read/write from SQLite**

Replace all in-memory state (`useReducer`) with async functions that call the database layer. Add a `refresh` function that re-reads all data from SQLite. Wire `addTransaction` to call `insertTransaction` + trigger sync in background if signed in.

- [ ] **Step 3: Add pull-to-refresh to dashboard**

In `app/home.tsx`, wrap the FlatList's `refreshControl` prop to call `syncAll()` if signed in.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add sync engine and wire AppContext to SQLite"
```

---

