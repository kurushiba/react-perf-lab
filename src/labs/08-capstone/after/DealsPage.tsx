import DealDrawer from './DealDrawer'
import DealResults from './DealResults'
import FilterBar from './FilterBar'
import SortBar from './SortBar'
import { useDrawerActions, useFilterValue, useOpenDealId, useSearchPending } from './contexts'

export default function DealsPage() {
  const { filters } = useFilterValue()
  const openDealId = useOpenDealId()
  const setOpenDealId = useDrawerActions()

  // 入力欄の更新は即座に、重い一覧の作り直しは後回しにする（8-6）。
  // 後回しにしている最中かどうかは Context から受け取る
  const isSearchPending = useSearchPending()

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <FilterBar />
      <SortBar />

      {openDealId ? (
        <DealDrawer dealId={openDealId} onClose={() => setOpenDealId(null)} />
      ) : null}

      {/* 「古い結果を薄く見せる」のは外側でやる。isSearchPending を DealResults の props に
          混ぜると打鍵のたびに props が変わり、後回しにしたはずの走査が緊急更新でも走ってしまう */}
      <div style={{ opacity: isSearchPending ? 0.6 : 1 }}>
        <DealResults
          query={filters.query}
          stage={filters.stage}
          owner={filters.owner}
          industry={filters.industry}
        />
      </div>
    </div>
  )
}
