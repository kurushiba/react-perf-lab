import { useAppContext } from './AppContext'
import KpiCard from './KpiCard'

export default function KpiRow() {
  console.log('[render] KpiRow')

  const { kpis, expanded, toggleExpanded } = useAppContext()

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
        <KpiCard key={kpi.id} kpi={kpi} expanded={expanded} onToggle={toggleExpanded} />
      ))}
    </div>
  )
}
