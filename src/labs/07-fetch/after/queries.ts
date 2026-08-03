import { queryOptions } from '@tanstack/react-query'
import {
  fetchProductDetail,
  fetchProductPage,
  fetchProductsBatch,
} from '../../../shared/mockApi'

/**
 * queryKey と staleTime を1箇所に集める。
 *
 * - queryKey が「このデータの住所」になる。同じ住所を指す限りキャッシュが共有され、
 *   一覧 → 詳細 → 一覧 と戻っても取り直しが起きない
 * - staleTime は「取り直さずに使ってよい期間」。0 だとマウントのたびに裏で取り直す
 * - queryFn が受け取る signal をそのまま fetch に渡すので、
 *   古いリクエストは React Query 側が中断してくれる（＝レースコンディションが起きない）
 */

const FRESH_FOR = 60_000

export const productListQuery = (page: number, size: number) =>
  queryOptions({
    queryKey: ['products', 'page', page, size],
    queryFn: ({ signal }) => fetchProductPage(page, size, { signal }),
    staleTime: FRESH_FOR,
  })

export const productDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ['products', 'detail', id],
    queryFn: ({ signal }) => fetchProductDetail(id, signal),
    staleTime: FRESH_FOR,
  })

/** 個別に取らず、まとめて1本にする（8-4） */
export const productBatchQuery = (ids: string[]) =>
  queryOptions({
    queryKey: ['products', 'batch', ids.join(',')],
    queryFn: ({ signal }) => fetchProductsBatch(ids, signal),
    staleTime: FRESH_FOR,
  })
