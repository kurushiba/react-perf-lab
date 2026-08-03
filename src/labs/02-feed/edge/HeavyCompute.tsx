import { useState } from 'react'
import { aggregate, getSamples } from './heavy-data'

/**
 * ⚠️ 講座未使用（残置）。旧 `4-3`「再描画コストは減るが、描画そのものの重さは減らない」用
 * だったが、詳細を Sec.6 に回すだけの標識レクチャーだったため廃止した。
 * 同じ主張は `1-5`（概念）と `6-3`（実アプリでの実例）が扱う。
 * タブ一覧（`edge/index.tsx`）からは外してある。
 *
 * Compiler を有効にすると「関係ない state」を動かしても集計は走らなくなる。
 * だが weight を変えれば入力が変わるので、集計は必ず最初から走る。
 * ＝ メモ化は2回目以降を飛ばす技術で、1回の重さには効かない（1-5 の実例）。
 */
export default function HeavyCompute() {
  const [weight, setWeight] = useState(1)
  const [unrelated, setUnrelated] = useState(0)

  const result = aggregate(getSamples(), weight)

  return (
    <div className="page">
      <h1>HeavyCompute：40万件の多段集計</h1>
      <p className="note">
        集計にかかった時間：<strong>{result.elapsedMs.toFixed(0)} ms</strong>
        （CPU 4x スロットリング下ではこの4倍前後になる）
      </p>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <button className="button" onClick={() => setWeight((w) => w + 1)}>
          係数を変える（入力が変わる）: {weight}
        </button>
        <button className="button" onClick={() => setUnrelated((n) => n + 1)}>
          関係ない state を動かす: {unrelated}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 16 }}>
        <div className="panel">
          <h3>
            カテゴリ別（合計 {Math.round(result.totalValue).toLocaleString()} ／ ラベル重複{' '}
            {result.duplicates.toLocaleString()} 件）
          </h3>
          <table>
            <thead>
              <tr>
                <th>カテゴリ</th>
                <th>件数</th>
                <th>中央値</th>
                <th>p95</th>
              </tr>
            </thead>
            <tbody>
              {result.byCategory.map((row) => (
                <tr key={row.category}>
                  <td>{row.category}</td>
                  <td>{row.count.toLocaleString()}</td>
                  <td>{Math.round(row.median).toLocaleString()}</td>
                  <td>{Math.round(row.p95).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <div className="panel">
            <h3>頻出ワード</h3>
            {result.hotWords.map((row) => (
              <div key={row.word} className="toolbar" style={{ justifyContent: 'space-between' }}>
                <span>{row.word}</span>
                <span className="muted">{row.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="panel">
            <h3>地域別ヒット数</h3>
            {result.matchedRegions.map((row) => (
              <div key={row.region} className="toolbar" style={{ justifyContent: 'space-between' }}>
                <span>{row.region}</span>
                <span className="muted">
                  {row.matched.toLocaleString()} / 中央値 {row.median.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="panel">
            <h3>地域×カテゴリ（平均上位）</h3>
            {result.crossTab.map((row) => (
              <div key={row.key} className="toolbar" style={{ justifyContent: 'space-between' }}>
                <span>{row.key}</span>
                <span className="muted">{Math.round(row.average).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
