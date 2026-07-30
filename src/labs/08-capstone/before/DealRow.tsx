import { STAGE_LABELS, type Deal } from '../../../data/deals'
import { formatRelative, formatYen } from '../types'
import { useCrm } from './CrmContext'

interface DealRowProps {
  deal: Deal
}

/** 相対時刻の基準。行をまたいで使い回せるようにモジュール側に置いてある */
let currentTime = Date.now()

/** 1行あたり10要素ノード。5,000行で約5万ノードになる */
export default function DealRow({ deal }: DealRowProps) {
  const { selected, toggleSelected, setOpenDealId, theme } = useCrm()

  currentTime = Date.now()
  const isSelected = selected[deal.id] === true

  return (
    <div
      className="row"
      style={{ background: isSelected ? 'var(--accent-weak)' : undefined }}
    >
      <input type="checkbox" checked={isSelected} onChange={() => toggleSelected(deal.id)} />
      <span className="row__main">
        <button
          className="row__name"
          onClick={() => setOpenDealId(deal.id)}
          style={{
            all: 'unset',
            cursor: 'pointer',
            display: 'block',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            color: theme === 'contrast' ? '#000' : 'var(--text)',
          }}
        >
          {deal.name}
        </button>
        <span className="row__sub">
          {deal.accountName} · {deal.industry}
        </span>
      </span>
      <span className="badge">{STAGE_LABELS[deal.stage]}</span>
      <span className="row__sub" style={{ width: 110 }}>
        {deal.owner}
      </span>
      <span className="row__num">{formatYen(deal.amount)}</span>
      <span className="row__num" style={{ width: 56 }}>
        {deal.probability}%
      </span>
      <span className="row__sub" style={{ width: 68, textAlign: 'right' }}>
        {formatRelative(deal.updatedAt, currentTime)}
      </span>
    </div>
  )
}
