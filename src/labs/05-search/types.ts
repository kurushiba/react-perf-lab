import type { Category, Product } from '../../data/products'

export type PriceBandId = 'all' | 'low' | 'mid' | 'high'
export type StockId = 'all' | 'in' | 'out'
export type TabId = 'results' | 'stats' | 'history'

export interface Filters {
  category: Category | 'all'
  priceBand: PriceBandId
  stock: StockId
}

export const DEFAULT_FILTERS: Filters = { category: 'all', priceBand: 'all', stock: 'all' }

export const PRICE_BANDS: { id: PriceBandId; label: string; min: number; max: number }[] = [
  { id: 'all', label: 'すべて', min: 0, max: Number.MAX_SAFE_INTEGER },
  { id: 'low', label: '〜5,000円', min: 0, max: 5_000 },
  { id: 'mid', label: '5,000〜20,000円', min: 5_000, max: 20_000 },
  { id: 'high', label: '20,000円〜', min: 20_000, max: Number.MAX_SAFE_INTEGER },
]

export const STOCK_OPTIONS: { id: StockId; label: string }[] = [
  { id: 'all', label: 'すべて' },
  { id: 'in', label: '在庫あり' },
  { id: 'out', label: '在庫切れ' },
]

export const TABS: { id: TabId; label: string }[] = [
  { id: 'results', label: '一覧' },
  { id: 'stats', label: '統計' },
  { id: 'history', label: '履歴' },
]

export function matchesFilters(product: Product, filters: Filters): boolean {
  if (filters.category !== 'all' && product.category !== filters.category) return false
  if (filters.stock === 'in' && product.stock === 0) return false
  if (filters.stock === 'out' && product.stock > 0) return false
  const band = PRICE_BANDS.find((item) => item.id === filters.priceBand)
  if (band && (product.price < band.min || product.price >= band.max)) return false
  return true
}
