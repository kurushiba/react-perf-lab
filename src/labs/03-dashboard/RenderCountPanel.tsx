import { Profiler, useEffect, useState, type ProfilerOnRenderCallback, type ReactNode } from 'react'

/**
 * Sec.4 の「光る範囲」を数値で出すための計測パネル。before / after / store で共有する。
 *
 * DevTools の Highlight Updates は目で見るものなので、比較を残せない。
 * ここでは画面を5つの領域に分け、`<Region>` が `<Profiler>` で各領域を包んで
 * 「操作1回で、どの領域が何回コミットしたか」を数える。
 *
 * 04-inventory/MeasurePanel.tsx と同じで、記録するのはレンダー中ではなく
 * コミット後に呼ばれる `onRender` の中だけ。レンダー中に副作用を持たせると
 * React Compiler が bail out してしまい、このラボの前提（Compilerは効いている）が崩れる。
 */

export const REGIONS = ['ヘッダー', 'KPI', 'チャート', 'フィルタ', 'テーブル'] as const

export type RegionName = (typeof REGIONS)[number]

interface RegionStat {
  commits: number
  totalMs: number
}

// モジュールスコープの Map。再代入はせず、コミット後のコールバックからのみ書き換える
const stats = new Map<string, RegionStat>()

function readStats(): { name: RegionName; commits: number; totalMs: number }[] {
  return REGIONS.map((name) => ({
    name,
    commits: stats.get(name)?.commits ?? 0,
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
      current.commits += 1
      current.totalMs += actualDuration
    } else {
      stats.set(name, { commits: 1, totalMs: actualDuration })
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

  const litRegions = rows.filter((row) => row.commits > 0).length
  const totalMs = rows.reduce((sum, row) => sum + row.totalMs, 0)

  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <div className="metrics" style={{ marginBottom: 12 }}>
        <div>
          <div className="metrics__value">
            {litRegions} / {REGIONS.length}
          </div>
          <div className="metrics__label">コミットした領域</div>
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
                background: row.commits === 0 ? 'var(--border)' : 'var(--accent)',
              }}
            />
            <span className="muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {row.commits} 回 / {row.totalMs.toFixed(1)} ms
            </span>
          </div>
        ))}
      </div>

      <p className="muted" style={{ margin: '8px 0 0' }}>
        dev サーバは StrictMode で各コンポーネントが2回描画されるので、回数は2で割って読む。
      </p>
    </div>
  )
}
