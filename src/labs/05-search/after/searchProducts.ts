import { products, type Product } from '../../../data/products'
import { reviewsOf } from '../reviews'
import { matchesFilters, type Filters } from '../types'

/**
 * 編集距離。打ち間違いを拾うために、検索語と単語の距離を測る。
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
 * 商品名・SKU・カテゴリ・説明文・レビュー本文を対象にした検索。
 *
 * before の searchProducts.ts と1文字も違わない。Sec.6 で変えたのは
 * 「この関数をいつ走らせるか」「どこで走らせるか」だけで、関数の中身には手を触れていない。
 * 索引を持たないので、1打鍵ごとに 10,000 件すべてを走査してスコアを付け直す。
 */
export function searchProducts(query: string, filters: Filters): Product[] {
  const startedAt = performance.now()
  const needle = query.trim().toLowerCase()

  const hits: { product: Product; score: number }[] = []

  for (const product of products) {
    if (!matchesFilters(product, filters)) continue
    if (!needle) {
      hits.push({ product, score: 0 })
      continue
    }

    const reviewText = reviewsOf(product.id)
      .map((review) => review.body)
      .join(' ')

    let score = 0
    if (product.name.toLowerCase().includes(needle)) score += 100
    if (product.sku.toLowerCase().includes(needle)) score += 60
    if (product.category.toLowerCase().includes(needle)) score += 40
    if (product.description.toLowerCase().includes(needle)) score += 12
    if (reviewText.toLowerCase().includes(needle)) score += 6

    // 打ち間違いも拾えるように、全フィールドの単語と検索語の距離を見る
    if (needle.length >= 3) {
      const haystack =
        `${product.name} ${product.sku} ${product.category} ${product.description} ${reviewText}`.toLowerCase()
      for (const word of haystack.split(/[^a-z0-9]+/)) {
        if (word.length < 3) continue
        const d = distance(needle, word, 2)
        if (d <= 2) score += 6 - d * 2
      }
    }

    if (score > 0) hits.push({ product, score })
  }

  hits.sort((a, b) => b.score - a.score || a.product.id - b.product.id)

  console.log(
    `[compute] searchProducts "${query}" ${hits.length}件 ${(performance.now() - startedAt).toFixed(0)}ms`,
  )
  return hits.map((hit) => hit.product)
}
