import type { Page, ProductSummary } from '../../../shared/mockApi'
import { LIST_PAGE, LIST_SIZE, formatYen } from '../config'
import Spinner from './Spinner'
import { useFetch } from './useProducts'

interface ProductListProps {
  selectedId: number | null
  onSelect: (id: number) => void
}

export default function ProductList({ selectedId, onSelect }: ProductListProps) {
  const { data, loading } = useFetch<Page<ProductSummary>>(
    `/api/products?page=${LIST_PAGE}&size=${LIST_SIZE}`,
  )

  if (loading || !data) return <Spinner label="一覧を読み込み中…" />

  return (
    <div className="list-scroll">
      {data.items.map((item) => (
        <div
          key={item.id}
          className="row"
          style={{
            cursor: 'pointer',
            background: item.id === selectedId ? 'var(--accent-weak)' : undefined,
          }}
          onClick={() => onSelect(item.id)}
        >
          <span className="row__main">
            <span className="row__name">{item.name}</span>
            <span className="row__sub">
              {item.sku} / {item.category}
            </span>
          </span>
          <span className="row__num">{formatYen(item.price)}</span>
          <span className={item.stock > 0 ? 'row__stock' : 'row__stock row__stock--out'}>
            {item.stock > 0 ? `在庫${item.stock}` : '在庫切れ'}
          </span>
        </div>
      ))}
    </div>
  )
}
