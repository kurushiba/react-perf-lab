/**
 * カテゴリ別集計を別スレッドで実行する Worker（6-6）。
 *
 * 集計の中身（aggregate.ts）は before とまったく同じ。速くしたのではなく、
 * メインスレッドから追い出しただけ。
 *
 * 商品データは Worker 側でも生成する（同じシードなので完全に同じ列になる）。
 * postMessage で渡すのは「対象の商品 id」だけ ＝ Int32Array なので転送コストがほぼゼロ。
 */
import { products } from '../../../data/products'
import { aggregateProducts, type Aggregate } from '../aggregate'

export interface AggregateRequest {
  /** リクエストの通し番号。追い越された古い応答を捨てるために使う */
  requestId: number
  /** 集計対象の商品 id */
  ids: Int32Array
}

export interface AggregateResponse {
  requestId: number
  result: Aggregate
}

const ctx = self as unknown as DedicatedWorkerGlobalScope

// id から商品を引く表。起動時に一度だけ作る。この作業も Worker スレッドの中なので、
// メインスレッドは 1 ミリ秒も使わない
const productById = new Map(products.map((product) => [product.id, product]))

ctx.addEventListener('message', (event: MessageEvent<AggregateRequest>) => {
  const { requestId, ids } = event.data
  const items = Array.from(ids, (productId) => productById.get(productId)!)
  ctx.postMessage({ requestId, result: aggregateProducts(items) } satisfies AggregateResponse)
})
