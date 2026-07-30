import { RenderCountPanel, Region } from '../RenderCountPanel'
import { AppContext } from './AppContext'
import FilterPanel from './FilterPanel'
import Header from './Header'
import { useDashboardState } from './useDashboardState'

export default function DashboardBefore() {
  const state = useDashboardState()

  return (
    <div
      className="page"
      style={{ maxWidth: 1120, background: state.theme === 'contrast' ? '#e9ebef' : undefined }}
    >
      <h1>Shiba Analytics（before）</h1>
      <p className="lead">
        React Compiler は有効。それでもテーマを切り替えるだけ、KPIカードを1枚開くだけで画面全体が作り直される。
      </p>

      <RenderCountPanel hint="「リセットして計測」を押してから操作を1回だけ行い、どの領域がコミットしたかを見る" />

      <AppContext.Provider value={state}>
        <Region name="ヘッダー">
          <Header />
        </Region>

        <FilterPanel />
      </AppContext.Provider>
    </div>
  )
}
