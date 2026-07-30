/**
 * `HeavyCompute.tsx` の題材。40万件のログに対する多段集計。
 *
 * 遅さは setTimeout で作らない。実際に40万件を7回走査している。
 */
import { mulberry32 } from '../../../data/products'

export interface Sample {
  id: number
  category: string
  region: string
  value: number
  label: string
}

const CATEGORIES = ['kitchen', 'tools', 'outdoor', 'stationery', 'appliance', 'storage', 'pet', 'lighting']
const REGIONS = ['tokyo', 'osaka', 'sapporo', 'fukuoka', 'nagoya', 'sendai']
const LABEL_WORDS = [
  'stainless bottle refill', 'folding chair repair', 'ceramic mug set',
  'led strip install', 'storage bin stack', 'pet brush trial',
  'desk lamp swap', 'camp lantern night', 'cutting board oil',
  'tool bag restock', 'air purifier filter', 'water jug handle',
]

export interface AggregateResult {
  totalValue: number
  byCategory: { category: string; count: number; sum: number; median: number; p95: number }[]
  hotWords: { word: string; count: number }[]
  matchedRegions: { region: string; matched: number; median: number }[]
  crossTab: { key: string; count: number; average: number }[]
  duplicates: number
  elapsedMs: number
}

let cache: Sample[] | null = null

/** 40万件は初回アクセス時に一度だけ作る（生成コストと集計コストを混ぜないため） */
export function getSamples(): Sample[] {
  if (cache) return cache

  const rand = mulberry32(20260730)
  const samples: Sample[] = new Array(400_000)
  for (let i = 0; i < samples.length; i++) {
    samples[i] = {
      id: i,
      category: CATEGORIES[Math.floor(rand() * CATEGORIES.length)],
      region: REGIONS[Math.floor(rand() * REGIONS.length)],
      value: Math.floor(rand() * 50_000),
      label: `${LABEL_WORDS[Math.floor(rand() * LABEL_WORDS.length)]} ${i % 997}`,
    }
  }
  cache = samples
  return samples
}

export function aggregate(samples: Sample[], weight: number): AggregateResult {
  const startedAt = performance.now()

  // 1段目：カテゴリ別に集める
  const buckets = new Map<string, number[]>()
  let totalValue = 0
  for (const sample of samples) {
    const scored = sample.value * weight
    totalValue += scored
    const bucket = buckets.get(sample.category)
    if (bucket) bucket.push(scored)
    else buckets.set(sample.category, [scored])
  }

  // 2段目：カテゴリごとに並べ替えて中央値と p95 を出す
  const byCategory = [...buckets.entries()]
    .map(([category, values]) => {
      const sorted = values.slice().sort((a, b) => a - b)
      const sum = sorted.reduce((acc, value) => acc + value, 0)
      return {
        category,
        count: sorted.length,
        sum,
        median: sorted[Math.floor(sorted.length / 2)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
      }
    })
    .sort((a, b) => b.sum - a.sum)

  // 3段目：ラベルの語を全件ぶん数える
  const wordCounts = new Map<string, number>()
  for (const sample of samples) {
    for (const word of sample.label.split(' ')) {
      if (word.length < 4) continue
      wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1)
    }
  }
  const hotWords = [...wordCounts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // 4段目：上位カテゴリの語で全件を絞り込む（4フィールド走査）
  const needle = byCategory[0].category
  const matched = new Map<string, number>()
  for (const sample of samples) {
    const haystack = `${sample.category} ${sample.region} ${sample.label}`.toLowerCase()
    if (haystack.includes(needle)) {
      matched.set(sample.region, (matched.get(sample.region) ?? 0) + 1)
    }
  }

  // 5段目：地域×カテゴリのクロス集計
  const cross = new Map<string, { count: number; sum: number }>()
  for (const sample of samples) {
    const key = `${sample.region}|${sample.category}`
    const cell = cross.get(key)
    if (cell) {
      cell.count++
      cell.sum += sample.value
    } else {
      cross.set(key, { count: 1, sum: sample.value })
    }
  }
  const crossTab = [...cross.entries()]
    .map(([key, cell]) => ({ key, count: cell.count, average: cell.sum / cell.count }))
    .sort((a, b) => b.average - a.average)
    .slice(0, 6)

  // 6段目：地域ごとにも中央値を出す（カテゴリ別と同じことを別の軸で）
  const byRegion = new Map<string, number[]>()
  for (const sample of samples) {
    const bucket = byRegion.get(sample.region)
    if (bucket) bucket.push(sample.value)
    else byRegion.set(sample.region, [sample.value])
  }
  const regionMedians = new Map<string, number>()
  for (const [region, values] of byRegion) {
    const sorted = values.slice().sort((a, b) => a - b)
    regionMedians.set(region, sorted[Math.floor(sorted.length / 2)])
  }

  // 7段目：同一カテゴリ内で重複しているラベルを数える
  const seen = new Set<string>()
  let duplicates = 0
  for (const sample of samples) {
    const key = `${sample.category}|${sample.label}`
    if (seen.has(key)) duplicates++
    else seen.add(key)
  }

  const matchedRegions = [...matched.entries()]
    .map(([region, count]) => ({ region, matched: count, median: regionMedians.get(region) ?? 0 }))
    .sort((a, b) => b.matched - a.matched)

  const elapsedMs = performance.now() - startedAt
  console.log(`[compute] aggregate(400,000件) ${elapsedMs.toFixed(0)}ms`)

  return { totalValue, byCategory, hotWords, matchedRegions, crossTab, duplicates, elapsedMs }
}
