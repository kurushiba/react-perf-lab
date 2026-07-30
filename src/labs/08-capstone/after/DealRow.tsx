import { STAGE_LABELS, type Deal } from '../../../data/deals'
import { formatRelative, formatYen } from '../types'

interface DealRowProps {
  deal: Deal
  isSelected: boolean
  /** 基準時刻は親から受け取る。レンダー中に Date.now() を呼ばない（10-3） */
  now: number
  onToggle: (id: string) => void
  onOpen: (id: string) => void
}

/**
 * Context を購読せず、必要なものだけを props で受け取る。
 * props が変わらない行は Compiler が丸ごと止めてくれるので、
 * 1つチェックを入れても再描画されるのはその行だけになる。
 */
export default function DealRow({ deal, isSelected, now, onToggle, onOpen }: DealRowProps) {
  return (
    <div className="row" style={{ background: isSelected ? 'var(--accent-weak)' : undefined }}>
      <input type="checkbox" checked={isSelected} onChange={() => onToggle(deal.id)} />
      <span className="row__main">
        <button
          className="row__name"
          onClick={() => onOpen(deal.id)}
          style={{
            all: 'unset',
            cursor: 'pointer',
            display: 'block',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            color: 'inherit',
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
        {formatRelative(deal.updatedAt, now)}
      </span>
    </div>
  )
}
