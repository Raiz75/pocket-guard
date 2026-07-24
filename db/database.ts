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
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.')
  return db
}
