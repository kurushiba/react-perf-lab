import { useState } from 'react'
import { CATEGORY_LABELS, products, type Product } from '../../../data/products'

const ROWS = products.slice(0, 2_000)
/** レポートは在庫全件が対象。一覧に出しているのは上位2,000件だけ */
const REPORT_SOURCE = products
const PHOTOS = ['/images/photos/photo-0.png', '/images/photos/photo-1.png', '/images/photos/photo-2.png', '/images/photos/photo-3.png']

interface Report {
  hotWords: { word: string; count: number }[]
  hotPairs: { pair: string; count: number }[]
  byCategory: { category: string; count: number; median: number }[]
  matched: number
  elapsedMs: number
}

function buildReport(items: Product[], keyword: string): Report {
  const startedAt = performance.now()

  const wordCounts = new Map<string, number>()
  const pairCounts = new Map<string, number>()
  for (const item of items) {
    const words = item.description.toLowerCase().split(/[^a-z]+/)
    let previous = ''
    for (const word of words) {
      if (word.length < 5) continue
      wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1)
      if (previous) {
        const pair = `${previous} ${word}`
        pairCounts.set(pair, (pairCounts.get(pair) ?? 0) + 1)
      }
      previous = word
    }
  }

  const prices = new Map<string, number[]>()
  for (const item of items) {
    const bucket = prices.get(item.category)
    if (bucket) bucket.push(item.price)
    else prices.set(item.category, [item.price])
  }

  const needle = keyword.toLowerCase()
  let matched = 0
  for (const item of items) {
    const haystack = `${item.name} ${item.sku} ${item.category} ${item.description}`.toLowerCase()
    if (haystack.includes(needle)) matched++
  }

  const report: Report = {
    hotPairs: [...pairCounts.entries()]
      .map(([pair, count]) => ({ pair, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3),
    hotWords: [...wordCounts.entries()]
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    byCategory: [...prices.entries()]
      .map(([category, values]) => {
        const sorted = values.slice().sort((a, b) => a - b)
        return { category, count: sorted.length, median: sorted[Math.floor(sorted.length / 2)] }
      })
      .sort((a, b) => b.count - a.count),
    matched,
    elapsedMs: 0,
  }

  report.elapsedMs = performance.now() - startedAt
  console.log(`[compute] buildReport ${report.elapsedMs.toFixed(0)}ms`)
  return report
}

/**
 * 4-4 のハンズオン用。
 *
 * このファイルは Rules of React を守っていて、手動メモ化も1つも無い。
 * Compiler を有効にしても遅いままで、しかも遅さの原因は1つではない。
 * `0-2` の3層のどこに何が居るのかを、受講者が自分で切り分ける教材。
 */
export default function SlowStill() {
  const [keyword, setKeyword] = useState('stainless')
  const [showPhotos, setShowPhotos] = useState(true)

  const report = buildReport(REPORT_SOURCE, keyword)

  return (
    <div className="page" style={{ maxWidth: 1120 }}>
      <h1>SlowStill：Compilerを入れても遅いページ</h1>
      <p className="muted">
        表示・スクロール・入力のどれもが重い。原因は1つではないので、まず何が遅いのかを切り分ける。
      </p>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="キーワード（1文字ずつ打ってみる）"
          style={{ width: 260 }}
        />
        <label>
          <input
            type="checkbox"
            checked={showPhotos}
            onChange={(e) => setShowPhotos(e.target.checked)}
          />{' '}
          ヘッダー画像を表示
        </label>
        <span className="muted">集計 {report.elapsedMs.toFixed(0)}ms / 一致 {report.matched} 件</span>
      </div>

      {showPhotos && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <h3>今週のピックアップ</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8 }}>
            {PHOTOS.map((src) => (
              <img key={src} src={src} alt="" style={{ width: '100%', display: 'block', borderRadius: 6 }} />
            ))}
          </div>
        </div>
      )}

      <div className="panel" style={{ marginBottom: 16 }}>
        <h3>レポート</h3>
        <div className="toolbar">
          {report.hotWords.map((row) => (
            <span key={row.word} className="badge">
              {row.word} {row.count}
            </span>
          ))}
          {report.hotPairs.map((row) => (
            <span key={row.pair} className="chip" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
              {row.pair} {row.count}
            </span>
          ))}
        </div>
        <div className="toolbar" style={{ marginTop: 8 }}>
          {report.byCategory.map((row) => (
            <span key={row.category} className="chip" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
              {CATEGORY_LABELS[row.category as keyof typeof CATEGORY_LABELS]} 中央値{' '}
              {row.median.toLocaleString()}
            </span>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>在庫一覧（{ROWS.length.toLocaleString()} 件）</h3>
        <div>
          {ROWS.map((item) => (
            <div
              key={item.id}
              className="toolbar"
              style={{ borderBottom: '1px solid var(--border)', padding: '4px 0' }}
            >
              <img src={item.thumbnailUrl} alt="" width={24} height={24} />
              <span style={{ flex: 1 }}>{item.name}</span>
              <span className="muted">{item.sku}</span>
              <span className="badge">{CATEGORY_LABELS[item.category]}</span>
              <span>{item.price.toLocaleString()} 円</span>
              <span className="muted">在庫 {item.stock}</span>
              <button className="button">編集</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
