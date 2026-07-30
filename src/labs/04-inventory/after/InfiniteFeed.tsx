import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef, useState } from 'react'
import { CATEGORY_LABELS } from '../../../data/products'
import { fetchProductPage, type ProductSummary } from '../../../shared/mockApi'

const PAGE_SIZE = 50
const ROW_HEIGHT = 44

/**
 * 無限スクロール（取得件数を抑える）と仮想化（描画件数を抑える）の組み合わせ。
 * 片方だけだと「取得が重い」か「使ううちにDOMが溜まる」のどちらかが残る。
 *
 * 追加取得のきっかけは、仮想化が返す「いま見えている最後の行」から作る。
 */
export default function InfiniteFeed() {
  const [items, setItems] = useState<ProductSummary[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    fetchProductPage(page, PAGE_SIZE)
      .then((result) => {
        setItems((prev) => {
          const seen = new Set(prev.map((item) => item.id))
          return [...prev, ...result.items.filter((item) => !seen.has(item.id))]
        })
        setHasMore(result.hasMore)
      })
      .finally(() => setLoading(false))
  }, [page])

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
    getItemKey: (index) => items[index].id,
  })

  const virtualRows = virtualizer.getVirtualItems()
  const lastVisibleIndex = virtualRows.at(-1)?.index ?? -1

  useEffect(() => {
    if (loading || !hasMore || items.length === 0) return
    // 見えている最後の行が、読み込み済みの終わりから10行以内に来たら次を取りに行く
    if (lastVisibleIndex >= items.length - 10) setPage((prev) => prev + 1)
  }, [lastVisibleIndex, items.length, loading, hasMore])

  return (
    <div className="panel">
      <h3>
        無限スクロール ＋ 仮想化（読み込み済み {items.length.toLocaleString()} 件 / DOM上は{' '}
        {virtualRows.length} 行）
      </h3>
      <p className="muted" style={{ marginTop: 0 }}>
        {loading ? '読み込み中…' : hasMore ? '下までスクロールすると追加取得する' : 'すべて読み込みました'}
      </p>
      <div className="list-scroll" ref={scrollRef}>
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualRows.map((virtualRow) => {
            const item = items[virtualRow.index]
            return (
              <div
                key={virtualRow.key}
                className="row"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <img src={item.thumbnailUrl} alt="" width={32} height={32} />
                <span className="row__main">
                  <span className="row__name">{item.name}</span>
                  <span className="row__sub">{item.sku}</span>
                </span>
                <span className="badge">{CATEGORY_LABELS[item.category]}</span>
                <span className="row__num">{item.price.toLocaleString()} 円</span>
                <span className={item.stock === 0 ? 'row__stock row__stock--out' : 'row__stock'}>
                  在庫 {item.stock}
                </span>
                <button className="button">編集</button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
