import { useTransition } from 'react'
import { CATEGORIES, CATEGORY_LABELS } from '../../../data/products'
import { PRICE_BANDS, STOCK_OPTIONS, type Filters } from '../types'

interface FilterPanelProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

/**
 * フィルタの変更は「結果一覧の作り直し」を伴う更新なので、低優先度に落とす（7-5）。
 *
 * startTransition で包むと、この更新は中断可能になる。
 * 途中で入力があれば、そちらが先に処理される。
 */
export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [isPending, startTransition] = useTransition()

  const update = (next: Filters) => {
    startTransition(() => onChange(next))
  }

  return (
    <div className="toolbar" style={{ marginBottom: 12 }}>
      <select
        value={filters.category}
        onChange={(event) =>
          update({ ...filters, category: event.target.value as Filters['category'] })
        }
      >
        <option value="all">全カテゴリ</option>
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {CATEGORY_LABELS[category]}
          </option>
        ))}
      </select>

      <select
        value={filters.priceBand}
        onChange={(event) =>
          update({ ...filters, priceBand: event.target.value as Filters['priceBand'] })
        }
      >
        {PRICE_BANDS.map((band) => (
          <option key={band.id} value={band.id}>
            {band.label}
          </option>
        ))}
      </select>

      <select
        value={filters.stock}
        onChange={(event) => update({ ...filters, stock: event.target.value as Filters['stock'] })}
      >
        {STOCK_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>

      {isPending && <span className="muted">絞り込み中…</span>}
    </div>
  )
}
