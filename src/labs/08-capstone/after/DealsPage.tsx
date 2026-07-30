import { useDeferredValue } from 'react'
import DealDrawer from './DealDrawer'
import DealResults from './DealResults'
import FilterBar from './FilterBar'
import SortBar from './SortBar'
import { useDrawerActions, useFilterValue, useOpenDealId } from './contexts'

export default function DealsPage() {
  const { filters } = useFilterValue()
  const openDealId = useOpenDealId()
  const setOpenDealId = useDrawerActions()

  // 入力欄の更新は即座に、重い一覧の作り直しは後回しにする（10-6）
  const deferredQuery = useDeferredValue(filters.query)

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <FilterBar />
      <SortBar />

      {openDealId ? (
        <DealDrawer dealId={openDealId} onClose={() => setOpenDealId(null)} />
      ) : null}

      {/* 「古い結果を薄く見せる」のは外側でやる。DealResults の props に混ぜると
          打鍵のたびに props が変わり、後回しにしたはずの走査が緊急更新でも走ってしまう */}
      <div style={{ opacity: deferredQuery !== filters.query ? 0.6 : 1 }}>
        <DealResults
          query={deferredQuery}
          stage={filters.stage}
          owner={filters.owner}
          industry={filters.industry}
        />
      </div>
    </div>
  )
}
