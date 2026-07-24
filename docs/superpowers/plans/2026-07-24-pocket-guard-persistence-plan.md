# Pocket Guard — Offline-First Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add local SQLite persistence with optional Supabase cloud sync and email auth.

**Architecture:** Local SQLite (`expo-sqlite`) for all reads/writes. Supabase as optional cloud backend. Sync engine pushes local changes up and pulls remote changes down. Real-time subscriptions for multi-device updates. Guest mode uses SQLite only; signing up tags existing data with a user_id and syncs.

**Tech Stack:** `expo-sqlite`, `@supabase/supabase-js`, `@react-native-async-storage/async-storage`

## Global Constraints

- All reads must come from local SQLite (instant, no loading states)
- Guest mode: zero setup, all data local-only
- Signed-in mode: sync is pull-to-refresh triggered, with real-time subscription
- Conflict resolution: last-write-wins by `updated_at`
- Row Level Security on Supabase: queries scoped to `auth.uid()`
- `sync_status` values: `pending` | `synced` | `deleted`
- IDs are UUIDs generated on-device with `crypto.randomUUID()`

---
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
### Task 2: Set Up Supabase Client & Auth

**Files:**
- Create: `lib/supabase.ts`
- Create: `store/AuthContext.tsx`
- Create: `app/auth.tsx`
- Modify: `app/_layout.tsx` (add AuthProvider)
- Modify: `app/(tabs)/profile.tsx` (wire auth UI)

**Interfaces:**
- Consumes: Database layer from Task 1
- Produces: `lib/supabase.ts` → `supabase` client instance, `store/AuthContext.tsx` → `useAuth()` hook, sign up/sign in/sign out functions

- [ ] **Step 1: Create `lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true },
})
```

- [ ] **Step 2: Create `.env` file with placeholder values**

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 3: Create `store/AuthContext.tsx`**

```tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { Session, User } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  user: User | null
  isGuest: boolean
  isLoading: boolean
  signUp: (email: string, password: string, name: string) => Promise<string | null>
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return error.message
    if (data.user) {
      await supabase.from('users').insert({ id: data.user.id, email, name })
    }
    return null
  }

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? error.message : null
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user, isGuest: !user, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

- [ ] **Step 4: Wrap root layout with AuthProvider in `app/_layout.tsx`**

```tsx
import { AuthProvider } from '../store/AuthContext'

// Inside GestureHandlerRootView, before AppProvider:
<AuthProvider>
  <AppProvider>
    <Drawer ... />
  </AppProvider>
</AuthProvider>
```

- [ ] **Step 5: Create `app/auth.tsx` - sign up / sign in screen**

```tsx
import { useState } from 'react'
import { StyleSheet, Text, View, TextInput, Pressable, Alert, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../constants/Colors'
import { useAuth } from '../store/AuthContext'

export default function AuthScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = Colors[theme]
  const { signUp, signIn } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    const error = isSignUp ? await signUp(email, password, name) : await signIn(email, password)
    setLoading(false)
    if (error) { Alert.alert('Error', error); return }
    router.replace('/home')
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sync your data across devices</Text>
      {isSignUp && (
        <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} placeholder="Name" placeholderTextColor={colors.tabInactive} value={name} onChangeText={setName} />
      )}
      <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} placeholder="Email" placeholderTextColor={colors.tabInactive} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} placeholder="Password" placeholderTextColor={colors.tabInactive} value={password} onChangeText={setPassword} secureTextEntry />
      <Pressable style={[styles.btn, { backgroundColor: colors.tint, opacity: loading ? 0.6 : 1 }]} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}</Text>
      </Pressable>
      <Pressable onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={[styles.switch, { color: colors.tint }]}>{isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}</Text>
      </Pressable>
      <Pressable onPress={() => router.replace('/home')}>
        <Text style={[styles.skip, { color: colors.textSecondary }]}>Continue as Guest</Text>
      </Pressable>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 32 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 16 },
  btn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  switch: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  skip: { fontSize: 14, textAlign: 'center' },
})
```

- [ ] **Step 6: Update Profile screen with auth UI**

In `app/(tabs)/profile.tsx`, import `useAuth` and show sign-in prompt when guest, user info + sign out when signed in.

- [ ] **Step 7: Update `app/index.tsx` to redirect to auth on first launch**

Check if no session → `/auth`, else `/home`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add Supabase auth with guest mode and sign up/sign in screen"
```

---
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
