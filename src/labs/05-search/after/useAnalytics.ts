import { useEffect, useEffectEvent, useState } from 'react'
import { sendAnalyticsEvent } from '../analytics'
import type { Filters, TabId } from '../types'

/**
 * 送信したいタイミング（検索語が変わったとき）と、
 * 送信に必要な値（フィルタ・件数・タブ）を切り離す。
 *
 * useEffectEvent の中で読む値は「最新のもの」が使われるが、依存配列には入らない。
 * 手動メモ化を足すのではなく、Effect の設計そのものを変えるアプローチ。
 */
export function useAnalytics(
  query: string,
  filters: Filters,
  resultCount: number,
  tab: TabId,
): number {
  const [sentCount, setSentCount] = useState(0)

  const reportSearch = useEffectEvent((searchQuery: string) => {
    setSentCount(
      sendAnalyticsEvent({
        name: 'search',
        query: searchQuery,
        category: filters.category,
        priceBand: filters.priceBand,
        stock: filters.stock,
        resultCount,
        tab,
      }),
    )
  })

  useEffect(() => {
    reportSearch(query)
  }, [query])

  return sentCount
}
