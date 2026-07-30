import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef, type CSSProperties, type Ref } from 'react'
import { CATEGORY_LABELS, products, type Product } from '../../../data/products'

interface DescriptionRowProps {
  product: Product
  style: CSSProperties
  /** React 19 では ref も普通の props として受け取れる（forwardRef は不要） */
  ref: Ref<HTMLDivElement>
  /** react-virtual が実測時に行番号を読むための属性 */
  'data-index': number
}

/**
 * 高さを固定していない行。実際の高さは描画後にブラウザから測る（measureElement）。
 */
export function DescriptionRow({ product, style, ref, ...rest }: DescriptionRowProps) {
  return (
    <div className="row row--auto" style={style} ref={ref} {...rest}>
      <img src={product.thumbnailUrl} alt="" width={32} height={32} />
      <span className="row__main">
        <span className="row__name">{product.name}</span>
        <span className="row__sub">
          {product.sku} ・ {CATEGORY_LABELS[product.category]}
        </span>
        <span className="row__sub">{product.description}</span>
      </span>
      <span className="row__num">{product.price.toLocaleString()} 円</span>
      <button className="button">編集</button>
    </div>
  )
}

export default function DescriptionListView() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => scrollRef.current,
    // 高さが揃っていないので、ここは「とりあえずの推定値」でしかない。
    // 実際の高さは measureElement が描画後に測って上書きする
    estimateSize: () => 72,
    overscan: 6,
    getItemKey: (index) => products[index].id,
  })

  return (
    <div className="panel">
      <h3>在庫一覧・説明つき（可変高さ）</h3>
      <p className="muted" style={{ marginTop: 0 }}>
        推定値は 72px。実際の高さを測り直しているので、スクロールバーが暴れない。
      </p>
      <div className="list-scroll" ref={scrollRef}>
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <DescriptionRow
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
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
