import { ACTIVITY_KIND_LABELS, activitiesByDeal, deals, STAGE_LABELS } from '../../../data/deals'
import { formatDay, formatYen } from '../types'

interface DealDrawerProps {
  dealId: string
  onClose: () => void
}

export default function DealDrawer({ dealId, onClose }: DealDrawerProps) {
  const deal = deals.find((item) => item.id === dealId)
  if (!deal) return null

  const activities = activitiesByDeal.get(deal.id) ?? []

  return (
    <div className="panel" style={{ borderColor: 'var(--accent)' }}>
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>{deal.name}</h3>
        <button className="button" onClick={onClose}>
          閉じる
        </button>
      </div>

      <div className="metrics" style={{ margin: '12px 0' }}>
        <div>
          <div className="metrics__value">{formatYen(deal.amount)}</div>
          <div className="metrics__label">金額</div>
        </div>
        <div>
          <div className="metrics__value">{deal.probability}%</div>
          <div className="metrics__label">確度</div>
        </div>
        <div>
          <div className="metrics__value">{STAGE_LABELS[deal.stage]}</div>
          <div className="metrics__label">ステージ</div>
        </div>
        <div>
          <div className="metrics__value">{formatDay(deal.closeDate)}</div>
          <div className="metrics__label">クローズ予定</div>
        </div>
        <div>
          <div className="metrics__value">{deal.activityCount}</div>
          <div className="metrics__label">活動件数</div>
        </div>
        <span className="muted">
          {deal.accountName} / {deal.owner}
        </span>
      </div>

      <table>
        <thead>
          <tr>
            <th style={{ width: 100 }}>日付</th>
            <th style={{ width: 80 }}>種別</th>
            <th>内容</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id}>
              <td>{formatDay(activity.createdAt)}</td>
              <td>
                <span className="badge">{ACTIVITY_KIND_LABELS[activity.kind]}</span>
              </td>
              <td>{activity.body}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
