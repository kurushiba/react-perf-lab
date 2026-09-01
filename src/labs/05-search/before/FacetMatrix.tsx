import { CATEGORIES, CATEGORY_LABELS, type Category } from '../../../data/products'
import { MATRIX_BANDS, summarizeFacet, type PriceBand } from '../facets'
import type { Filters } from '../types'

interface FacetMatrixProps {
  filters: Filters
}

/**
 * カテゴリ × 価格帯の内訳。
 *
 * 受け取るのは filters だけなので、打鍵（query の変化）では再レンダリングされない。
 * 逆に、フィルタを1つ変えると 32 個のセルがまとめて計算し直される。
 */
export default function FacetMatrix({ filters }: FacetMatrixProps) {
  return (
    <div className="panel" style={{ marginTop: 16 }}>
      <h3>カテゴリ × 価格帯の内訳</h3>

      <table>
        <thead>
          <tr>
            <th>カテゴリ</th>
            {MATRIX_BANDS.map((band) => (
              <th key={band.id}>{band.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map((category) => (
            <tr key={category}>
              <td>{CATEGORY_LABELS[category]}</td>
              {MATRIX_BANDS.map((band) => (
                <FacetCell key={band.id} category={category} band={band} filters={filters} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface FacetCellProps {
  category: Category
  band: PriceBand
  filters: Filters
}

/**
 * セルを1つずつコンポーネントに分けてあるのが要点。
 * ここが React にとっての中断ポイントになる（6-5）。
 */
function FacetCell({ category, band, filters }: FacetCellProps) {
  const summary = summarizeFacet(category, band, filters)

  // 列はフィルタの価格帯と対応していないので、強調はカテゴリ一致のみ
  const highlighted = filters.category !== 'all' && filters.category === category

  return (
    <td style={highlighted ? { color: 'var(--accent)' } : undefined}>
      {summary.count.toLocaleString()} 件
      <span className="muted">
        {' '}
        / 注目 {summary.featured.toLocaleString()} 件 / ★{summary.averageRating.toFixed(2)}
      </span>
    </td>
  )
}
