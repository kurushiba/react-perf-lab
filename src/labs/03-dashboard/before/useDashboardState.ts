import { useState } from 'react'
import type { Category } from '../../../data/products'
import { salesRows } from '../data'
import {
  applyFilters,
  computeKpis,
  DEFAULT_FILTERS,
  type Filters,
  type PeriodId,
  type SortKey,
  type SortState,
  type Theme,
} from '../types'

const USER = { name: 'Shiba Taro', role: '営業企画', team: 'Analytics' }

export function useDashboardState() {
  const [keyword, setKeyword] = useState(DEFAULT_FILTERS.keyword)
  const [category, setCategory] = useState<Category | 'all'>(DEFAULT_FILTERS.category)
  const [owner, setOwner] = useState(DEFAULT_FILTERS.owner)
  const [period, setPeriod] = useState<PeriodId>(DEFAULT_FILTERS.period)
  const [comparePeriod, setComparePeriod] = useState<PeriodId>(DEFAULT_FILTERS.comparePeriod)
  const [minRevenue, setMinRevenue] = useState(DEFAULT_FILTERS.minRevenue)
  const [sort, setSort] = useState<SortState>(DEFAULT_FILTERS.sort)

  const [theme, setTheme] = useState<Theme>('light')
  const [unreadCount, setUnreadCount] = useState(12)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [selected, setSelected] = useState<Record<number, boolean>>({})

  const filters: Filters = { keyword, category, owner, period, comparePeriod, minRevenue, sort }
  const rows = applyFilters(salesRows, filters)
  const kpis = computeKpis(rows, filters)

  const toggleSort = (key: SortKey) => {
    setSort((prev) => (prev.key === key ? { key, desc: !prev.desc } : { key, desc: true }))
  }

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleSelected = (id: number) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return {
    user: USER,
    theme,
    setTheme,
    filters,
    rows,
    kpis,
    setKeyword,
    setCategory,
    setOwner,
    setPeriod,
    setComparePeriod,
    setMinRevenue,
    toggleSort,
    unreadCount,
    addNotification: () => setUnreadCount((prev) => prev + 1),
    markAllRead: () => setUnreadCount(0),
    expanded,
    toggleExpanded,
    selected,
    toggleSelected,
  }
}
