import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { LIST_PAGE, LIST_SIZE, formatYen } from '../config'
import { productDetailQuery, productListQuery } from './queries'

interface ProductListProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function ProductList({ selectedId, onSelect }: ProductListProps) {
  const queryClient = useQueryClient()
  const { data } = useSuspenseQuery(productListQuery(LIST_PAGE, LIST_SIZE))

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
          // マウスが乗った時点で詳細を取りに行く。
          // 実際の通信時間は変わらないが、クリックした時にはもう届いている（8-5）
          onMouseEnter={() => void queryClient.prefetchQuery(productDetailQuery(item.id))}
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
