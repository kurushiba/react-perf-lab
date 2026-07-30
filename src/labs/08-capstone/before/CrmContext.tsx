import { createContext, useContext } from 'react'
import type { Deal, Industry, Owner, Stage } from '../../../data/deals'
import type { CrmUser, Filters, SortState, Theme } from '../types'

export interface CrmContextValue {
  user: CrmUser
  theme: Theme
  setTheme: (theme: Theme) => void

  filters: Filters
  setQuery: (value: string) => void
  setStage: (value: Stage | 'all') => void
  setOwner: (value: Owner | 'all') => void
  setIndustry: (value: Industry | 'all') => void

  sort: SortState
  setSort: (next: SortState) => void

  /** 検索・フィルタ・並べ替えを通した結果 */
  rows: Deal[]

  selected: Record<string, boolean>
  toggleSelected: (id: string) => void
  clearSelected: () => void

  openDealId: string | null
  setOpenDealId: (id: string | null) => void
}

export const CrmContext = createContext<CrmContextValue | null>(null)

export function useCrm(): CrmContextValue {
  const value = useContext(CrmContext)
  if (value === null) throw new Error('CrmContext の Provider が見つかりません')
  return value
}
