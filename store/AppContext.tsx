import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { Transaction, Category } from '../types'
import { initDatabase } from '../db/database'
import { getAllTransactions, insertTransaction, updateTransaction, deleteTransaction } from '../db/transactions'
import { getAllCategories, insertCategory } from '../db/categories'
import { seedDefaultCategories } from '../db/seed'
import { syncAll } from '../lib/sync'
import { subscribeToChanges, unsubscribe } from '../lib/realtime'
import { useAuth } from './AuthContext'

interface AppContextValue {
  transactions: Transaction[]
  categories: Category[]
  balance: number
  loading: boolean
  addTransaction: (t: Omit<Transaction, 'id' | 'date'>) => void
  updateTransaction: (t: Transaction) => void
  deleteTransaction: (id: string) => void
  addCategory: (c: Category) => void
  refresh: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dbReady, setDbReady] = useState(false)
  const { user } = useAuth()
  const prevUserId = useRef(user?.id)

  const loadData = useCallback(async () => {
    await initDatabase()
    await seedDefaultCategories()
    const [txs, cats] = await Promise.all([getAllTransactions(), getAllCategories()])
    setTransactions(txs)
    setCategories(cats)
  }, [])

  useEffect(() => {
    loadData().finally(() => {
      setLoading(false)
      setDbReady(true)
    })
  }, [loadData])

  const refresh = useCallback(async () => {
    const [txs, cats] = await Promise.all([getAllTransactions(), getAllCategories()])
    setTransactions(txs)
    setCategories(cats)
  }, [])

  useEffect(() => {
    if (!dbReady) return
    const prev = prevUserId.current
    prevUserId.current = user?.id
    if (user?.id && !prev) {
      syncAll(user.id).then(() => refresh()).catch(() => {})
    }
  }, [user?.id, refresh, dbReady])

  useEffect(() => {
    if (user?.id) {
      subscribeToChanges(user.id, refresh)
    }
    return () => unsubscribe()
  }, [user?.id, refresh])

  const addTransactionFn = useCallback(async (t: Omit<Transaction, 'id' | 'date'>) => {
    const id = Date.now().toString()
    const dateStr = new Date().toISOString()
    const tx = { ...t, id, date: dateStr }
    await insertTransaction(tx as any)
    const newTx: Transaction = { ...t, id, date: new Date(dateStr) }
    setTransactions((prev) => [newTx, ...prev])
    if (user?.id) {
      syncAll(user.id).catch(() => {})
    }
  }, [user])

  const updateTransactionFn = useCallback(async (t: Transaction) => {
    await updateTransaction(t)
    setTransactions((prev) => prev.map((tx) => (tx.id === t.id ? t : tx)))
    if (user?.id) {
      syncAll(user.id).catch(() => {})
    }
  }, [user])

  const deleteTransactionFn = useCallback(async (id: string) => {
    await deleteTransaction(id)
    setTransactions((prev) => prev.filter((tx) => tx.id !== id))
    if (user?.id) {
      syncAll(user.id).catch(() => {})
    }
  }, [user])

  const addCategoryFn = useCallback(async (c: Category) => {
    await insertCategory(c)
    setCategories((prev) => [...prev, c])
    if (user?.id) {
      syncAll(user.id).catch(() => {})
    }
  }, [user])

  const balance = transactions.reduce((sum, t) => {
    return t.type === 'inflow' ? sum + t.amount : sum - t.amount
  }, 0)

  return (
    <AppContext.Provider value={{
      transactions,
      categories,
      balance,
      loading,
      addTransaction: addTransactionFn,
      updateTransaction: updateTransactionFn,
      deleteTransaction: deleteTransactionFn,
      addCategory: addCategoryFn,
      refresh,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
