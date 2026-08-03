import { useState } from 'react'
import { CATEGORY_LABELS, type Product } from '../../../data/products'
import { reviewsOf } from '../reviews'

/** 描画量は主題ではないので、上位100件だけを出す（大量DOMは Sec.5 の題材） */
const VISIBLE = 100

type SortKey = 'score' | 'price' | 'stock'

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'score', label: '関連度順' },
  { id: 'price', label: '価格が安い順' },
  { id: 'stock', label: '在庫が多い順' },
]

export default function ResultList({ items }: { items: Product[] }) {
  // 並び順と開いている行は、この一覧が自分で持っているローカルな状態
  const [sort, setSort] = useState<SortKey>('score')
  const [openId, setOpenId] = useState<string | null>(null)

  const shown = items.slice(0, VISIBLE)
  const sorted =
    sort === 'price'
      ? shown.slice().sort((a, b) => a.price - b.price)
      : sort === 'stock'
        ? shown.slice().sort((a, b) => b.stock - a.stock)
        : shown

  return (
    <div>
      <div className="toolbar" style={{ marginBottom: 8 }}>
        {SORTS.map((option) => (
          <button
            key={option.id}
            className="button"
            style={
              option.id === sort ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : undefined
            }
            onClick={() => setSort(option.id)}
          >
            {option.label}
          </button>
        ))}
        <span className="muted">
          上位 {sorted.length} 件を表示（全 {items.length.toLocaleString()} 件）
        </span>
      </div>

      <div className="list-scroll">
        {sorted.map((product) => (
          <div key={product.id}>
            <div className="row" onClick={() => setOpenId(openId === product.id ? null : product.id)}>
              <img src={product.thumbnailUrl} alt="" width={32} height={32} />
              <span className="row__main">
                <span className="row__name">{product.name}</span>
                <span className="row__sub">{product.sku}</span>
              </span>
              <span className="badge">{CATEGORY_LABELS[product.category]}</span>
              <span className="row__num">{product.price.toLocaleString()} 円</span>
              <span className={product.stock === 0 ? 'row__stock row__stock--out' : 'row__stock'}>
                在庫 {product.stock}
              </span>
            </div>
            {openId === product.id && (
              <div style={{ padding: '8px 12px 12px 54px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ margin: '0 0 6px' }}>{product.description}</p>
                {reviewsOf(product.id).map((review) => (
                  <p key={review.id} className="muted" style={{ margin: '0 0 4px' }}>
                    ★{review.rating} {review.body}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
