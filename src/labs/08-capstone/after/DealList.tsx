import { useEffect, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Deal } from '../../../data/deals'
import { compareDeals } from '../types'
import { useDrawerActions, useFilterValue, useSelection, useSelectionActions } from './contexts'
import DealRow from './DealRow'

/** styles.css の `.row` と同じ値。ここがずれるとスクロールバーの長さが狂う */
const ROW_HEIGHT = 44

/** モジュール評価時（＝レンダー中ではない）に一度だけ読む */
const MOUNTED_AT = Date.now()

interface DealListProps {
  rows: Deal[]
}

export default function DealList({ rows }: DealListProps) {
  const { sort } = useFilterValue()
  const selected = useSelection()
  const { toggleSelected } = useSelectionActions()
  const setOpenDealId = useDrawerActions()

  // 相対時刻の基準。1分ごとに進めるが、レンダー中には現在時刻を読まない
  const [now, setNow] = useState(MOUNTED_AT)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const sorted = [...rows].sort((a, b) => compareDeals(a, b, sort.key))

  const scrollRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
    getItemKey: (index) => sorted[index].id,
  })

  return (
    <div className="list-scroll" ref={scrollRef}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <DealRow
              deal={sorted[virtualRow.index]}
              isSelected={selected[sorted[virtualRow.index].id] === true}
              now={now}
              onToggle={toggleSelected}
              onOpen={setOpenDealId}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
