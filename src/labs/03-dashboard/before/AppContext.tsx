import { createContext, useContext } from 'react'
import type { Category } from '../../../data/products'
import type { SalesRow } from '../data'
import type { Filters, Kpi, PeriodId, SortKey, Theme } from '../types'

export interface DashboardUser {
  name: string
  role: string
  team: string
}

export interface AppContextValue {
  user: DashboardUser
  theme: Theme
  setTheme: (theme: Theme) => void
  filters: Filters
  rows: SalesRow[]
  kpis: Kpi[]
  setKeyword: (value: string) => void
  setCategory: (value: Category | 'all') => void
  setOwner: (value: string) => void
  setPeriod: (value: PeriodId) => void
  setComparePeriod: (value: PeriodId) => void
  setMinRevenue: (value: number) => void
  toggleSort: (key: SortKey) => void
  unreadCount: number
  addNotification: () => void
  markAllRead: () => void
  expanded: Record<string, boolean>
  toggleExpanded: (id: string) => void
  selected: Record<string, boolean>
  toggleSelected: (id: string) => void
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useAppContext(): AppContextValue {
  const value = useContext(AppContext)
  if (value === null) throw new Error('AppContext.Provider の外側で使われています')
  return value
}
