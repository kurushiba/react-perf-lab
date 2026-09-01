/**
 * 08-capstone の型・定数・純粋関数。
 *
 * before と after で「変えないもの」だけをここに置く（見た目を持つコンポーネントは
 * 両方に複製する）。Sec.8 で受講者が直すのは構造であってこの計算ではない、
 * ということをファイルの置き場所でも示している。
 */
import { INDUSTRIES, OWNERS, STAGES, type Deal, type Industry, type Owner, type Stage } from '../../data/deals'

export type SortKey = 'updatedAt' | 'amount' | 'probability' | 'name'

/** 並び順は「オブジェクト1つ」で持つ。before はこれを書き換えてしまう */
export interface SortState {
  key: SortKey
}

export const DEFAULT_SORT: SortState = { key: 'updatedAt' }

export type Theme = 'light' | 'contrast'

export interface CrmUser {
  name: string
  role: string
  team: string
}

export const CRM_USER: CrmUser = { name: 'Shiba Taro', role: '営業', team: 'Enterprise West' }

export interface Filters {
  query: string
  stage: Stage | 'all'
  owner: Owner | 'all'
  industry: Industry | 'all'
}

export const DEFAULT_FILTERS: Filters = {
  query: '',
  stage: 'all',
  owner: 'all',
  industry: 'all',
}

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'updatedAt', label: '更新日' },
  { key: 'amount', label: '金額' },
  { key: 'probability', label: '確度' },
  { key: 'name', label: '案件名' },
]

export const STAGE_OPTIONS: (Stage | 'all')[] = ['all', ...STAGES]
export const OWNER_OPTIONS: (Owner | 'all')[] = ['all', ...OWNERS]
export const INDUSTRY_OPTIONS: (Industry | 'all')[] = ['all', ...INDUSTRIES]

export const NAV: { to: string; label: string }[] = [
  { to: 'deals', label: '案件一覧' },
  { to: 'report', label: 'レポート' },
  { to: 'activities', label: '活動履歴' },
  { to: 'settings', label: '設定' },
]

export function matchesFilters(deal: Deal, filters: Filters): boolean {
  if (filters.stage !== 'all' && deal.stage !== filters.stage) return false
  if (filters.owner !== 'all' && deal.owner !== filters.owner) return false
  if (filters.industry !== 'all' && deal.industry !== filters.industry) return false
  return true
}

export function compareDeals(a: Deal, b: Deal, key: SortKey): number {
  switch (key) {
    case 'amount':
      return b.amount - a.amount
    case 'probability':
      return b.probability - a.probability
    case 'name':
      return a.name.localeCompare(b.name)
    default:
      return b.updatedAt.localeCompare(a.updatedAt)
  }
}

export function formatYen(value: number): string {
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(2)}億円`
  if (value >= 10_000) return `${Math.round(value / 10_000).toLocaleString()}万円`
  return `${value.toLocaleString()}円`
}

/**
 * 「3日前に更新」の文字列を作る。
 * 現在時刻を引数で受け取る純粋関数にしてあるので、呼び出し側さえ間違えなければ
 * レンダー中に呼んでも安全（before はその呼び出し側を間違えている）。
 */
export function formatRelative(iso: string, now: number): string {
  const diff = now - Date.parse(iso)
  const days = Math.floor(diff / 86_400_000)
  if (days <= 0) return '今日'
  if (days === 1) return '昨日'
  if (days < 30) return `${days}日前`
  if (days < 365) return `${Math.floor(days / 30)}か月前`
  return `${Math.floor(days / 365)}年前`
}

export function formatDay(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, '/')
}
