import { CATEGORIES, CATEGORY_LABELS } from '../../../data/products'
import { salesRows } from '../data'
import { applyFilters, PERIODS, type PeriodId } from '../types'
import { useDashboardStore } from './store'

export default function FilterBar() {
  console.log('[render] FilterBar')

  const filters = useDashboardStore((state) => state.filters)
  // 更新関数はストアの中で定義が変わらないので、選んでも参照は常に同じ。
  // after で「更新用 Context」を分けたのと同じ効果が、分割なしで得られる
  const setCategory = useDashboardStore((state) => state.setCategory)
  const setMinRevenue = useDashboardStore((state) => state.setMinRevenue)
  const setPeriod = useDashboardStore((state) => state.setPeriod)

  const matched = applyFilters(salesRows, filters).length

  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <div className="toolbar">
        <select
          value={filters.category}
          onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number] | 'all')}
        >
          <option value="all">カテゴリ：すべて</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>

        <select value={filters.period} onChange={(e) => setPeriod(e.target.value as PeriodId)}>
          {PERIODS.map((period) => (
            <option key={period.id} value={period.id}>
              対象：{period.label}
            </option>
          ))}
        </select>

        <label className="toolbar" style={{ gap: 4 }}>
          <span className="muted">売上下限</span>
          <input
            type="number"
            step={1_000_000}
            value={filters.minRevenue}
            style={{ width: 120 }}
            onChange={(e) => setMinRevenue(Number(e.target.value))}
          />
        </label>

        <span className="muted">
          該当 {matched.toLocaleString()} 件 / 比較 {filters.comparePeriod}
        </span>
      </div>
    </div>
  )
}
