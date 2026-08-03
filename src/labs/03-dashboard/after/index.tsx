/**
 * 03-dashboard / after — before と同じ画面を、設計だけで作り直した版。
 *
 * メモ化（memo / useMemo / useCallback）は1つも足していない。
 * 変えたのは state の置き場所と、Context の分け方と、children の渡し方だけ（Sec.4）。
 *
 * 1. state を下げる          … KpiCard.tsx
 * 2. children as props       … FilterPanel.tsx と、このファイルの渡し方
 * 3. Context 3分割＋値/更新分離 … contexts.tsx
 * 4. 導出値は計算で導く       … contexts.tsx（before の useDashboardState.ts が消えた）
 * 5. useReducer に統合        … filtersReducer.ts
 * 6. 安定した id を key に     … TableRows.tsx
 */
import { RenderCountPanel, Region } from '../RenderCountPanel'
import ChartPanel from './ChartPanel'
import { DashboardProvider, useUser } from './contexts'
import FilterPanel from './FilterPanel'
import Header from './Header'
import KpiRow from './KpiRow'
import TableRows from './TableRows'

// ダッシュボード本体を組み立てるのは Provider の直下。
// FilterPanel はこの JSX を children として受け取るだけなので、
// パネル内の入力途中の state はここまで波及しない（4-3）
function DashboardBody() {
  return (
    <FilterPanel>
      <Region name="KPI">
        <KpiRow />
      </Region>

      <Region name="チャート">
        <ChartPanel />
      </Region>

      <Region name="テーブル">
        <TableRows />
      </Region>
    </FilterPanel>
  )
}

// テーマの購読をこの小さなコンポーネントに閉じ込める。
// before はページ全体が Context の購読者だったので、テーマ切替で全部が動いていた
function ThemedPage({ children }: { children: React.ReactNode }) {
  const { theme } = useUser()

  return (
    <div
      className="page"
      style={{ maxWidth: 1120, background: theme === 'contrast' ? '#e9ebef' : undefined }}
    >
      {children}
    </div>
  )
}

export default function DashboardAfter() {
  return (
    <DashboardProvider>
      <ThemedPage>
        <h1>Shiba Analytics（after）</h1>
        <p className="lead">
          メモ化は1つも足していない。state の置き場所と Context の分け方だけで、再描画の範囲を必要な場所に絞った。
        </p>

        <RenderCountPanel hint="「リセットして計測」を押してから同じ操作をして、before と領域数を比べる" />

        <Region name="ヘッダー">
          <Header />
        </Region>

        <DashboardBody />
      </ThemedPage>
    </DashboardProvider>
  )
}
