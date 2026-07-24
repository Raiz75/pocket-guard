import { Category } from '../types'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'income-salary', name: 'Salary', type: 'inflow' },
  { id: 'income-freelance', name: 'Freelance', type: 'inflow' },
  { id: 'income-investments', name: 'Investments', type: 'inflow' },
  { id: 'income-gifts', name: 'Gifts', type: 'inflow' },
  { id: 'income-other', name: 'Other', type: 'inflow' },
  { id: 'expense-food', name: 'Food', type: 'outflow' },
  { id: 'expense-transport', name: 'Transport', type: 'outflow' },
  { id: 'expense-bills', name: 'Bills', type: 'outflow' },
  { id: 'expense-shopping', name: 'Shopping', type: 'outflow' },
  { id: 'expense-entertainment', name: 'Entertainment', type: 'outflow' },
  { id: 'expense-health', name: 'Health', type: 'outflow' },
  { id: 'expense-other', name: 'Other', type: 'outflow' },
]
