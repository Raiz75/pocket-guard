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
  return db.getAllAsync("SELECT * FROM categories WHERE sync_status IN ('pending','deleted')")
}

export async function markCategorySynced(id: string): Promise<void> {
  const db = getDb()
  await db.runAsync("UPDATE categories SET sync_status='synced' WHERE id=?", id)
}

export async function deleteCategory(id: string): Promise<void> {
  const db = getDb()
  await db.runAsync("UPDATE categories SET sync_status='deleted' WHERE id=?", id)
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
