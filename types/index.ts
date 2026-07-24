export type TransactionType = 'inflow' | 'outflow'

export type RecurringInterval = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  note: string
  date: Date
  recurring: RecurringInterval | null
}

export interface Category {
  id: string
  name: string
  type: TransactionType
}
