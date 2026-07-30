import { renderBarChart, renderLineChart } from '../../../vendor/shiba-charts'
import { buildForecastSeries, buildStageSeries, FORECAST_MONTHS, STAGE_AXIS } from '../report-data'
import { useUser } from './contexts'

const STAGE_SERIES = buildStageSeries()
const FORECAST_SERIES = buildForecastSeries()

export default function ReportPage() {
  const { theme } = useUser()
  const palette = theme === 'contrast' ? 'clyra2' : 'mubgeo0'

  const stageSvg = renderBarChart(STAGE_SERIES, { palette, height: 220, labels: STAGE_AXIS })
  const forecastSvg = renderLineChart(FORECAST_SERIES, {
    palette,
    height: 220,
    labels: FORECAST_MONTHS,
  })

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="panel">
        <h3>ステージ別のパイプライン</h3>
        <div dangerouslySetInnerHTML={{ __html: stageSvg }} />
      </div>
      <div className="panel">
        <h3>クローズ予定月の着地見込み</h3>
        <div dangerouslySetInnerHTML={{ __html: forecastSvg }} />
        <div className="toolbar" style={{ marginTop: 8 }}>
          {FORECAST_SERIES.map((item) => (
            <span key={item.label} className="badge">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
