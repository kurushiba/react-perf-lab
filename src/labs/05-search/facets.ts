/**
 * カテゴリ × 価格帯のクロス集計（6-5）。
 *
 * 索引を持たないので、1区画ぶんを出すたびに 10,000 件を最初から走査する。
 * FacetMatrix はこの関数を区画の数だけ呼ぶので、フィルタを1つ変えるだけで
 * 全区画の再計算がまとめて走る。
 *
 * before はこれが1本の長いタスクになり、after は startTransition によって
 * セルとセルの切れ目で中断できるようになる ＝「同じ仕事を、順番だけ変えた」ことが
 * トレースの上で読めるようにしてある。
 */
import { products, type Category } from '../../data/products'
import { reviewsOf } from './reviews'
import type { Filters } from './types'

/**
 * 注目キーワード。1件ごとに全文と突き合わせるので、
 * ここの語数がそのまま1区画あたりの処理時間になる（処理時間の調整つまみ）。
 */
export const FEATURED_KEYWORDS = [
  'stainless',
  'foldable',
  'insulated',
  'recycled',
  'portable',
  'ceramic',
  'bamboo',
  'titanium',
  'adjustable',
  'stackable',
  'lightweight',
  'compact',
]

export interface PriceBand {
  id: string
  label: string
  min: number
  max: number
}

/**
 * クロス集計の列。フィルタの価格帯（types.ts の PRICE_BANDS）とは別物で、
 * 内訳表として価格をほぼ4等分してある（各 2,400〜2,600 件）。
 * 区画ごとの件数が揃っていると、1セルあたりの処理時間も揃う。
 */
export const MATRIX_BANDS: PriceBand[] = [
  { id: 'q1', label: '〜12,000円', min: 0, max: 12_000 },
  { id: 'q2', label: '12,000〜24,000円', min: 12_000, max: 24_000 },
  { id: 'q3', label: '24,000〜36,000円', min: 24_000, max: 36_000 },
  { id: 'q4', label: '36,000円〜', min: 36_000, max: Number.MAX_SAFE_INTEGER },
]

export interface FacetSummary {
  count: number
  /** 注目キーワードに近い語を含む商品の数 */
  featured: number
  averageRating: number
}

/**
 * 編集距離。打ち間違いや表記ゆれを拾うために、キーワードと単語の距離を測る。
 * max を超えることが確定した時点で打ち切る。
 */
function distance(a: string, b: string, max: number): number {
  const alen = a.length
  const blen = b.length
  if (Math.abs(alen - blen) > max) return max + 1

  let previous = new Array<number>(blen + 1)
  let current = new Array<number>(blen + 1)
  for (let j = 0; j <= blen; j++) previous[j] = j

  for (let i = 1; i <= alen; i++) {
    current[0] = i
    for (let j = 1; j <= blen; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost)
    }
    const swap = previous
    previous = current
    current = swap
  }

  return previous[blen]
}

/**
 * 1区画（カテゴリ × 価格帯）ぶんの内訳。
 *
 * filters はオブジェクトのまま受け取る。`filters.stock` だけを渡す形にすると、
 * React Compiler が呼び出し側の依存を stock だけに絞ってしまい、
 * カテゴリを変えたときに再計算がスキップされてしまう。
 */
export function summarizeFacet(
  category: Category,
  band: PriceBand,
  filters: Filters,
): FacetSummary {
  let count = 0
  let featured = 0
  let ratingSum = 0
  let reviewCount = 0

  for (const product of products) {
    if (product.category !== category) continue
    if (product.price < band.min || product.price >= band.max) continue
    if (filters.stock === 'in' && product.stock === 0) continue
    if (filters.stock === 'out' && product.stock > 0) continue

    count++

    const reviews = reviewsOf(product.id)
    const reviewText = reviews.map((review) => review.body).join(' ')
    for (const review of reviews) {
      ratingSum += review.rating
      reviewCount++
    }

    // 商品情報とレビュー本文を毎回つなぎ直して、注目キーワードとの距離を測る
    const words = `${product.name} ${product.sku} ${product.description} ${reviewText}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)

    for (const keyword of FEATURED_KEYWORDS) {
      for (const word of words) {
        if (word.length < 3) continue
        if (distance(keyword, word, 2) <= 2) {
          featured++
          break
        }
      }
    }
  }

  return { count, featured, averageRating: reviewCount ? ratingSum / reviewCount : 0 }
}
