### Task 1: Install Dependencies & Create Database Layer

**Files:**
- Create: `db/database.ts`
- Create: `db/transactions.ts`
- Create: `db/categories.ts`
- Modify: `package.json` (deps)

**Interfaces:**
- Consumes: Nothing
- Produces: `db/database.ts` → `initDatabase(): Promise<void>`, `db/transactions.ts` → `getAll()`, `insert(tx)`, `update(tx)`, `remove(id)`, `getPending()`, `markSynced(id)`, `upsert(tx)`, `db/categories.ts` → `getAll()`, `insert(cat)`, `getPending()`, `markSynced(id)`, `upsert(cat)`

- [ ] **Step 1: Install dependencies**

```bash
npx expo install expo-sqlite @supabase/supabase-js @react-native-async-storage/async-storage
```

- [ ] **Step 2: Create `db/database.ts` - SQLite init and table creation**

```ts
import * as SQLite from 'expo-sqlite'

let db: SQLite.SQLiteDatabase

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  db = await SQLite.openDatabaseAsync('pocket-guard.db')
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      type TEXT NOT NULL CHECK(type IN ('inflow','outflow')),
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      note TEXT DEFAULT '',
      recurring TEXT CHECK(recurring IN ('daily','weekly','monthly','yearly')),
      date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      sync_status TEXT DEFAULT 'pending' CHECK(sync_status IN ('pending','synced','deleted'))
    );
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('inflow','outflow')),
      sync_status TEXT DEFAULT 'pending' CHECK(sync_status IN ('pending','synced','deleted'))
    );
  `)
  return db
}

export function getDb(): SQLite.SQLiteDatabase {
  return db
}
```

- [ ] **Step 3: Create `db/transactions.ts` - transaction CRUD**

```ts
import { getDb } from './database'
import { Transaction } from '../types'

export async function getAllTransactions(): Promise<Transaction[]> {
  const db = getDb()
  const rows = await db.getAllAsync<Transaction>('SELECT * FROM transactions WHERE sync_status != ? ORDER BY date DESC', 'deleted')
  return rows.map((r) => ({ ...r, date: new Date(r.date) }))
}

export async function insertTransaction(tx: Omit<Transaction, 'date'> & { date: string }): Promise<void> {
  const db = getDb()
  await db.runAsync(
    'INSERT INTO transactions (id, user_id, type, amount, category, note, recurring, date, created_at, updated_at, sync_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    tx.id, tx.user_id || null, tx.type, tx.amount, tx.category, tx.note, tx.recurring, tx.date, tx.date, tx.date, 'pending'
  )
}

export async function updateTransaction(tx: Transaction): Promise<void> {
  const db = getDb()
  await db.runAsync(
    "UPDATE transactions SET type=?, amount=?, category=?, note=?, recurring=?, date=?, updated_at=?, sync_status='pending' WHERE id=?",
    tx.type, tx.amount, tx.category, tx.note, tx.recurring, tx.date.toISOString(), new Date().toISOString(), tx.id
  )
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = getDb()
  await db.runAsync("UPDATE transactions SET sync_status='deleted', updated_at=? WHERE id=?", new Date().toISOString(), id)
}

export async function getPendingTransactions(): Promise<any[]> {
  const db = getDb()
  return db.getAllAsync("SELECT * FROM transactions WHERE sync_status IN ('pending','deleted')")
}

export async function markTransactionSynced(id: string): Promise<void> {
  const db = getDb()
  await db.runAsync("UPDATE transactions SET sync_status='synced' WHERE id=?", id)
}

export async function upsertTransaction(tx: any): Promise<void> {
  const db = getDb()
  const existing = await db.getFirstAsync('SELECT id FROM transactions WHERE id=?', tx.id)
  if (existing) {
    await db.runAsync(
      'UPDATE transactions SET type=?, amount=?, category=?, note=?, recurring=?, date=?, updated_at=?, user_id=?, sync_status=? WHERE id=?',
      tx.type, tx.amount, tx.category, tx.note, tx.recurring, tx.date, tx.updated_at, tx.user_id, 'synced', tx.id
    )
  } else {
    await db.runAsync(
      'INSERT INTO transactions (id, user_id, type, amount, category, note, recurring, date, created_at, updated_at, sync_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      tx.id, tx.user_id, tx.type, tx.amount, tx.category, tx.note, tx.recurring, tx.date, tx.created_at, tx.updated_at, 'synced'
    )
  }
}
```

- [ ] **Step 4: Create `db/categories.ts` - category CRUD**

```ts
import { getDb } from './database'
import { Category } from '../types'

export async function getAllCategories(): Promise<Category[]> {
  const db = getDb()
  return db.getAllAsync<Category>('SELECT * FROM categories')
}

export async function insertCategory(cat: Category): Promise<void> {
  const db = getDb()
  await db.runAsync(
    "INSERT INTO categories (id, user_id, name, type, sync_status) VALUES (?, ?, ?, ?, 'pending')",
    cat.id, cat.user_id || null, cat.name, cat.type
  )
}

export async function getPendingCategories(): Promise<any[]> {
  const db = getDb()
  return db.getAllAsync("SELECT * FROM categories WHERE sync_status='pending'")
}

export async function markCategorySynced(id: string): Promise<void> {
  const db = getDb()
  await db.runAsync("UPDATE categories SET sync_status='synced' WHERE id=?", id)
}

export async function upsertCategory(cat: any): Promise<void> {
  const db = getDb()
  const existing = await db.getFirstAsync('SELECT id FROM categories WHERE id=?', cat.id)
  if (existing) {
    await db.runAsync('UPDATE categories SET name=?, type=?, user_id=?, sync_status=? WHERE id=?', cat.name, cat.type, cat.user_id, 'synced', cat.id)
  } else {
    await db.runAsync('INSERT INTO categories (id, user_id, name, type, sync_status) VALUES (?, ?, ?, ?, ?)', cat.id, cat.user_id, cat.name, cat.type, 'synced')
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add SQLite database layer with transaction and category CRUD"
```

---

