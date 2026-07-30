/**
 * 商品レビュー。検索の対象は商品そのものだけではない、という業務アプリらしさを出すためのデータ。
 *
 * products.ts と同じく、シード付きの決定的な擬似乱数から毎回まったく同じ列を生成する。
 * 全部で約 19,700 件・約 3.8M 文字あり、これが「素朴な全件走査」を重くしている実体。
 */
import { mulberry32, products } from '../../data/products'

export interface Review {
  id: string
  productId: string
  rating: number
  body: string
}

const OPENERS = [
  'Bought this for the office kitchen and it has held up better than expected.',
  'Arrived two days early and the packaging was completely recyclable.',
  'The build quality feels solid, though the finish scratches more than I hoped.',
  'Replaced a cheaper model that lasted only four months, and the difference is obvious.',
  'Using it every morning for about six weeks now with no complaints.',
  'The instructions were thin, but assembly was still straightforward.',
]

const BODIES = [
  'The handle stays cool even after a long session, which was the deciding factor for me.',
  'Cleaning takes seconds because nothing gets trapped in the seams.',
  'It stacks with the smaller size, so the cupboard finally looks organised.',
  'Weight is noticeable when carrying it around the garden, so keep that in mind.',
  'Colour matches the photos almost exactly under warm lighting.',
  'The lid seals tightly enough that nothing spilled during the commute.',
  'Battery life is fine for a week of light use, less if you leave it running.',
  'Support answered within a day and sent a replacement gasket free of charge.',
]

const CLOSERS = [
  'Would order again for the second office.',
  'Recommended if you value durability over price.',
  'Four stars because the price crept up since last year.',
  'Not perfect, but easily the best in this range.',
  'Happy with the purchase overall.',
]

function pick<T>(rand: () => number, list: readonly T[]): T {
  return list[Math.floor(rand() * list.length)]
}

function generateReviews(): Map<string, Review[]> {
  const rand = mulberry32(778_899)
  const byProduct = new Map<string, Review[]>()

  for (const product of products) {
    // 0〜4件。レビューが1件も無い商品もある
    const count = Math.floor(rand() * 5)
    if (count === 0) continue
    const list: Review[] = []
    for (let i = 0; i < count; i++) {
      list.push({
        id: `${product.id}-r${i}`,
        productId: product.id,
        rating: 1 + Math.floor(rand() * 5),
        body: `${pick(rand, OPENERS)} ${pick(rand, BODIES)} ${pick(rand, CLOSERS)}`,
      })
    }
    byProduct.set(product.id, list)
  }

  return byProduct
}

export const reviewsByProduct: Map<string, Review[]> = generateReviews()

const NO_REVIEWS: Review[] = []

export function reviewsOf(productId: string): Review[] {
  return reviewsByProduct.get(productId) ?? NO_REVIEWS
}

export const totalReviewCount: number = [...reviewsByProduct.values()].reduce(
  (sum, list) => sum + list.length,
  0,
)
