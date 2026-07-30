import { useEffect, useRef, useState } from 'react'
import { EMPTY_AGGREGATE, type Aggregate } from '../aggregate'
import type { Filters } from '../types'
import type { AggregateRequest, AggregateResponse } from './aggregate.worker'
import { searchProducts } from './search-index'

export interface AggregateState {
  data: Aggregate
  /** Worker が計算中。前回の結果を出したままにしておける */
  pending: boolean
}

/**
 * 集計を Worker に投げ、結果が返ったら state を更新する。
 *
 * 受け取るのは「検索結果の配列」ではなく「検索条件」。
 * 配列は毎レンダー新しく作られるので依存配列に置けない（置くと投げ直しが止まらない）が、
 * 条件は state そのものなので安定している。索引の引き直しは 1ms 前後なので、
 * 結果を持ち回すより素直に引き直す。
 *
 * メインスレッドがやるのは「番号の配列を作って渡す」だけなので、
 * 何件ヒットしていても打鍵の応答は止まらない。
 */
export function useAggregate(query: string, filters: Filters): AggregateState {
  const [state, setState] = useState<AggregateState>({ data: EMPTY_AGGREGATE, pending: true })
  const workerRef = useRef<Worker | null>(null)
  const latestRequestId = useRef(0)

  useEffect(() => {
    const worker = new Worker(new URL('./aggregate.worker.ts', import.meta.url), { type: 'module' })
    workerRef.current = worker

    worker.addEventListener('message', (event: MessageEvent<AggregateResponse>) => {
      // 追い越された古い結果は捨てる（後から投げた方が先に返ることがある）
      if (event.data.id !== latestRequestId.current) return
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

    const items = searchProducts(query, filters)
    const id = ++latestRequestId.current
    // 'p-01234' → 1233。商品そのものではなく番号だけを渡すので、転送コストがほぼゼロ
    const indices = Int32Array.from(items, (item) => Number(item.id.slice(2)) - 1)
    setState((prev) => ({ ...prev, pending: true }))
    const request: AggregateRequest = { id, indices }
    worker.postMessage(request, [indices.buffer])
  }, [query, filters])

  return state
}
