import { useFilterValue } from './contexts'
import KpiCard from './KpiCard'

// 配列を props で受け取ってから .map() する形にしておくと、
// React Compiler が一覧そのものをキャッシュできる（2-6 と同じ理由）
export default function KpiRow() {
  console.log('[render] KpiRow')

  const { kpis } = useFilterValue()

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
