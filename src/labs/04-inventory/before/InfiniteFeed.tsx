import { useEffect, useState } from 'react'
import { CATEGORY_LABELS } from '../../../data/products'
import { fetchProductPage, type ProductSummary } from '../../../shared/mockApi'

const PAGE_SIZE = 50

/**
 * 50件ずつ追加していく無限スクロール。仮想化していないので、
 * スクロールし続けるとDOMが増え続ける（＝取得は抑えられても描画は抑えられていない）。
 *
 * 取得そのものの作法（StrictMode の二重実行・キャッシュ・中断）は Sec.9 の題材なので、
 * ここでは同じ id を二重に足さないことだけ気をつけている。
 */
export default function InfiniteFeed() {
  const [items, setItems] = useState<ProductSummary[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

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

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (loading || !hasMore) return
    const el = event.currentTarget
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) setPage((prev) => prev + 1)
  }

  return (
    <div className="panel">
      <h3>
        無限スクロール（読み込み済み {items.length.toLocaleString()} 件 / {PAGE_SIZE} 件ずつ）
      </h3>
      <p className="muted" style={{ marginTop: 0 }}>
        下までスクロールすると追加取得する。取得件数は抑えられているが、描画した行は消えない。
      </p>
      <div className="list-scroll" onScroll={handleScroll}>
        {items.map((item) => (
          <div className="row" key={item.id}>
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
        ))}
        <div style={{ padding: 12 }} className="muted">
          {loading ? '読み込み中…' : hasMore ? 'さらにスクロールすると読み込む' : 'すべて読み込みました'}
        </div>
      </div>
    </div>
  )
}
