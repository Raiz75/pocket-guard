import { getDb } from './database'
import { DEFAULT_CATEGORIES } from '../constants/Categories'

export async function seedDefaultCategories(): Promise<void> {
  const db = getDb()
  const count = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM categories')
  if (count && count.count > 0) return

  for (const cat of DEFAULT_CATEGORIES) {
    await db.runAsync(
      "INSERT INTO categories (id, name, type, sync_status) VALUES (?, ?, ?, 'pending')",
      cat.id, cat.name, cat.type
    )
  }
}
