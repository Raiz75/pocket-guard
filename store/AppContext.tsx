import { createContext, useContext, useReducer, ReactNode } from 'react'
import { Transaction, Category } from '../types'
import { DEFAULT_CATEGORIES } from '../constants/Categories'

interface AppState {
  transactions: Transaction[]
  categories: Category[]
}

type Action =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'ADD_CATEGORY'; payload: Category }

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] }
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] }
    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    transactions: [],
    categories: DEFAULT_CATEGORIES,
  })

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')

  const { state, dispatch } = ctx

  const monthlyTransactions = state.transactions.filter((t) => {
    const now = new Date()
    const d = new Date(t.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === 'inflow')
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyExpenses = monthlyTransactions
    .filter((t) => t.type === 'outflow')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = state.transactions.reduce((sum, t) => {
    return t.type === 'inflow' ? sum + t.amount : sum - t.amount
  }, 0)

  const addTransaction = (t: Omit<Transaction, 'id' | 'date'>) => {
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: { ...t, id: Date.now().toString(), date: new Date() },
    })
  }

  const addCategory = (c: Category) => {
    dispatch({ type: 'ADD_CATEGORY', payload: c })
  }

  return {
    transactions: state.transactions,
    categories: state.categories,
    balance,
    monthlyIncome,
    monthlyExpenses,
    addTransaction,
    addCategory,
  }
}
