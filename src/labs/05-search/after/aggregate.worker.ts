/**
 * カテゴリ別集計を別スレッドで実行する Worker（6-7）。
 *
 * 集計の中身（aggregate.ts）は before とまったく同じ。速くしたのではなく、
 * メインスレッドから追い出しただけ。
 *
 * 商品データは Worker 側でも生成する（同じシードなので完全に同じ列になる）。
 * postMessage で渡すのは「対象の商品番号」だけ ＝ Int32Array なので転送コストがほぼゼロ。
 */
import { products } from '../../../data/products'
import { aggregateProducts, type Aggregate } from '../aggregate'

export interface AggregateRequest {
  id: number
  indices: Int32Array
}

export interface AggregateResponse {
  id: number
  result: Aggregate
}

const ctx = self as unknown as DedicatedWorkerGlobalScope

ctx.addEventListener('message', (event: MessageEvent<AggregateRequest>) => {
  const { id, indices } = event.data
  const items = Array.from(indices, (index) => products[index])
  ctx.postMessage({ id, result: aggregateProducts(items) } satisfies AggregateResponse)
})
