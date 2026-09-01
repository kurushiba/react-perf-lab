import type { ProductDetail } from '../../../shared/mockApi'
import { formatYen } from '../config'
import FavoriteButton from './FavoriteButton'
import RelatedList from './RelatedList'
import Spinner from './Spinner'
import { useFetch } from './useProducts'

interface DetailPanelProps {
  id: number | null
}

export default function DetailPanel({ id }: DetailPanelProps) {
  const { data, loading } = useFetch<ProductDetail>(id ? `/api/products/${id}` : null)

  if (!id) return <p className="muted">左の一覧から商品を選ぶ</p>
  if (loading || !data) return <Spinner label="詳細を読み込み中…" />

  return (
    <div>
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <h2>{data.name}</h2>
        <FavoriteButton id={data.id} />
      </div>
      <p className="muted" style={{ margin: '4px 0 12px' }}>
        {data.sku} / {data.category} / {formatYen(data.price)} / 在庫 {data.stock}
      </p>
      <p>{data.description}</p>

      <RelatedList ids={data.relatedIds} />
    </div>
  )
}
