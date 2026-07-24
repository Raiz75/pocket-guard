export type TransactionType = 'inflow' | 'outflow'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  note: string
  date: Date
}

export interface Category {
  id: string
  name: string
  type: TransactionType
}
