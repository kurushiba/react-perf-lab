/**
 * 4-4 用の計測。「テーマ切替1回で、どのコンポーネントが再レンダリングされたか」を数える。
 *
 * RenderCountPanel（before / after / store で共用）は画面を5領域に分けて `<Profiler>` で
 * 包む作りなので、コンポーネント1個ずつの粒度では使えない。`<Profiler>` は配下のどれかが
 * レンダーされればコミット時に呼ばれるため、「Sidebar 自身は止まったが NavList は動いた」
 * を区別できないからである。
 *
 * ここでは代わりに、各コンポーネントの中で依存配列なしの `useEffect` を呼ぶ。
 * この形の effect は「そのコンポーネントがレンダーされてコミットされたとき」だけ再実行され、
 * メモ化でスキップされた回は走らない。つまり実行回数がそのまま再レンダリング回数になる。
 *
 * レンダー中ではなくコミット後に Map を書き換えている点は RenderCountPanel と同じ理由で、
 * レンダー中に副作用を持たせると React Compiler が bail out してこのラボの前提が崩れる。
 */
import { useEffect, useState } from 'react'

// モジュールスコープの Map。再代入はせず、コミット後の effect からのみ書き換える
const counts = new Map<string, number>()

function readCounts(names: readonly string[]): { name: string; renders: number }[] {
  return names.map((name) => ({ name, renders: counts.get(name) ?? 0 }))
}

/** 各コンポーネントの先頭で呼ぶ。呼んだ回数＝そのコンポーネントがレンダリングされた回数 */
export function useRenderTally(name: string) {
  useEffect(() => {
    counts.set(name, (counts.get(name) ?? 0) + 1)
  })
}

interface RenderTallyPanelProps {
  /** 画面に出すコンポーネント名。ツリーの上から順に並べる */
  names: readonly string[]
  /** theme を実際に使っているコンポーネント（★を付ける） */
  consumers: readonly string[]
}

export function RenderTallyPanel({ names, consumers }: RenderTallyPanelProps) {
  const [rows, setRows] = useState(() => readCounts(names))

  // パネル自身は計測対象のツリーの外にあるので、ここでの再描画は数値に影響しない
  useEffect(() => {
    const timer = setInterval(() => setRows(readCounts(names)), 400)
    return () => clearInterval(timer)
  }, [names])

  const handleReset = () => {
    counts.clear()
    setRows(readCounts(names))
  }

  const rendered = rows.filter((row) => row.renders > 0).length

  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <div className="metrics" style={{ marginBottom: 12 }}>
        <div>
          <div className="metrics__value">
            {rendered} / {names.length}
          </div>
          <div className="metrics__label">再レンダリングされたコンポーネント</div>
        </div>
        <button className="button" onClick={handleReset}>
          リセットして計測
        </button>
        <span className="muted" style={{ flex: 1, minWidth: 260 }}>
          リセットしてから「テーマ切替」を1回だけ押す。★は theme を実際に使っている場所
        </span>
      </div>

      <div style={{ display: 'grid', gap: 4 }}>
        {rows.map((row) => (
          <div key={row.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 132 }}>
              {consumers.includes(row.name) ? '★ ' : '　 '}
              {row.name}
            </span>
            <span
              className="bar"
              style={{
                width: row.renders === 0 ? '8px' : `${Math.min(row.renders * 40, 240)}px`,
                background: row.renders === 0 ? 'var(--border)' : 'var(--accent)',
              }}
            />
            <span className="muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {row.renders} 回
            </span>
          </div>
        ))}
      </div>

      <p className="muted" style={{ margin: '8px 0 0' }}>
        ⚠️ この計測は <strong>React Compiler が有効</strong>であることが前提（`2-4` で有効化する）。
        有効かどうかは <code>Toolbar</code> と <code>SearchBox</code> で分かる。この2つは before でも
        theme を受け取っていないので、Compiler が効いていれば <strong>0回のまま</strong>になる。
        ここが動いてしまう場合は Compiler が無効なので、README の手順で先に有効化する。
      </p>
      <p className="muted" style={{ margin: '4px 0 0' }}>
        dev サーバは StrictMode でコンポーネント関数が2回呼ばれるが、更新時の effect は1回なので、
        この数字は2で割らずにそのまま読める（`4-1` の RenderCountPanel との違い）。
      </p>
    </div>
  )
}
