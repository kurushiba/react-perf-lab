import type { Aggregate } from '../aggregate'

interface CategoryChartProps {
  data: Aggregate
  detailed?: boolean
}

/** 集計そのものは index.tsx で計算している。ここは受け取った結果を描くだけ */
export default function CategoryChart({ data, detailed = false }: CategoryChartProps) {
  const max = Math.max(1, ...data.byCategory.map((row) => row.count))

  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <h3>
        カテゴリ別の集計（レビュー {data.reviewCount.toLocaleString()} 件 / 平均 ★
        {data.averageRating.toFixed(2)} / 集計 {data.elapsedMs.toFixed(0)}ms）
      </h3>

      <div style={{ display: 'grid', gap: 4 }}>
        {data.byCategory.map((row) => (
          <div key={row.category} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 84 }}>{row.label}</span>
            <span className="bar" style={{ width: `${(row.count / max) * 60}%` }} />
            <span className="muted">{row.count.toLocaleString()} 件</span>
            {detailed && (
              <>
                <span className="muted">中央値 {row.median.toLocaleString()} 円</span>
                {row.topWords.map((word) => (
                  <span key={word.word} className="badge">
                    {word.word} {word.count}
                  </span>
                ))}
              </>
            )}
          </div>
        ))}
      </div>

      {detailed && (
        <div className="toolbar" style={{ marginTop: 12 }}>
          <span className="muted">レビュー頻出の2語:</span>
          {data.topPairs.map((pair) => (
            <span key={pair.pair} className="chip" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
              {pair.pair} {pair.count}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
