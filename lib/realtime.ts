import { supabase } from './supabase'
import { upsertTransaction, deleteTransaction } from '../db/transactions'
import { upsertCategory } from '../db/categories'

let channels: any[] = []

export function subscribeToChanges(userId: string, refresh: () => Promise<void>) {
  unsubscribe()

  const txChannel = supabase
    .channel('transactions-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, async (payload) => {
      if (payload.eventType === 'DELETE') {
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
      if (payload.eventType === 'DELETE') {
        const { deleteCategory } = await import('../db/categories')
        await deleteCategory(payload.old.id)
      } else {
        await upsertCategory(payload.new)
      }
      await refresh()
    })
    .subscribe()

  channels = [txChannel, catChannel]
}

export function unsubscribe() {
  channels.forEach((c) => supabase.removeChannel(c))
  channels = []
}
