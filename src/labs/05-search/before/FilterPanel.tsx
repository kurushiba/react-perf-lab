import { CATEGORIES, CATEGORY_LABELS } from '../../../data/products'
import { PRICE_BANDS, STOCK_OPTIONS, type Filters } from '../types'

interface FilterPanelProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

/** 変更すると、検索語はそのままで 10,000 件の走査がもう一度走る */
export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  return (
    <div className="toolbar" style={{ marginBottom: 12 }}>
      <select
        value={filters.category}
        onChange={(event) =>
          onChange({ ...filters, category: event.target.value as Filters['category'] })
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
          onChange({ ...filters, priceBand: event.target.value as Filters['priceBand'] })
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
        onChange={(event) => onChange({ ...filters, stock: event.target.value as Filters['stock'] })}
      >
        {STOCK_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
