import { ACTIVITY_KIND_LABELS, dealActivities, deals } from '../../data/deals'

/**
 * 活動履歴画面に出すマークダウン。before / after で同じものを使う（規約14）。
 * 直近の活動を案件ごとにまとめて1つの文書にする。
 */
export function buildActivityMarkdown(count = 12): string {
  const dealById = new Map(deals.map((deal) => [deal.id, deal]))
  const recent = [...dealActivities]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, count)

  const lines: string[] = ['# 直近の活動', '']

  for (const activity of recent) {
    const deal = dealById.get(activity.dealId)
    if (!deal) continue
    lines.push(
      `## ${deal.name}`,
      '',
      `**${ACTIVITY_KIND_LABELS[activity.kind]}** / ${activity.createdAt.slice(0, 10)} / 担当 *${deal.owner}*`,
      '',
      `> ${activity.body}`,
      '',
      `- 顧客: ${deal.accountName}`,
      `- 業種: ${deal.industry}`,
      '',
    )
  }

  return lines.join('\n')
}
