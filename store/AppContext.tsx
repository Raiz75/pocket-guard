import { createContext, useContext, useReducer, ReactNode } from 'react'
import { Transaction, Category } from '../types'
import { DEFAULT_CATEGORIES } from '../constants/Categories'

interface AppState {
  transactions: Transaction[]
  categories: Category[]
}

type Action =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] }
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      }
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      }
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

  const balance = state.transactions.reduce((sum, t) => {
    return t.type === 'inflow' ? sum + t.amount : sum - t.amount
  }, 0)

  const addTransaction = (t: Omit<Transaction, 'id' | 'date'>) => {
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: { ...t, id: Date.now().toString(), date: new Date() },
    })
  }

  const updateTransaction = (t: Transaction) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: t })
  }

  const deleteTransaction = (id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id })
  }

  const addCategory = (c: Category) => {
    dispatch({ type: 'ADD_CATEGORY', payload: c })
  }

  return {
    transactions: state.transactions,
    categories: state.categories,
    balance,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
  }
}
