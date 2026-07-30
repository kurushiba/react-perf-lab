import { useState } from 'react'
import type { Industry, Owner, Stage } from '../../../data/deals'
import { searchDeals } from '../searchDeals'
import {
  compareDeals,
  CRM_USER,
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  type Filters,
  type SortState,
  type Theme,
} from '../types'
import type { CrmContextValue } from './CrmContext'

export function useCrmState(): CrmContextValue {
  const [query, setQuery] = useState(DEFAULT_FILTERS.query)
  const [stage, setStage] = useState<Stage | 'all'>(DEFAULT_FILTERS.stage)
  const [owner, setOwner] = useState<Owner | 'all'>(DEFAULT_FILTERS.owner)
  const [industry, setIndustry] = useState<Industry | 'all'>(DEFAULT_FILTERS.industry)
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT)

  const [theme, setTheme] = useState<Theme>('light')
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [openDealId, setOpenDealId] = useState<string | null>(null)

  const filters: Filters = { query, stage, owner, industry }
  const rows = searchDeals(filters).sort((a, b) => compareDeals(a, b, sort.key))

  return {
    user: CRM_USER,
    theme,
    setTheme,
    filters,
    setQuery,
    setStage,
    setOwner,
    setIndustry,
    sort,
    setSort,
    rows,
    selected,
    toggleSelected: (id: string) => setSelected((prev) => ({ ...prev, [id]: !prev[id] })),
    clearSelected: () => setSelected({}),
    openDealId,
    setOpenDealId,
  }
}
