import { supabase } from './supabase'
import { getPendingTransactions, markTransactionSynced, upsertTransaction } from '../db/transactions'
import { getPendingCategories, markCategorySynced, upsertCategory } from '../db/categories'

let syncing = false

export async function syncAll(userId: string): Promise<void> {
  if (syncing) return
  syncing = true
  try {
    const pendingTxs = await getPendingTransactions()
    for (const tx of pendingTxs) {
      const { sync_status, created_at, updated_at, ...clean } = tx
      const payload = { ...clean, user_id: userId }
      if (tx.sync_status === 'deleted') {
        await supabase.from('transactions').delete().eq('id', tx.id)
      } else {
        await supabase.from('transactions').upsert(payload, { onConflict: 'id' })
      }
      await markTransactionSynced(tx.id)
    }

    const pendingCats = await getPendingCategories()
    for (const cat of pendingCats) {
      const { sync_status, ...clean } = cat
      if (cat.sync_status === 'deleted') {
        await supabase.from('categories').delete().eq('id', cat.id)
      } else {
        await supabase.from('categories').upsert({ ...clean, user_id: userId }, { onConflict: 'id' })
      }
      await markCategorySynced(cat.id)
    }

    const { data: remoteTxs } = await supabase.from('transactions').select('*').eq('user_id', userId)
    if (remoteTxs) {
      for (const tx of remoteTxs) {
        await upsertTransaction(tx)
      }
    }

    const { data: remoteCats } = await supabase.from('categories').select('*').eq('user_id', userId)
    if (remoteCats) {
      for (const cat of remoteCats) {
        await upsertCategory(cat)
      }
    }
  } catch (e) {
    console.error('Sync failed:', e)
    throw e
  } finally {
    syncing = false
  }
}
