/**
 * 教材共通の商品データ。
 *
 * 巨大なリテラル配列を置くとリポジトリとエディタが重くなるので、
 * シード付きの決定的な擬似乱数から毎回まったく同じ列を生成する。
 * （計測値の再現性のために「実行のたびに同じデータ」であることが重要）
 */

export const CATEGORIES = [
  'kitchen',
  'tools',
  'outdoor',
  'stationery',
  'appliance',
  'storage',
  'pet',
  'lighting',
] as const

export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_LABELS: Record<Category, string> = {
  kitchen: 'キッチン',
  tools: '工具',
  outdoor: 'アウトドア',
  stationery: '文具',
  appliance: '家電',
  storage: '収納',
  pet: 'ペット',
  lighting: '照明',
}

export interface Product {
  /** 1 始まりの連番。配列の位置（0 始まり）とは別物なので、id から引くときは Map を作る */
  id: number
  name: string
  sku: string
  category: Category
  price: number
  stock: number
  /** 一覧の行の高さが揃わないよう、長さを 40〜260 字程度で散らしてある */
  description: string
  thumbnailUrl: string
  updatedAt: string
}

/** mulberry32: 32bit シードから決定的な 0〜1 の乱数列を作る（posts.ts など他のデータでも使う） */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const MATERIALS = [
  'Stainless', 'Bamboo', 'Ceramic', 'Silicone', 'Titanium', 'Walnut',
  'Acrylic', 'Copper', 'Linen', 'Recycled', 'Carbon', 'Enamel',
]

const ATTRIBUTES = [
  'Insulated', 'Foldable', 'Compact', 'Heavy-Duty', 'Lightweight', 'Wide-Mouth',
  'Non-Stick', 'Adjustable', 'Stackable', 'Portable', 'Reinforced', 'Slim',
]

const NOUNS: Record<Category, string[]> = {
  kitchen: ['Mug', 'Kettle', 'Frying Pan', 'Cutting Board', 'Storage Jar', 'Colander'],
  tools: ['Screwdriver Set', 'Wrench', 'Tape Measure', 'Utility Knife', 'Tool Bag', 'Clamp'],
  outdoor: ['Lantern', 'Camp Chair', 'Water Jug', 'Tarp', 'Cooler Box', 'Trekking Pole'],
  stationery: ['Notebook', 'Pen Case', 'Desk Organizer', 'File Box', 'Marker Set', 'Clipboard'],
  appliance: ['Air Purifier', 'Hand Blender', 'Desk Fan', 'Humidifier', 'Rice Cooker', 'Sealer'],
  storage: ['Storage Bin', 'Shelf Unit', 'Hanging Rack', 'Drawer Divider', 'Basket', 'Box'],
  pet: ['Pet Bowl', 'Leash', 'Grooming Brush', 'Pet Bed', 'Carrier Bag', 'Toy Set'],
  lighting: ['Desk Lamp', 'Floor Light', 'LED Strip', 'Pendant Light', 'Night Light', 'Work Light'],
}

const SIZES = ['S', 'M', 'L', 'XL', '480ml', '1.2L', '2.5L', '30cm', '45cm', '60cm']

const SENTENCES = [
  'Designed for daily use in small kitchens and shared offices.',
  'The surface is treated to resist scratches and fingerprints.',
  'Ships flat and assembles in under five minutes without tools.',
  'Tested for 20,000 open-close cycles by our quality team.',
  'Compatible with the rest of the Shiba modular series.',
  'Dishwasher safe on the top rack at temperatures below 60C.',
  'Replacement parts are stocked for at least seven years.',
  'Made from recycled material sourced within the same region.',
  'The grip is textured so it stays steady in wet hands.',
  'Comes with a two-year limited warranty and a spare gasket.',
  'Stacks neatly with the other sizes to save shelf space.',
  'Weight has been reduced by 18% compared with the previous model.',
]

function pick<T>(rand: () => number, list: readonly T[]): T {
  return list[Math.floor(rand() * list.length)]
}

export function generateProducts(count = 10_000, seed = 20260727): Product[] {
  const rand = mulberry32(seed)
  const items: Product[] = []
  const baseTime = Date.UTC(2026, 6, 27)

  for (let i = 0; i < count; i++) {
    const category = pick(rand, CATEGORIES)
    const name = [
      pick(rand, MATERIALS),
      pick(rand, ATTRIBUTES),
      pick(rand, NOUNS[category]),
      pick(rand, SIZES),
    ].join(' ')

    // 説明文は 1〜4 文。これで行の高さが 40〜120px の範囲でばらつく
    const sentenceCount = 1 + Math.floor(rand() * 4)
    const description = Array.from({ length: sentenceCount }, () => pick(rand, SENTENCES)).join(' ')

    items.push({
      id: i + 1,
      name,
      sku: `${category.slice(0, 3).toUpperCase()}-${String(Math.floor(rand() * 9000) + 1000)}-${String(i + 1).padStart(5, '0')}`,
      category,
      price: Math.floor(rand() * 47_700) + 300,
      // 1割ほどを在庫切れにして、フィルタの題材になるようにする
      stock: rand() < 0.1 ? 0 : Math.floor(rand() * 500) + 1,
      description,
      thumbnailUrl: `/images/thumbs/thumb-${String(i % 20).padStart(2, '0')}.png`,
      updatedAt: new Date(baseTime - Math.floor(rand() * 400) * 86_400_000).toISOString(),
    })
  }

  return items
}

/** 全ラボ共通の 10,000 件。モジュール読み込み時に一度だけ生成される */
export const products: Product[] = generateProducts()
