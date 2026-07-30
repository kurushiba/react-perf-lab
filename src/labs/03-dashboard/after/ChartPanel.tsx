import { CATEGORIES, CATEGORY_LABELS } from '../../../data/products'
import { dailySeries } from '../data'
import { formatYen } from '../types'
import { useFilterValue, useUser } from './contexts'

export default function ChartPanel() {
  console.log('[render] ChartPanel')

  // フィルタとテーマの両方を使うので、この2つの Context を購読する。
  // 通知が増えてもここは動かない（before は同じ Context だったので動いていた）
  const { rows } = useFilterValue()
  const { theme } = useUser()

  const byCategory = CATEGORIES.map((category) => ({
    category,
    revenue: rows.filter((row) => row.category === category).reduce((sum, row) => sum + row.revenue, 0),
  }))
  const maxCategory = Math.max(1, ...byCategory.map((item) => item.revenue))
  const maxDaily = Math.max(1, ...dailySeries.map((point) => point.revenue))
  const barColor = theme === 'contrast' ? '#172b4d' : 'var(--accent)'

  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <h3>カテゴリ別の売上</h3>
      <div style={{ display: 'grid', gap: 4, marginBottom: 16 }}>
        {byCategory.map((item) => (
          <div key={item.category} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 84 }}>{CATEGORY_LABELS[item.category]}</span>
            <span
              className="bar"
              style={{ width: `${(item.revenue / maxCategory) * 60}%`, background: barColor }}
            />
            <span className="muted">{formatYen(item.revenue)}</span>
          </div>
        ))}
      </div>

      <h3>直近30日の推移</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80 }}>
        {dailySeries.map((point) => (
          <span
            key={point.label}
            title={`${point.label} ${formatYen(point.revenue)}`}
            style={{
              flex: 1,
              height: `${(point.revenue / maxDaily) * 100}%`,
              background: barColor,
              borderRadius: '3px 3px 0 0',
            }}
          />
        ))}
      </div>
    </div>
  )
}
