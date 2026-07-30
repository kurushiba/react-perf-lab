import { renderBarChart, renderLineChart, type ChartSeries } from '../../../vendor/shiba-charts'

interface ChartPanelProps {
  series: ChartSeries[]
  kind?: 'line' | 'bar'
  palette?: string
}

export default function ChartPanel({ series, kind = 'line', palette = 'mubgeo0' }: ChartPanelProps) {
  const svg =
    kind === 'bar'
      ? renderBarChart(series, { palette, height: 220 })
      : renderLineChart(series, { palette, height: 220 })

  return (
    <div className="panel">
      <h3>{kind === 'bar' ? '月次の出荷数' : '週次の売上推移'}</h3>
      <div dangerouslySetInnerHTML={{ __html: svg }} />
      <div className="toolbar" style={{ marginTop: 8 }}>
        {series.map((item) => (
          <span key={item.label} className="badge">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
