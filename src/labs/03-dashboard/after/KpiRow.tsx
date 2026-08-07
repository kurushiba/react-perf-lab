import { salesRows } from '../data'
import { applyFilters, computeKpis } from '../types'
import KpiCard from './KpiCard'
import { useDashboardStore } from './store'

// 配列を props で受け取ってから .map() する形にしておくと、
// React Compiler が一覧そのものをキャッシュできる（2-6 と同じ理由）
export default function KpiRow() {
  console.log('[render] KpiRow')

  // 選ぶのは filters だけ。theme や unreadCount が変わってもここは再描画されない。
  // kpis は filters から導ける値なので、セレクタの外で計算する
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
