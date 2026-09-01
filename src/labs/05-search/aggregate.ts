/**
 * 検索結果のカテゴリ別集計。
 *
 * before はこれをレンダー中にそのまま呼び、after は同じ関数を Web Worker から呼ぶ（6-6）。
 * どちらも中身は変えていない ＝「計算を速くしたのではなく、置き場所を変えた」ことが分かるようにしてある。
 */
import { CATEGORIES, CATEGORY_LABELS, type Category, type Product } from '../../data/products'
import { reviewsOf } from './reviews'

export interface CategorySummary {
  category: Category
  label: string
  count: number
  median: number
  /** 5,000円刻みの価格ヒストグラム（10段） */
  buckets: number[]
  topWords: { word: string; count: number }[]
}

export interface Aggregate {
  byCategory: CategorySummary[]
  topPairs: { pair: string; count: number }[]
  averageRating: number
  reviewCount: number
  elapsedMs: number
}

export function aggregateProducts(items: Product[]): Aggregate {
  const startedAt = performance.now()

  const prices = new Map<Category, number[]>()
  const wordsByCategory = new Map<Category, Map<string, number>>()
  const pairs = new Map<string, number>()
  let ratingSum = 0
  let reviewCount = 0

  for (const item of items) {
    const bucket = prices.get(item.category)
    if (bucket) bucket.push(item.price)
    else prices.set(item.category, [item.price])

    let words = wordsByCategory.get(item.category)
    if (!words) wordsByCategory.set(item.category, (words = new Map()))

    for (const review of reviewsOf(item.id)) {
      ratingSum += review.rating
      reviewCount++
      let previous = ''
      for (const word of review.body.toLowerCase().split(/[^a-z]+/)) {
        if (word.length < 4) continue
        words.set(word, (words.get(word) ?? 0) + 1)
        if (previous) {
          const pair = `${previous} ${word}`
          pairs.set(pair, (pairs.get(pair) ?? 0) + 1)
        }
        previous = word
      }
    }
  }

  const byCategory = CATEGORIES.map((category) => {
    const values = (prices.get(category) ?? []).slice().sort((a, b) => a - b)
    const buckets = new Array<number>(10).fill(0)
    for (const value of values) buckets[Math.min(9, Math.floor(value / 5_000))]++
    const words = wordsByCategory.get(category) ?? new Map<string, number>()
    return {
      category,
      label: CATEGORY_LABELS[category],
      count: values.length,
      median: values.length ? values[Math.floor(values.length / 2)] : 0,
      buckets,
      topWords: [...words.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([word, count]) => ({ word, count })),
    }
  })

  const elapsedMs = performance.now() - startedAt
  console.log(`[compute] aggregateProducts ${items.length}件 ${elapsedMs.toFixed(0)}ms`)

  return {
    byCategory,
    topPairs: [...pairs.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([pair, count]) => ({ pair, count })),
    averageRating: reviewCount ? ratingSum / reviewCount : 0,
    reviewCount,
    elapsedMs,
  }
}

export const EMPTY_AGGREGATE: Aggregate = {
  byCategory: [],
  topPairs: [],
  averageRating: 0,
  reviewCount: 0,
  elapsedMs: 0,
}
