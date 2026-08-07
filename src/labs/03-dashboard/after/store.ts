/**
 * 03-dashboard / after — 4-6 で6つに分けた Context を、Zustand のストア1つに置き換えたもの（4-7）。
 *
 * Context は「どの Context を購読するか」でしか粒度を選べない。粒度を細かくしたければ
 * Context を増やすしかなく、4-6 では6つの Context と6段の Provider になった。
 * セレクタは「ストアのどの値を取り出すか」で粒度を決められるので、
 * ストアは1つのまま、購読する側が必要な分だけを選べる。Provider も要らない。
 *
 * ⚠️ 導出値（rows / kpis）はここに置かない。セレクタは「返した値が前回と変わったか」で
 *    判定するので、毎回新しい配列やオブジェクトを作って返すセレクタは常に「変わった」ことになる。
 *    導出値は state を選んでから購読側で計算する。
 */

import { create } from 'zustand'
import type { Category } from '../../../data/products'
import {
  DEFAULT_FILTERS,
  type Filters,
  type PeriodId,
  type SortKey,
  type Theme,
} from '../types'

export interface DashboardUser {
  name: string
  role: string
  team: string
}

// 値と更新関数を分ける必要はない。Context のときは参照の変化を避けるために
// UserValue / UserActions … と型ごと分けていたが、セレクタなら1つの型に同居させてよい
interface DashboardStore {
  user: DashboardUser
  theme: Theme
  unreadCount: number
  filters: Filters

  setTheme: (theme: Theme) => void
  addNotification: () => void
  markAllRead: () => void

  setKeyword: (value: string) => void
  setCategory: (value: Category | 'all') => void
  setOwner: (value: string) => void
  setPeriod: (value: PeriodId) => void
  setComparePeriod: (value: PeriodId) => void
  setMinRevenue: (value: number) => void
  toggleSort: (key: SortKey) => void
}

const USER: DashboardUser = { name: 'Shiba Taro', role: '営業企画', team: 'Analytics' }

export const useDashboardStore = create<DashboardStore>()((set) => ({
  user: USER,
  theme: 'light',
  unreadCount: 12,
  filters: DEFAULT_FILTERS,

  setTheme: (theme) => set({ theme }),
  addNotification: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  markAllRead: () => set({ unreadCount: 0 }),

  setKeyword: (value) => set((state) => ({ filters: { ...state.filters, keyword: value } })),
  setCategory: (value) => set((state) => ({ filters: { ...state.filters, category: value } })),
  setOwner: (value) => set((state) => ({ filters: { ...state.filters, owner: value } })),
  setPeriod: (value) => set((state) => ({ filters: { ...state.filters, period: value } })),
  setComparePeriod: (value) =>
    set((state) => ({ filters: { ...state.filters, comparePeriod: value } })),
  setMinRevenue: (value) => set((state) => ({ filters: { ...state.filters, minRevenue: value } })),
  toggleSort: (key) =>
    set((state) => ({
      filters: {
        ...state.filters,
        sort:
          state.filters.sort.key === key
            ? { key, desc: !state.filters.sort.desc }
            : { key, desc: true },
      },
    })),
}))
