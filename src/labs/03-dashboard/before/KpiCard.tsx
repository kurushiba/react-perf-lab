import type { Kpi } from '../types'

interface KpiCardProps {
  kpi: Kpi
  expanded: Record<string, boolean>
  onToggle: (id: string) => void
}

export default function KpiCard({ kpi, expanded, onToggle }: KpiCardProps) {
  console.log('[render] KpiCard', kpi.id)

  const open = Boolean(expanded[kpi.id])

  return (
    <div className="panel">
      <div className="metrics__label">{kpi.label}</div>
      <div className="metrics__value">{kpi.value}</div>

      <div className="toolbar" style={{ marginTop: 8 }}>
        <button className="button" onClick={() => onToggle(kpi.id)}>
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
