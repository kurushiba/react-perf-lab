import { activitiesByDeal, deals, type Deal } from '../../data/deals'
import { matchesFilters, type Filters } from './types'

/**
 * 案件名・顧客名・担当者・業種と、その案件にぶら下がる全ての活動メモを対象にした検索。
 * 索引を持たないので、1打鍵ごとに 5,000 件すべてを走査してスコアを付け直す。
 *
 * ★ before と after で共有している。after でもこの関数は1行も変えない。
 *   直すのは「いつ走らせるか」であって「何をするか」ではない、というのが 9-6 の主題。
 */
export function searchDeals(filters: Filters): Deal[] {
  const startedAt = performance.now()
  const needle = filters.query.trim().toLowerCase()

  const hits: { deal: Deal; score: number }[] = []

  for (const deal of deals) {
    if (!matchesFilters(deal, filters)) continue
    if (!needle) {
      hits.push({ deal, score: 0 })
      continue
    }

    let score = 0
    if (deal.name.toLowerCase().includes(needle)) score += 100
    if (deal.accountName.toLowerCase().includes(needle)) score += 60
    if (deal.owner.toLowerCase().includes(needle)) score += 40
    if (deal.industry.toLowerCase().includes(needle)) score += 20

    const activityText = (activitiesByDeal.get(deal.id) ?? [])
      .map((activity) => activity.body)
      .join(' ')
      .toLowerCase()
    if (activityText.includes(needle)) score += 8

    // 語の途中ではなく「単語の頭」で一致したものを上に出したいので、
    // 活動メモを単語に割ってから見ていく
    for (const word of activityText.split(/[^a-z0-9]+/)) {
      if (word.length < 3) continue
      if (word === needle) score += 4
      else if (word.startsWith(needle)) score += 2
    }

    if (score > 0) hits.push({ deal, score })
  }

  hits.sort((a, b) => b.score - a.score || a.deal.id.localeCompare(b.deal.id))

  console.log(
    `[compute] searchDeals "${filters.query}" ${hits.length}件 ${(performance.now() - startedAt).toFixed(0)}ms`,
  )
  return hits.map((hit) => hit.deal)
}
