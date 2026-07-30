/**
 * 03-dashboard / after — before の巨大な AppContext を、関心事ごとに3つへ分け、
 * さらにそれぞれを「値用」と「更新用」に分けたもの（5-5）。
 *
 * 分ける基準は「一緒に変わるかどうか」。テーマとフィルタは別々に変わるので、
 * 同じ Context に入れると片方の変更でもう片方の購読者まで巻き込む。
 *
 * 更新用の Context に入れるのは reducer の dispatch と、
 * state を関数形式で更新するだけのコールバックだけ。値に依存しないので
 * 参照が一度も変わらず、更新関数しか使わないコンポーネントは再描画されない。
 */

import {
  createContext,
  useContext,
  useReducer,
  useState,
  type Context,
  type Dispatch,
  type ReactNode,
} from 'react'
import { salesRows, type SalesRow } from '../data'
import { applyFilters, computeKpis, DEFAULT_FILTERS, type Filters, type Kpi, type Theme } from '../types'
import { filtersReducer, type FilterAction } from './filtersReducer'

export interface DashboardUser {
  name: string
  role: string
  team: string
}

interface UserValue {
  user: DashboardUser
  theme: Theme
}

interface UserActions {
  setTheme: (theme: Theme) => void
}

interface FilterValue {
  filters: Filters
  rows: SalesRow[]
  kpis: Kpi[]
}

interface NotificationActions {
  addNotification: () => void
  markAllRead: () => void
}

const USER: DashboardUser = { name: 'Shiba Taro', role: '営業企画', team: 'Analytics' }

const UserContext = createContext<UserValue | null>(null)
const UserActionsContext = createContext<UserActions | null>(null)
const FilterContext = createContext<FilterValue | null>(null)
const FilterActionsContext = createContext<Dispatch<FilterAction> | null>(null)
const UnreadCountContext = createContext<number | null>(null)
const NotificationActionsContext = createContext<NotificationActions | null>(null)

function useRequired<T>(context: Context<T | null>, name: string): T {
  const value = useContext(context)
  if (value === null) throw new Error(`${name} の Provider が見つかりません`)
  return value
}

export const useUser = () => useRequired(UserContext, 'UserContext')
export const useUserActions = () => useRequired(UserActionsContext, 'UserActionsContext')
export const useFilterValue = () => useRequired(FilterContext, 'FilterContext')
export const useFilterActions = () => useRequired(FilterActionsContext, 'FilterActionsContext')
export const useUnreadCount = () => useRequired(UnreadCountContext, 'UnreadCountContext')
export const useNotificationActions = () =>
  useRequired(NotificationActionsContext, 'NotificationActionsContext')

interface DashboardProviderProps {
  children: ReactNode
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [theme, setTheme] = useState<Theme>('light')
  const [unreadCount, setUnreadCount] = useState(12)

  // 7つの useState を1つの reducer に統合した（5-8）
  const [filters, dispatch] = useReducer(filtersReducer, DEFAULT_FILTERS)

  // before は useState + useEffect で同期していた。導出できる値は計算で導く（5-7）。
  // 依存を書き忘れようがないので、フィルタと KPI がずれることも起きない
  const rows = applyFilters(salesRows, filters)
  const kpis = computeKpis(rows, filters)

  // 関数形式の更新しか使っていないので、この2つは値に依存しない＝参照が変わらない
  const notificationActions = {
    addNotification: () => setUnreadCount((prev) => prev + 1),
    markAllRead: () => setUnreadCount(0),
  }

  return (
    <UserActionsContext.Provider value={{ setTheme }}>
      <FilterActionsContext.Provider value={dispatch}>
        <NotificationActionsContext.Provider value={notificationActions}>
          <UserContext.Provider value={{ user: USER, theme }}>
            <FilterContext.Provider value={{ filters, rows, kpis }}>
              <UnreadCountContext.Provider value={unreadCount}>{children}</UnreadCountContext.Provider>
            </FilterContext.Provider>
          </UserContext.Provider>
        </NotificationActionsContext.Provider>
      </FilterActionsContext.Provider>
    </UserActionsContext.Provider>
  )
}
