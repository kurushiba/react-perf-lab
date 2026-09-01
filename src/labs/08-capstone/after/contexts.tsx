/**
 * before の CrmContext（21プロパティを1つに詰めたもの）を、関心事ごとに4つへ分け、
 * さらにそれぞれを「値用」と「更新用」に分けたもの（8-4 ／ Sec.4 の応用）。
 *
 * Context は「値が変われば購読者は全員再描画する」仕組みなので、
 * React Compiler が value をメモ化してくれても、同じ Context に
 * 別々に変わるものを入れていれば巻き添えは消えない。効くのは購読の粒度を細かくすること。
 *
 * ★ 検索結果（rows）は Context に載せていない。フィルタから導ける値なので、
 *   必要な場所で計算する（before は Context に載せていたため、行が丸ごと巻き込まれていた）。
 */

import {
  createContext,
  useContext,
  useState,
  useTransition,
  type Context,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import type { Industry, Owner, Stage } from '../../../data/deals'
import {
  CRM_USER,
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  type CrmUser,
  type Filters,
  type SortState,
  type Theme,
} from '../types'

interface UserValue {
  user: CrmUser
  theme: Theme
}

interface FilterValue {
  filters: Filters
  sort: SortState
}

interface FilterActions {
  setQuery: (value: string) => void
  setStage: (value: Stage | 'all') => void
  setOwner: (value: Owner | 'all') => void
  setIndustry: (value: Industry | 'all') => void
  setSort: (next: SortState) => void
}

interface SelectionActions {
  toggleSelected: (id: string) => void
  clearSelected: () => void
}

const UserContext = createContext<UserValue | null>(null)
const UserActionsContext = createContext<{ setTheme: Dispatch<SetStateAction<Theme>> } | null>(null)
const FilterContext = createContext<FilterValue | null>(null)
const FilterActionsContext = createContext<FilterActions | null>(null)
/**
 * 検索語の反映が低優先度で走っている最中かどうか（8-6）。
 * FilterContext に混ぜると、並び順しか見ていない DealList まで
 * pending が切り替わるたびに巻き添えで再描画される。
 */
const SearchPendingContext = createContext<boolean | null>(null)
const SelectionContext = createContext<Record<string, boolean> | null>(null)
const SelectionActionsContext = createContext<SelectionActions | null>(null)
const DrawerContext = createContext<string | null | undefined>(undefined)
const DrawerActionsContext = createContext<((id: string | null) => void) | null>(null)

function useRequired<T>(context: Context<T | null>, name: string): T {
  const value = useContext(context)
  if (value === null) throw new Error(`${name} の Provider が見つかりません`)
  return value
}

export const useUser = () => useRequired(UserContext, 'UserContext')
export const useUserActions = () => useRequired(UserActionsContext, 'UserActionsContext')
export const useFilterValue = () => useRequired(FilterContext, 'FilterContext')
export const useFilterActions = () => useRequired(FilterActionsContext, 'FilterActionsContext')
export const useSearchPending = () => useRequired(SearchPendingContext, 'SearchPendingContext')
export const useSelection = () => useRequired(SelectionContext, 'SelectionContext')
export const useSelectionActions = () => useRequired(SelectionActionsContext, 'SelectionActionsContext')
export const useDrawerActions = () => useRequired(DrawerActionsContext, 'DrawerActionsContext')

export function useOpenDealId(): string | null {
  const value = useContext(DrawerContext)
  if (value === undefined) throw new Error('DrawerContext の Provider が見つかりません')
  return value
}

export function CrmProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [query, setQueryState] = useState(DEFAULT_FILTERS.query)
  const [stage, setStage] = useState<Stage | 'all'>(DEFAULT_FILTERS.stage)
  const [owner, setOwner] = useState<Owner | 'all'>(DEFAULT_FILTERS.owner)
  const [industry, setIndustry] = useState<Industry | 'all'>(DEFAULT_FILTERS.industry)
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [openDealId, setOpenDealId] = useState<string | null>(null)

  // 検索語の反映だけを低優先度に落とす（8-6）。searchDeals の走査は中断できるようになるが、
  // 走査そのものが軽くなるわけではない。入力欄の文字は FilterBar のローカル state で
  // 緊急更新のまま出しているので、ここが遅れても打鍵の見た目は一切遅れない
  const [isSearchPending, startTransition] = useTransition()
  const setQuery = (value: string) => startTransition(() => setQueryState(value))

  // 中身は setState か、それを包んだだけの関数なので、更新用の値は参照が一度も変わらない
  const filterActions: FilterActions = { setQuery, setStage, setOwner, setIndustry, setSort }
  const selectionActions: SelectionActions = {
    toggleSelected: (id) => setSelected((prev) => ({ ...prev, [id]: !prev[id] })),
    clearSelected: () => setSelected({}),
  }

  return (
    <UserActionsContext.Provider value={{ setTheme }}>
      <FilterActionsContext.Provider value={filterActions}>
        <SelectionActionsContext.Provider value={selectionActions}>
          <DrawerActionsContext.Provider value={setOpenDealId}>
            <UserContext.Provider value={{ user: CRM_USER, theme }}>
              <FilterContext.Provider value={{ filters: { query, stage, owner, industry }, sort }}>
                <SearchPendingContext.Provider value={isSearchPending}>
                  <SelectionContext.Provider value={selected}>
                    <DrawerContext.Provider value={openDealId}>{children}</DrawerContext.Provider>
                  </SelectionContext.Provider>
                </SearchPendingContext.Provider>
              </FilterContext.Provider>
            </UserContext.Provider>
          </DrawerActionsContext.Provider>
        </SelectionActionsContext.Provider>
      </FilterActionsContext.Provider>
    </UserActionsContext.Provider>
  )
}
