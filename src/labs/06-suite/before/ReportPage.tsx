import { buildSeries } from '../data'
import ChartPanel from './ChartPanel'

const SERIES = buildSeries()

export default function ReportPage() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <ChartPanel series={SERIES} kind="line" palette="mubgeo0" />
      <ChartPanel series={SERIES.slice(0, 2)} kind="bar" palette="clyra2" />
    </div>
  )
}
