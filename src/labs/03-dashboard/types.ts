/**
 * before / after / store の3バリアントが共有する「変更しない型と計算」。
 * 見た目のあるコンポーネントは共有せず、各バリアントに複製する。
 */

import type { Category } from '../../data/products'
import type { SalesRow } from './data'

export type Theme = 'light' | 'contrast'
export type PeriodId = '7d' | '30d' | '90d' | 'ytd'
export type SortKey = 'name' | 'revenue' | 'orders' | 'conversion' | 'growth'

export interface SortState {
  key: SortKey
  desc: boolean
}

/** フィルタ条件は7つ。before ではこれが7つの独立した useState に散っている（4-8） */
export interface Filters {
  keyword: string
  category: Category | 'all'
  owner: string
  period: PeriodId
  comparePeriod: PeriodId
  minRevenue: number
  sort: SortState
}

export const DEFAULT_FILTERS: Filters = {
  keyword: '',
  category: 'all',
  owner: 'all',
  period: '30d',
  comparePeriod: '30d',
  minRevenue: 0,
  sort: { key: 'revenue', desc: true },
}

export const PERIODS: { id: PeriodId; label: string }[] = [
  { id: '7d', label: '直近7日' },
  { id: '30d', label: '直近30日' },
  { id: '90d', label: '直近90日' },
  { id: 'ytd', label: '年初来' },
]

export const SORT_COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'name', label: '商品' },
  { key: 'revenue', label: '売上' },
  { key: 'orders', label: '受注' },
  { key: 'conversion', label: '転換率' },
  { key: 'growth', label: '前期比' },
]

export function periodLabel(id: PeriodId): string {
  return PERIODS.find((item) => item.id === id)?.label ?? id
}

function compare(a: SalesRow, b: SalesRow, key: SortKey): number {
  if (key === 'name') return a.name.localeCompare(b.name)
  return a[key] - b[key]
}

/** 絞り込みと並べ替え。入力配列は破棄的に変更しない（slice してから sort する） */
export function applyFilters(rows: SalesRow[], filters: Filters): SalesRow[] {
  const keyword = filters.keyword.trim().toLowerCase()

  const filtered = rows.filter((row) => {
    if (filters.category !== 'all' && row.category !== filters.category) return false
    if (filters.owner !== 'all' && row.owner !== filters.owner) return false
    if (row.revenue < filters.minRevenue) return false
    if (keyword && !row.name.toLowerCase().includes(keyword) && !row.sku.toLowerCase().includes(keyword)) {
      return false
    }
    return true
  })

  const sorted = filtered.slice().sort((a, b) => compare(a, b, filters.sort.key))
  return filters.sort.desc ? sorted.reverse() : sorted
}

export interface Kpi {
  id: string
  label: string
  value: string
  detail: string
}

export function formatYen(value: number): string {
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(2)} 億円`
  if (value >= 10_000) return `${Math.round(value / 10_000).toLocaleString()} 万円`
  return `${value.toLocaleString()} 円`
}

/** KPI 4枚の中身。before では useState + useEffect で同期しているが、本来は計算で導ける（4-7） */
export function computeKpis(rows: SalesRow[], filters: Filters): Kpi[] {
  const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0)
  const totalOrders = rows.reduce((sum, row) => sum + row.orders, 0)
  const avgConversion = rows.length === 0 ? 0 : rows.reduce((s, r) => s + r.conversion, 0) / rows.length
  const growing = rows.filter((row) => row.growth > 0).length

  return [
    {
      id: 'revenue',
      label: '売上合計',
      value: formatYen(totalRevenue),
      detail: `対象 ${periodLabel(filters.period)} / 比較 ${periodLabel(filters.comparePeriod)}`,
    },
    {
      id: 'orders',
      label: '受注件数',
      value: `${totalOrders.toLocaleString()} 件`,
      detail: `平均単価 ${formatYen(totalOrders === 0 ? 0 : Math.round(totalRevenue / totalOrders))}`,
    },
    {
      id: 'conversion',
      label: '平均転換率',
      value: `${avgConversion.toFixed(2)} %`,
      detail: `対象 ${rows.length.toLocaleString()} 商品`,
    },
    {
      id: 'growth',
      label: '前期比プラス',
      value: `${growing.toLocaleString()} 商品`,
      detail: `全体の ${rows.length === 0 ? 0 : Math.round((growing / rows.length) * 100)} %`,
    },
  ]
}
