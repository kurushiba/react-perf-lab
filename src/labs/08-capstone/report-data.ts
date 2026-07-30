import { deals, STAGES, STAGE_LABELS } from '../../data/deals'
import type { ChartSeries } from '../../vendor/shiba-charts'

/**
 * レポート画面に出す集計。before / after で同じものを使う（規約14）。
 * 5,000件を1回走査するだけなので、ここはボトルネックではない。
 */

/** ステージごとの金額合計（億円） */
export function buildStageSeries(): ChartSeries[] {
  const totals = new Map<string, number>()
  for (const deal of deals) {
    totals.set(deal.stage, (totals.get(deal.stage) ?? 0) + deal.amount)
  }
  return [
    {
      label: 'ステージ別金額（億円）',
      values: STAGES.map((stage) => Math.round((totals.get(stage) ?? 0) / 100_000_000)),
    },
  ]
}

export const STAGE_AXIS = STAGES.map((stage) => STAGE_LABELS[stage])

/** クローズ予定月（YYYY-MM）ごとの件数と金額 */
function forecastByMonth(): { months: string[]; counts: number[]; amounts: number[] } {
  const counts = new Map<string, number>()
  const amounts = new Map<string, number>()

  for (const deal of deals) {
    const month = deal.closeDate.slice(0, 7)
    counts.set(month, (counts.get(month) ?? 0) + 1)
    amounts.set(month, (amounts.get(month) ?? 0) + deal.amount)
  }

  const months = [...counts.keys()].sort()
  return {
    months,
    counts: months.map((month) => counts.get(month) ?? 0),
    amounts: months.map((month) => amounts.get(month) ?? 0),
  }
}

export const FORECAST_MONTHS: string[] = forecastByMonth().months

export function buildForecastSeries(): ChartSeries[] {
  const { counts, amounts } = forecastByMonth()
  return [
    { label: '件数', values: counts },
    { label: '金額（億円）', values: amounts.map((value) => Math.round(value / 100_000_000)) },
  ]
}
