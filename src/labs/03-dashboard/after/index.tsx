/**
 * 03-dashboard / after — before と同じ画面を、設計だけで作り直した版。
 *
 * メモ化（memo / useMemo / useCallback）は1つも足していない。
 * 変えたのは state の置き場所と、購読の粒度だけ（Sec.4）。
 *
 * 1. state を下げる          … KpiCard.tsx / TableRows.tsx
 * 2. ストア1つ＋セレクタ購読   … store.ts（4-6 の Context 6分割を 4-7 で置き換えた）
 * 3. 導出値は計算で導く       … KpiRow.tsx / ChartPanel.tsx / TableRows.tsx（ストアには filters だけを置く）
 * 4. 安定した id を key に     … TableRows.tsx
 */
import { RenderCountPanel, Region } from '../RenderCountPanel'
import FilterPanel from './FilterPanel'
import Header from './Header'
import { useDashboardStore } from './store'

// ストアはモジュールに置いてあるので、アプリを Provider で囲む必要がない（4-7）。
// Provider の境界が無い＝どのコンポーネントからでもストアを読めるので、
// 4-6 で theme を読むために挟んでいた ThemedPage も要らなくなった
export default function DashboardAfter() {
  const theme = useDashboardStore((state) => state.theme)

  return (
    <div
      className="page"
      style={{ maxWidth: 1120, background: theme === 'contrast' ? '#e9ebef' : undefined }}
    >
      <h1>Shiba Analytics（after）</h1>
      <p className="lead">
        メモ化は1つも足していない。state の置き場所と、購読範囲の絞り方だけで、再描画の範囲を必要な場所に絞った。
      </p>

      <RenderCountPanel hint="「リセットして計測」を押してから同じ操作をして、before と領域数を比べる" />

      <Region name="ヘッダー">
        <Header />
      </Region>

      <FilterPanel />
    </div>
  )
}
