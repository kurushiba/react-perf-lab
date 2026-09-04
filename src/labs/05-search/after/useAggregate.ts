import { useEffect, useRef, useState } from 'react'
import type { Product } from '../../../data/products'
import { EMPTY_AGGREGATE, type Aggregate } from '../aggregate'
import type { AggregateRequest, AggregateResponse } from './aggregate.worker'

export interface AggregateState {
  data: Aggregate
  /** Worker が計算中。前回の結果を出したままにしておける */
  pending: boolean
}

/**
 * 集計を Worker に投げ、結果が返ったら state を更新する。
 *
 * 受け取るのは検索結果の配列そのもの。配列を依存配列に置けるのは、
 * React Compiler が呼び出し側の searchProducts(...) をメモ化していて、
 * 検索語とフィルタが変わらない限り同じ参照が返ってくるから（2-3 の reactive scope）。
 *
 * メインスレッドがやるのは「id の配列を作って渡す」だけなので、
 * 何件ヒットしていても打鍵の応答は止まらない。
 */
export function useAggregate(items: Product[]): AggregateState {
  const [state, setState] = useState<AggregateState>({ data: EMPTY_AGGREGATE, pending: true })
  const workerRef = useRef<Worker | null>(null)
  const latestRequestId = useRef(0)

  useEffect(() => {
    const worker = new Worker(new URL('./aggregate.worker.ts', import.meta.url), { type: 'module' })
    workerRef.current = worker

    worker.addEventListener('message', (event: MessageEvent<AggregateResponse>) => {
      // 追い越された古い結果は捨てる（後から投げた方が先に返ることがある）
      if (event.data.requestId !== latestRequestId.current) return
      setState({ data: event.data.result, pending: false })
    })

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  useEffect(() => {
    const worker = workerRef.current
    if (!worker) return

    const requestId = ++latestRequestId.current
    // 商品そのものではなく id だけを渡すので、転送コストがほぼゼロ
    const productIds = items.map((item) => item.id)
    const ids = Int32Array.from(productIds)
    setState((prev) => ({ ...prev, pending: true }))
    const request: AggregateRequest = { requestId, ids }
    worker.postMessage(request, [ids.buffer])
  }, [items])

  return state
}
