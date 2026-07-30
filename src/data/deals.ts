/**
 * 08-capstone（案件管理「Shiba CRM」）の案件データ。
 *
 * products.ts と同じ方針で、シード付きの決定的PRNGから毎回まったく同じ列を生成する。
 * 案件名・顧客名・担当者が英語なのは、検索欄でIMEを挟まずに打鍵できるようにするため。
 *
 * 活動メモ（DealActivity）は約55,000件・合計およそ1,500万文字になる。検索が「案件の
 * フィールド＋ぶら下がる全メモ」を走査する設計なので、この文字数がそのまま走査コストになる。
 */
import { mulberry32 } from './products'

export const STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as const

export type Stage = (typeof STAGES)[number]

export const STAGE_LABELS: Record<Stage, string> = {
  lead: 'リード',
  qualified: '見込み',
  proposal: '提案中',
  negotiation: '交渉中',
  won: '受注',
  lost: '失注',
}

export const INDUSTRIES = [
  'Manufacturing', 'Retail', 'Logistics', 'Healthcare',
  'Finance', 'Education', 'Energy', 'Media',
] as const

export type Industry = (typeof INDUSTRIES)[number]

export const OWNERS = [
  'Mika Aoyama', 'Ren Fujita', 'Sara Klein', 'Tom Okabe',
  'Yui Nakano', 'Dan Rivera', 'Nao Kishi', 'Emma Barth',
  'Kota Serizawa', 'Lena Frost', 'Jun Maki', 'Leo Hirata',
] as const

export type Owner = (typeof OWNERS)[number]

export interface Deal {
  id: string
  /** 「顧客名＋案件の中身」。検索の主対象 */
  name: string
  accountName: string
  owner: Owner
  stage: Stage
  industry: Industry
  /** 円。KPIとチャートの集計対象 */
  amount: number
  /** 0〜100 の確度 */
  probability: number
  closeDate: string
  updatedAt: string
  activityCount: number
}

export const ACTIVITY_KINDS = ['call', 'meeting', 'email', 'note'] as const

export type ActivityKind = (typeof ACTIVITY_KINDS)[number]

export const ACTIVITY_KIND_LABELS: Record<ActivityKind, string> = {
  call: '電話',
  meeting: '商談',
  email: 'メール',
  note: 'メモ',
}

export interface DealActivity {
  id: string
  dealId: string
  kind: ActivityKind
  /** 2〜4文。全案件ぶんで約1,500万文字になる */
  body: string
  createdAt: string
}

const ACCOUNT_PREFIXES = [
  'Northwind', 'Arcadia', 'Belmont', 'Cascade', 'Dunmore', 'Everline',
  'Fairhaven', 'Granite', 'Harborview', 'Ironwood', 'Juniper', 'Kestrel',
  'Lakeside', 'Meridian', 'Norwood', 'Oakfield', 'Pinecrest', 'Quarry',
  'Redstone', 'Summit', 'Thornbury', 'Underhill', 'Vanguard', 'Westgate',
]

const ACCOUNT_SUFFIXES = [
  'Logistics', 'Industries', 'Systems', 'Partners', 'Holdings', 'Works',
  'Group', 'Labs', 'Supply', 'Networks', 'Foods', 'Materials',
]

const PROJECT_WORDS = [
  'Warehouse Automation', 'Platform Migration', 'Fleet Renewal', 'Store Rollout',
  'Data Consolidation', 'Line Retrofit', 'Support Contract', 'Pilot Program',
  'Regional Expansion', 'Compliance Upgrade', 'Inventory Overhaul', 'Onboarding Package',
]

const ACTIVITY_SENTENCES = [
  'Walked through the current approval flow with the operations lead and mapped where the delays pile up.',
  'They asked for a written comparison against the incumbent vendor before the steering meeting.',
  'Budget is confirmed for the fiscal year but the sign off moved to the regional director.',
  'Pilot ran for three weeks across two sites and the error rate dropped enough to be worth quoting.',
  'Procurement wants the security questionnaire returned before any pricing conversation continues.',
  'The technical contact is comfortable with the integration but worried about the migration window.',
  'Rescheduled the demo twice because their quarter close overlapped with our proposed date.',
  'Legal flagged the data retention clause and asked for a redline by the end of the month.',
  'Champion moved teams internally so we need to rebuild the relationship with the new owner.',
  'They compared us against two other vendors and we came out ahead on support response times.',
  'Volume is larger than the original scope so the discount tier needs to be recalculated.',
  'Asked for a reference customer in the same industry before committing to the next stage.',
  'Site survey found older hardware that will need replacing before the rollout can start.',
  'Finance approved the pilot budget but the full contract still needs board level sign off.',
  'The evaluation team liked the reporting but wants the export format changed to match theirs.',
  'Follow up call scheduled after their internal review wraps up at the end of next week.',
  'Stakeholders are aligned on the problem but not yet on how much of it to solve this year.',
  'Trial account was extended by a month so their second region could join the evaluation.',
]

function pick<T>(rand: () => number, list: readonly T[]): T {
  return list[Math.floor(rand() * list.length)]
}

export function generateDeals(count = 5_000, seed = 20260730): Deal[] {
  const rand = mulberry32(seed)
  const items: Deal[] = []
  const baseTime = Date.UTC(2026, 6, 30)

  for (let i = 0; i < count; i++) {
    const accountName = `${pick(rand, ACCOUNT_PREFIXES)} ${pick(rand, ACCOUNT_SUFFIXES)}`
    const stage = pick(rand, STAGES)

    items.push({
      id: `d-${String(i + 1).padStart(5, '0')}`,
      name: `${accountName} ${pick(rand, PROJECT_WORDS)}`,
      accountName,
      owner: pick(rand, OWNERS),
      stage,
      industry: pick(rand, INDUSTRIES),
      amount: (Math.floor(rand() * 1_960) + 40) * 10_000,
      probability: stage === 'won' ? 100 : stage === 'lost' ? 0 : Math.floor(rand() * 20) * 5,
      closeDate: new Date(baseTime + Math.floor(rand() * 180) * 86_400_000).toISOString(),
      updatedAt: new Date(baseTime - Math.floor(rand() * 90) * 86_400_000).toISOString(),
      // 実際に生成する件数と一致させるため、あとで上書きする
      activityCount: 0,
    })
  }

  return items
}

export function generateActivities(source: Deal[], seed = 20260731): DealActivity[] {
  const rand = mulberry32(seed)
  const items: DealActivity[] = []
  const baseTime = Date.UTC(2026, 6, 30)

  for (const deal of source) {
    const count = 6 + Math.floor(rand() * 11)
    for (let i = 0; i < count; i++) {
      const sentenceCount = 2 + Math.floor(rand() * 3)
      items.push({
        id: `${deal.id}-a${String(i + 1).padStart(2, '0')}`,
        dealId: deal.id,
        kind: pick(rand, ACTIVITY_KINDS),
        body: Array.from({ length: sentenceCount }, () => pick(rand, ACTIVITY_SENTENCES)).join(' '),
        createdAt: new Date(baseTime - Math.floor(rand() * 120) * 86_400_000).toISOString(),
      })
    }
    deal.activityCount = count
  }

  return items
}

/** 08-capstone 共通の 5,000 案件。モジュール読み込み時に一度だけ生成される */
export const deals: Deal[] = generateDeals()

/** 5,000 案件にぶら下がる約 55,000 件の活動メモ */
export const dealActivities: DealActivity[] = generateActivities(deals)

/** 案件ID → その案件の活動メモ。検索とドロワーの両方から引く */
export const activitiesByDeal: Map<string, DealActivity[]> = (() => {
  const map = new Map<string, DealActivity[]>()
  for (const activity of dealActivities) {
    const list = map.get(activity.dealId)
    if (list) list.push(activity)
    else map.set(activity.dealId, [activity])
  }
  return map
})()
