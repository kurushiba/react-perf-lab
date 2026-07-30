import { useSuspenseQuery } from '@tanstack/react-query'
import { formatYen } from '../config'
import { productBatchQuery } from './queries'

interface RelatedListProps {
  ids: string[]
}

/**
 * before は関連4件を4本のリクエストで取っていた。
 * 取る中身は同じなので、1本にまとめれば往復が1回で済む（9-4）。
 */
export default function RelatedList({ ids }: RelatedListProps) {
  const { data } = useSuspenseQuery(productBatchQuery(ids))

  return (
    <div>
      <h3>関連商品</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {data.map((item) => (
          <div key={item.id} className="panel" style={{ padding: 8 }}>
            <div style={{ fontWeight: 600 }}>{item.name}</div>
            <div className="muted" style={{ fontSize: 12 }}>
              {item.sku}
            </div>
            <div>{formatYen(item.price)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
