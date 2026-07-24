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
    tx.id, tx.user_id || null, tx.type, tx.amount, tx.category, tx.note, tx.recurring, tx.date, new Date().toISOString(), new Date().toISOString(), 'pending'
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
