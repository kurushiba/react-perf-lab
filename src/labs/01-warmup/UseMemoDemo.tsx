'use no memo'

import { useMemo, useState } from 'react'

/**
 * 1-6 useMemo：依存が同じなら計算結果を再利用する
 *
 * 数万回ループの中程度の計算に対して、useMemo あり／なしを切り替えて所要時間を比べる。
 */
function computeScore(seed: number): number {
  const started = performance.now()
  let total = 0
  for (let i = 0; i < 4_000_000; i++) {
    total += Math.sqrt((i % 997) * seed) % 13
  }
  console.log(`[compute] ${(performance.now() - started).toFixed(1)}ms かかった`)
  return Math.round(total)
}

export default function UseMemoDemo() {
  const [seed, setSeed] = useState(3)
  const [unrelated, setUnrelated] = useState(0)
  const [memoized, setMemoized] = useState(false)

  // useMemo あり／なしをトグルで比較する。
  // （フックは条件分岐できないので、両方を毎回呼んで使う方を選ぶ形にしている）
  const memoResult = useMemo(() => (memoized ? computeScore(seed) : 0), [memoized, seed])
  const plainResult = memoized ? 0 : computeScore(seed)
  const score = memoized ? memoResult : plainResult

  return (
    <div className="page">
      <h1>1-6 useMemo</h1>
      <p className="muted">
        「関係ないstateを更新」を押したときの挙動を見比べる。useMemo なしだと毎回 4,000,000
        回のループが走り直すが、useMemo ありなら計算ログが出ない（依存が変わっていないため）。
      </p>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <button className="button" onClick={() => setUnrelated((v) => v + 1)}>
          関係ないstateを更新: {unrelated}
        </button>
        <button className="button" onClick={() => setSeed((v) => v + 1)}>
          依存（seed）を変える: {seed}
        </button>
        <label>
          <input
            type="checkbox"
            checked={memoized}
            onChange={(e) => setMemoized(e.target.checked)}
          />{' '}
          useMemo を使う
        </label>
      </div>

      <div className="panel">スコア: {score}</div>
    </div>
  )
}
