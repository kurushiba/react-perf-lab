'use no memo'

import { useState } from 'react'

/**
 * 1-6 useMemo：依存が同じなら計算結果を再利用する
 *
 * 初期状態はメモ化なし。seed と無関係な state を更新しても、
 * 4,000,000 回のループが毎回走り直す。ここに自分で useMemo を当てる。
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

  const score = computeScore(seed)

  return (
    <div className="page">
      <h1>1-6 useMemo</h1>
      <p className="muted">
        「関係ないstateを更新」を押しても、毎回 4,000,000
        回のループが走り直す。seed は変わっていないのに、計算ログが出続けることを確認する。
      </p>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <button className="button" onClick={() => setUnrelated((v) => v + 1)}>
          関係ないstateを更新: {unrelated}
        </button>
        <button className="button" onClick={() => setSeed((v) => v + 1)}>
          依存（seed）を変える: {seed}
        </button>
      </div>

      <div className="panel">スコア: {score}</div>
    </div>
  )
}
