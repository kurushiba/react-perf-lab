import { Profiler, useEffect, useState, type ProfilerOnRenderCallback, type ReactNode } from 'react'

/**
 * Sec.4 の「光る範囲」を数値で出すための計測パネル。before / after / store で共有する。
 *
 * DevTools の Highlight Updates は目で見るものなので、比較を残せない。
 * ここでは画面を5つの領域に分け、`<Region>` が `<Profiler>` で各領域を包んで
 * 「操作1回で、どの領域が何回レンダーされたか」を数える。
 *
 * 表示は回数・時間ともレンダー基準で揃えてある。`onRender` はコミット時に呼ばれるので
 * 厳密には「コミットまで到達したレンダー」の回数と、その際のレンダーフェーズの所要時間
 * （`actualDuration`）で、DOM 反映＝コミットフェーズのコストは含まない。
 * このラボには useTransition / memo がないので、レンダーしたのに
 * コミットされない領域は発生せず、「レンダーした領域」と読んで差し支えない。
 *
 * 04-inventory/MeasurePanel.tsx と同じで、記録するのはレンダー中ではなく
 * コミット後に呼ばれる `onRender` の中だけ。レンダー中に副作用を持たせると
 * React Compiler が bail out してしまい、このラボの前提（Compilerは効いている）が崩れる。
 */

export const REGIONS = ['ヘッダー', 'KPI', 'チャート', 'フィルタ', 'テーブル'] as const

export type RegionName = (typeof REGIONS)[number]

interface RegionStat {
  renders: number
  totalMs: number
}

// モジュールスコープの Map。再代入はせず、コミット後のコールバックからのみ書き換える
const stats = new Map<string, RegionStat>()

function readStats(): { name: RegionName; renders: number; totalMs: number }[] {
  return REGIONS.map((name) => ({
    name,
    renders: stats.get(name)?.renders ?? 0,
    totalMs: stats.get(name)?.totalMs ?? 0,
  }))
}

interface RegionProps {
  name: RegionName
  children: ReactNode
}

export function Region({ name, children }: RegionProps) {
  const handleRender: ProfilerOnRenderCallback = (_id, _phase, actualDuration) => {
    const current = stats.get(name)
    if (current) {
      current.renders += 1
      current.totalMs += actualDuration
    } else {
      stats.set(name, { renders: 1, totalMs: actualDuration })
    }
  }

  return (
    <Profiler id={name} onRender={handleRender}>
      {children}
    </Profiler>
  )
}

interface RenderCountPanelProps {
  hint: string
}

export function RenderCountPanel({ hint }: RenderCountPanelProps) {
  const [rows, setRows] = useState(readStats)

  // パネル自身は計測対象の外に置いてあるので、ここでの再描画は数値に影響しない
  useEffect(() => {
    const timer = setInterval(() => setRows(readStats()), 400)
    return () => clearInterval(timer)
  }, [])

  const handleReset = () => {
    stats.clear()
    setRows(readStats())
  }

  const litRegions = rows.filter((row) => row.renders > 0).length
  const totalMs = rows.reduce((sum, row) => sum + row.totalMs, 0)

  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <div className="metrics" style={{ marginBottom: 12 }}>
        <div>
          <div className="metrics__value">
            {litRegions} / {REGIONS.length}
          </div>
          <div className="metrics__label">レンダーした領域</div>
        </div>
        <div>
          <div className="metrics__value">{totalMs.toFixed(1)} ms</div>
          <div className="metrics__label">合計レンダリング時間</div>
        </div>
        <button className="button" onClick={handleReset}>
          リセットして計測
        </button>
        <span className="muted" style={{ flex: 1, minWidth: 240 }}>
          {hint}
        </span>
      </div>

      <div style={{ display: 'grid', gap: 4 }}>
        {rows.map((row) => (
          <div key={row.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 84 }}>{row.name}</span>
            <span
              className="bar"
              style={{
                width: `${Math.min(row.totalMs * 4, 320)}px`,
                background: row.renders === 0 ? 'var(--border)' : 'var(--accent)',
              }}
            />
            <span className="muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {row.renders} 回 / {row.totalMs.toFixed(1)} ms
            </span>
          </div>
        ))}
      </div>

      <p className="muted" style={{ margin: '8px 0 0' }}>
        時間はレンダーフェーズのみで、DOM への反映（コミットフェーズ）は含まない。dev サーバは
        StrictMode でコンポーネント関数が2回呼ばれるが、コミットは1回なので回数はそのまま読める。
        時間だけ2回分が乗るため、絶対値ではなく before / after の比で見る。
      </p>
    </div>
  )
}
