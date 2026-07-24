import { supabase } from './supabase'
import { getPendingTransactions, markTransactionSynced, upsertTransaction } from '../db/transactions'
import { getPendingCategories, markCategorySynced, upsertCategory } from '../db/categories'

export async function syncAll(userId: string): Promise<void> {
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
