import { useState } from 'react'
import { salesRows } from '../data'
import { applyFilters, computeKpis, type Kpi } from '../types'
import { useDashboardStore } from './store'

interface KpiCardProps {
  kpi: Kpi
}

// 展開状態はカード自身が持つ（4-2）。ストアに置く必要はない
function KpiCard({ kpi }: KpiCardProps) {
  console.log('[render] KpiCard', kpi.id)

  const [open, setOpen] = useState(false)

  return (
    <div className="panel">
      <div className="metrics__label">{kpi.label}</div>
      <div className="metrics__value">{kpi.value}</div>
      <div className="toolbar" style={{ marginTop: 8 }}>
        <button className="button" onClick={() => setOpen(!open)}>
          {open ? '閉じる' : '内訳'}
        </button>
      </div>
      {open ? (
        <p className="muted" style={{ margin: '8px 0 0' }}>
          {kpi.detail}
        </p>
      ) : null}
    </div>
  )
}

export default function KpiRow() {
  console.log('[render] KpiRow')

  // 選ぶのは filters だけ。theme や unreadCount が変わってもここは再描画されない。
  // after では同じことを「FilterContext を購読する」で実現していた
  const filters = useDashboardStore((state) => state.filters)
  const kpis = computeKpis(applyFilters(salesRows, filters), filters)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 12,
        marginBottom: 16,
      }}
    >
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  )
}
