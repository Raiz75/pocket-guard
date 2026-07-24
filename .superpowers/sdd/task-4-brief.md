### Task 4: Add Real-Time Subscriptions

**Files:**
- Create: `lib/realtime.ts`
- Modify: `app/_layout.tsx` (init real-time when signed in)

- [ ] **Step 1: Create `lib/realtime.ts`**

```ts
import { supabase } from './supabase'
import { upsertTransaction } from '../db/transactions'
import { upsertCategory } from '../db/categories'
import { getAllTransactions, getAllCategories } from '../db/transactions'
import { useApp } from '../store/AppContext'

let channels: any[] = []

export function subscribeToChanges(userId: string, refresh: () => Promise<void>) {
  unsubscribe()

  const txChannel = supabase
    .channel('transactions-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, async (payload) => {
      if (payload.eventType === 'DELETE') {
        const { deleteTransaction } = require('../db/transactions')
        await deleteTransaction(payload.old.id)
      } else {
        await upsertTransaction(payload.new)
      }
      await refresh()
    })
    .subscribe()

  const catChannel = supabase
    .channel('categories-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${userId}` }, async (payload) => {
      await upsertCategory(payload.new)
      await refresh()
    })
    .subscribe()

  channels = [txChannel, catChannel]
}

export function unsubscribe() {
  channels.forEach((c) => supabase.removeChannel(c))
  channels = []
}
```

- [ ] **Step 2: Wire in root layout**

Call `subscribeToChanges` when user signs in and `unsubscribe` on sign out.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add real-time subscriptions for multi-device sync"
```

