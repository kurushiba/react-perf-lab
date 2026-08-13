import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef, type CSSProperties } from 'react'
import { CATEGORY_LABELS, products, type Product } from '../../../data/products'

/** styles.css の `.row` と同じ値。ここがずれるとスクロールバーの長さが狂う */
const ROW_HEIGHT = 44

interface ProductRowProps {
  product: Product
  /** 空の箱の中での位置決め。呼び出し側が計算して渡す */
  style: CSSProperties
}

function ProductRow({ product, style }: ProductRowProps) {
  return (
    <div className="row" style={style}>
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
      <button className="button">編集</button>
    </div>
  )
}

export default function ListView() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    // 可視範囲の少し外まで描いておくと、速いスクロールでも白い帯が出にくい
    overscan: 8,
    // keyには一意な値を、と言われるが index は使ってはいけない。
    // 並べ替え/フィルタで表示順が変わると index とデータの対応がズレ、行が持つ state が別データに付き替わる
    getItemKey: (index) => products[index].id,
  })

  const virtualRows = virtualizer.getVirtualItems()

  return (
    <div className="panel">
      <h3>
        在庫一覧（{products.length.toLocaleString()} 件中 {virtualRows.length} 行だけをDOM化）
      </h3>
      <div className="list-scroll" ref={scrollRef}>
        {/* 全件ぶんの高さを持つ空の箱。これでスクロールバーの長さを再現する */}
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualRows.map((virtualRow) => (
            <ProductRow
              key={virtualRow.key}
              product={products[virtualRow.index]}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
