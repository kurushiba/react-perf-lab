import type { Category } from '../../../data/products'
import type { Filters, PeriodId, SortKey } from '../types'

/**
 * before は7つの独立した useState だった。
 *
 * 分けて持っていると「期間を変えたら比較期間も合わせる」のような
 * 複数フィールドにまたがる不変条件を、更新のたびに手で書く必要がある。
 * 実際 before では `setPeriod` しか呼んでおらず、比較期間が取り残される（4-8）。
 *
 * 1つの reducer にまとめると、その不変条件は case の中に1度書けば済む。
 */

export type FilterAction =
  | { type: 'setKeyword'; value: string }
  | { type: 'setCategory'; value: Category | 'all' }
  | { type: 'setOwner'; value: string }
  | { type: 'setPeriod'; value: PeriodId }
  | { type: 'setComparePeriod'; value: PeriodId }
  | { type: 'setMinRevenue'; value: number }
  | { type: 'toggleSort'; key: SortKey }

export function filtersReducer(state: Filters, action: FilterAction): Filters {
  switch (action.type) {
    case 'setKeyword':
      return { ...state, keyword: action.value }
    case 'setCategory':
      return { ...state, category: action.value }
    case 'setOwner':
      return { ...state, owner: action.value }
    case 'setPeriod':
      // 対象期間を変えたら比較期間も同じ長さに合わせる。
      // この1行が before では抜けていて、KPI の「比較」表示だけ古いまま残っていた
      return { ...state, period: action.value, comparePeriod: action.value }
    case 'setComparePeriod':
      return { ...state, comparePeriod: action.value }
    case 'setMinRevenue':
      return { ...state, minRevenue: action.value }
    case 'toggleSort':
      return {
        ...state,
        sort:
          state.sort.key === action.key
            ? { key: action.key, desc: !state.sort.desc }
            : { key: action.key, desc: true },
      }
  }
}
