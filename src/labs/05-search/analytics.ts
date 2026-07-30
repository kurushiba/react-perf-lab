/**
 * 計測イベントの送信口（before / after 共用）。
 * 実際に送る代わりに、送信回数を返して画面に出せるようにしてある。
 */
export interface AnalyticsEvent {
  name: 'search'
  query: string
  category: string
  priceBand: string
  stock: string
  resultCount: number
  tab: string
}

let sentCount = 0

export function sendAnalyticsEvent(event: AnalyticsEvent): number {
  sentCount++
  console.log(
    `[effect] analytics#${sentCount} ${event.name} q="${event.query}" results=${event.resultCount} tab=${event.tab}`,
  )
  return sentCount
}
