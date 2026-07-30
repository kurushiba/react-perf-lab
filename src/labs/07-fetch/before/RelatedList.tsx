import type { ProductDetail } from '../../../shared/mockApi'
import { formatYen } from '../config'
import Spinner from './Spinner'
import { useFetch } from './useProducts'

function RelatedCard({ id }: { id: string }) {
  const { data } = useFetch<ProductDetail>(`/api/products/${id}`)

  if (!data) {
    return (
      <div className="panel" style={{ padding: 8 }}>
        <Spinner label="…" />
      </div>
    )
  }

  return (
    <div className="panel" style={{ padding: 8 }}>
      <div style={{ fontWeight: 600 }}>{data.name}</div>
      <div className="muted" style={{ fontSize: 12 }}>
        {data.sku}
      </div>
      <div>{formatYen(data.price)}</div>
    </div>
  )
}

interface RelatedListProps {
  ids: string[]
}

export default function RelatedList({ ids }: RelatedListProps) {
  return (
    <div>
      <h3>関連商品</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {ids.map((id) => (
          <RelatedCard key={id} id={id} />
        ))}
      </div>
    </div>
  )
}
