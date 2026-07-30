/**
 * Vite 開発サーバ内に立てるモック API。
 *
 * データ取得の教材（07-fetch）では「Network パネルでウォーターフォールを読む」ことが
 * 学習の中心になる。遅延つき Promise を返すだけのモックだと Network タブに何も出ず、
 * StrictMode の二重実行も N+1 の本数も目視できないので、実 HTTP で応答させている。
 *
 * このファイルは教材内で唯一 setTimeout による遅延偽装を許可している場所。
 */
import type { Connect, Plugin, ViteDevServer, PreviewServer } from 'vite'
import type { ServerResponse } from 'node:http'
import { products, type Product } from '../src/data/products.ts'

/** 200〜600ms。id から決定的に決めるので、毎回同じ順序で応答が返る */
function latencyFor(key: string): number {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return 200 + (h % 401)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function json(res: ServerResponse, body: unknown, status = 200): void {
  const payload = JSON.stringify(body)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  // キャッシュの有無を教材側で制御したいので、サーバ側では常に無効化しておく
  res.setHeader('Cache-Control', 'no-store')
  res.end(payload)
}

/** 一覧に出す軽い形（詳細は別リクエストが要る、という設計にしてある） */
function toSummary(p: Product) {
  return {
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    price: p.price,
    stock: p.stock,
    thumbnailUrl: p.thumbnailUrl,
  }
}

/**
 * 詳細。relatedIds「だけ」を返すのがポイントで、
 * 関連商品の中身を出すにはもう1往復必要になる（＝直列ウォーターフォールが生まれる）。
 */
function toDetail(p: Product) {
  const index = Number(p.id.slice(2)) - 1
  const relatedIds = [1, 2, 3, 4].map(
    (offset) => products[(index + offset * 137) % products.length].id,
  )
  return { ...p, relatedIds }
}

function findById(id: string): Product | undefined {
  const index = Number(id.slice(2)) - 1
  return products[index]?.id === id ? products[index] : undefined
}

async function handle(req: Connect.IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = new URL(req.url ?? '/', 'http://localhost')
  if (!url.pathname.startsWith('/api/')) return false

  const path = url.pathname
  const query = url.searchParams

  // GET /api/products?page=0&size=50&q=mug
  if (path === '/api/products') {
    const page = Number(query.get('page') ?? 0)
    const size = Math.min(Number(query.get('size') ?? 50), 500)
    const q = (query.get('q') ?? '').toLowerCase()
    const source = q
      ? products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      : products

    await sleep(latencyFor(`products:${page}:${size}:${q}`))
    json(res, {
      page,
      size,
      total: source.length,
      hasMore: (page + 1) * size < source.length,
      items: source.slice(page * size, (page + 1) * size).map(toSummary),
    })
    return true
  }

  // GET /api/products/batch?ids=p-00001,p-00002   ← 09章 after で N+1 を潰すために使う
  if (path === '/api/products/batch') {
    const ids = (query.get('ids') ?? '').split(',').filter(Boolean)
    await sleep(latencyFor(`batch:${ids.length}`))
    json(
      res,
      ids.map((id) => findById(id)).filter((p): p is Product => Boolean(p)).map(toDetail),
    )
    return true
  }

  // GET /api/products/:id
  const detailMatch = /^\/api\/products\/(p-\d+)$/.exec(path)
  if (detailMatch) {
    const product = findById(detailMatch[1])
    if (!product) {
      await sleep(120)
      json(res, { message: 'not found' }, 404)
      return true
    }
    // 遅延を id から決めているので、「後から投げた方が先に返る」組み合わせが再現できる
    // （＝レースコンディションの教材が毎回同じように再現する）
    await sleep(latencyFor(product.id))
    json(res, toDetail(product))
    return true
  }

  // POST /api/products/:id/favorite   ← useOptimistic の題材
  const favoriteMatch = /^\/api\/products\/(p-\d+)\/favorite$/.exec(path)
  if (favoriteMatch && req.method === 'POST') {
    await sleep(latencyFor(`fav:${favoriteMatch[1]}`))
    json(res, { id: favoriteMatch[1], ok: true })
    return true
  }

  json(res, { message: `no mock handler for ${path}` }, 404)
  return true
}

const middleware: Connect.NextHandleFunction = (req, res, next) => {
  handle(req, res).then(
    (handled) => {
      if (!handled) next()
    },
    (error: unknown) => next(error),
  )
}

export function mockApi(): Plugin {
  return {
    name: 'react-perf-lab:mock-api',
    // dev（npm run dev）と preview（npm run preview）の両方で有効にする。
    // Lighthouse 計測は preview 上で行うため、preview 側も必須。
    configureServer(server: ViteDevServer) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use(middleware)
    },
  }
}
