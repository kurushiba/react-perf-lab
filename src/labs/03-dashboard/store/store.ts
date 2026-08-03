/**
 * 4-6 の比較用。after で Context を6つに分けて実現したことを、
 * 状態管理ライブラリなら「1つのストア＋セレクタ」で書けることを見せる。
 *
 * Context は「どの Context を購読するか」でしか粒度を選べない。
 * 粒度を細かくしたければ Context を増やすしかなく、after は6つになった。
 * セレクタは「ストアのどの値を取り出すか」で粒度を決められるので、
 * ストアは1つのまま、購読する側が必要な分だけを選べる。
 *
 * ⚠️ セレクタは「返した値が前回と変わったか」で判定する。
 *    毎回新しい配列やオブジェクトを作って返すセレクタは常に「変わった」ことになり、
 *    絞り込みの意味がなくなる。導出値は state を選んでから計算する。
 */

import { create } from 'zustand'
import type { Category } from '../../../data/products'
import { DEFAULT_FILTERS, type Filters, type PeriodId, type Theme } from '../types'

interface DashboardStore {
  theme: Theme
  unreadCount: number
  filters: Filters
  setTheme: (theme: Theme) => void
  addNotification: () => void
  markAllRead: () => void
  setCategory: (value: Category | 'all') => void
  setMinRevenue: (value: number) => void
  setPeriod: (value: PeriodId) => void
}

export const useDashboardStore = create<DashboardStore>()((set) => ({
  theme: 'light',
  unreadCount: 12,
  filters: DEFAULT_FILTERS,

  setTheme: (theme) => set({ theme }),
  addNotification: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  markAllRead: () => set({ unreadCount: 0 }),

  setCategory: (value) => set((state) => ({ filters: { ...state.filters, category: value } })),
  setMinRevenue: (value) => set((state) => ({ filters: { ...state.filters, minRevenue: value } })),
  // 期間と比較期間をまとめて更新する。after の reducer と同じ役割（4-8）
  setPeriod: (value) =>
    set((state) => ({ filters: { ...state.filters, period: value, comparePeriod: value } })),
}))
