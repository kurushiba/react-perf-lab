/**
 * 03-dashboard / store — 4-6 の比較用。
 *
 * after は Context を6つに分けて購読範囲を絞った。ここでは同じことを
 * Zustand のストア1つ＋セレクタで書いている。見るべきは2点だけ：
 *
 *   1. `create()` のストア定義（store.ts）
 *   2. `useDashboardStore((state) => state.unreadCount)` のセレクタ
 *
 * ダッシュボード全体は移植していない。ヘッダー・KPI・フィルタの3領域だけを作り、
 * 「セレクタが返す値が変わったときだけ再描画される」ことを before / after と
 * 同じ計測パネルで比べられるようにしてある。
 */
import { RenderCountPanel, Region } from '../RenderCountPanel'
import FilterBar from './FilterBar'
import KpiRow from './KpiRow'
import { useDashboardStore } from './store'

// unreadCount だけを選ぶ。テーマやフィルタが変わってもこの span は再描画されない
function NotificationBadge() {
  console.log('[render] NotificationBadge')

  const unreadCount = useDashboardStore((state) => state.unreadCount)

  return (
    <span
      className="badge"
      style={unreadCount > 0 ? { background: '#fdebe9', color: 'var(--danger)' } : undefined}
    >
      通知 {unreadCount}
    </span>
  )
}

function Header() {
  console.log('[render] Header')

  const theme = useDashboardStore((state) => state.theme)
  const setTheme = useDashboardStore((state) => state.setTheme)
  const addNotification = useDashboardStore((state) => state.addNotification)
  const markAllRead = useDashboardStore((state) => state.markAllRead)

  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <h2>Shiba Analytics</h2>
        <div className="toolbar">
          <NotificationBadge />
          <button className="button" onClick={addNotification}>
            通知を受け取る
          </button>
          <button className="button" onClick={markAllRead}>
            既読にする
          </button>
          <button className="button" onClick={() => setTheme(theme === 'light' ? 'contrast' : 'light')}>
            テーマ切替（{theme === 'light' ? '標準' : '高コントラスト'}）
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardStore() {
  const theme = useDashboardStore((state) => state.theme)

  return (
    <div
      className="page"
      style={{ maxWidth: 1120, background: theme === 'contrast' ? '#e9ebef' : undefined }}
    >
      <h1>Shiba Analytics（Zustand版）</h1>
      <p className="lead">
        after と同じ購読範囲の絞り込みを、Context の分割ではなくセレクタで実現した版。
      </p>

      <p className="note">
        このバリアントは 4-6 の比較用に、ヘッダー・KPI・フィルタの3領域だけを実装している。
        チャートとテーブルは作っていないので、計測パネルのその2行は 0 のままになる。
      </p>

      <RenderCountPanel hint="「通知を受け取る」を押すと、再描画されるのは通知バッジだけ。KPIとフィルタは動かない" />

      <Region name="ヘッダー">
        <Header />
      </Region>

      <Region name="フィルタ">
        <FilterBar />
      </Region>

      <Region name="KPI">
        <KpiRow />
      </Region>
    </div>
  )
}
