import type { ProductDetail } from '../../../shared/mockApi'
import { NPLUSONE_IDS, formatYen } from '../config'
import { useFetch } from './useProducts'

/** 1行ぶんの在庫と価格を出すために、行が自分で詳細を取りに行く */
function StockRow({ id }: { id: number }) {
  const { data } = useFetch<ProductDetail>(`/api/products/${id}`)

  return (
    <div className="row">
      <span className="row__main">
        <span className="row__name">{data ? data.name : '—'}</span>
        <span className="row__sub">{data ? data.sku : '—'}</span>
      </span>
      <span className="row__num">{data ? formatYen(data.price) : '…'}</span>
      <span className="row__stock">{data ? `在庫${data.stock}` : '…'}</span>
    </div>
  )
}

export default function NPlusOneList() {
  return (
    <div>
      <h3>入荷予定（{NPLUSONE_IDS.length}件）</h3>
      <div className="list-scroll">
        {NPLUSONE_IDS.map((id) => (
          <StockRow key={id} id={id} />
        ))}
      </div>
    </div>
  )
}
