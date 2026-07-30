import { useEffect, useState } from 'react'
import { sendAnalyticsEvent } from '../analytics'
import type { Filters, TabId } from '../types'

/**
 * 検索したことを計測基盤に送る Effect。
 *
 * 送りたいのは「検索語が変わったとき」だけなのに、送信するペイロードに必要な値が
 * すべて依存配列に並んでしまっている。結果として、タブを切り替えただけ・
 * フィルタを触っただけでも同じイベントが飛ぶ。
 */
export function useAnalytics(
  query: string,
  filters: Filters,
  resultCount: number,
  tab: TabId,
): number {
  const [sentCount, setSentCount] = useState(0)

  useEffect(() => {
    setSentCount(
      sendAnalyticsEvent({
        name: 'search',
        query,
        category: filters.category,
        priceBand: filters.priceBand,
        stock: filters.stock,
        resultCount,
        tab,
      }),
    )
  }, [query, filters.category, filters.priceBand, filters.stock, resultCount, tab])

  return sentCount
}
