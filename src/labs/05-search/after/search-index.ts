import { products, type Product } from '../../../data/products'
import { reviewsOf } from '../reviews'
import { matchesFilters, type Filters } from '../types'

/**
 * 転置索引。「単語 → その単語を含む商品の番号」を1回だけ作っておく。
 *
 * before が1打鍵ごとにやっていた
 *   ・全フィールドの連結と小文字化
 *   ・単語への分割
 *   ・編集距離の計算
 * を、すべて起動時の1回に寄せている。打鍵ごとの仕事は Map の引き当てだけになる。
 */
interface SearchIndex {
  byToken: Map<string, number[]>
  /** 前方一致で引くために、キーの一覧も持っておく */
  tokens: string[]
  /** 関連度の並べ替え用。小文字化も前処理に含めてしまう */
  lowerNames: string[]
}

function buildIndex(): SearchIndex {
  const startedAt = performance.now()
  const byToken = new Map<string, number[]>()
  const lowerNames: string[] = []

  products.forEach((product, index) => {
    const reviewText = reviewsOf(product.id)
      .map((review) => review.body)
      .join(' ')
    const text =
      `${product.name} ${product.sku} ${product.category} ${product.description} ${reviewText}`.toLowerCase()

    lowerNames.push(product.name.toLowerCase())

    const seen = new Set<string>()
    for (const word of text.split(/[^a-z0-9]+/)) {
      if (word.length < 2 || seen.has(word)) continue
      seen.add(word)
      const list = byToken.get(word)
      if (list) list.push(index)
      else byToken.set(word, [index])
    }
  })

  const tokens = [...byToken.keys()]
  console.log(
    `[compute] buildIndex ${tokens.length.toLocaleString()}語 ${(performance.now() - startedAt).toFixed(0)}ms（起動時の1回だけ）`,
  )
  return { byToken, tokens, lowerNames }
}

const index = buildIndex()

export function searchProducts(query: string, filters: Filters): Product[] {
  const startedAt = performance.now()
  const needle = query.trim().toLowerCase()

  let result: Product[]

  if (!needle) {
    result = products.filter((product) => matchesFilters(product, filters))
  } else {
    // 前方一致するキーだけを引き当てる。走査するのは商品ではなく単語（約16,000語）
    const matched = new Set<number>()
    for (const token of index.tokens) {
      if (!token.startsWith(needle)) continue
      for (const productIndex of index.byToken.get(token)!) matched.add(productIndex)
    }

    result = products.filter(
      (product, productIndex) => matched.has(productIndex) && matchesFilters(product, filters),
    )
    // 商品名に含まれるものを前に出す（前処理済みの小文字名を見るだけ）
    result.sort((a, b) => {
      const aHit = index.lowerNames[Number(a.id.slice(2)) - 1].includes(needle) ? 0 : 1
      const bHit = index.lowerNames[Number(b.id.slice(2)) - 1].includes(needle) ? 0 : 1
      return aHit - bHit
    })
  }

  console.log(
    `[compute] searchProducts "${query}" ${result.length}件 ${(performance.now() - startedAt).toFixed(1)}ms`,
  )
  return result
}
