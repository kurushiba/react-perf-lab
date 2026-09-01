/**
 * モック API のクライアント側ラッパ。
 * 実体は Vite サーバ内（plugins/mock-api.ts）にあり、ここからは普通の fetch で叩く。
 * ＝ DevTools の Network パネルにそのままリクエストが並ぶ。
 */
import type { Category, Product } from '../data/products'

export interface ProductSummary {
  id: number
  name: string
  sku: string
  category: Category
  price: number
  stock: number
  thumbnailUrl: string
}

export interface ProductDetail extends Product {
  relatedIds: number[]
}

export interface Page<T> {
  page: number
  size: number
  total: number
  hasMore: boolean
  items: T[]
}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(path, { signal })
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  return (await res.json()) as T
}

export function fetchProductPage(
  page: number,
  size = 50,
  options: { q?: string; signal?: AbortSignal } = {},
): Promise<Page<ProductSummary>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (options.q) params.set('q', options.q)
  return get(`/api/products?${params}`, options.signal)
}

export function fetchProductDetail(id: number, signal?: AbortSignal): Promise<ProductDetail> {
  return get(`/api/products/${id}`, signal)
}

/** 09章 after で N+1 を1リクエストに畳むためのエンドポイント */
export function fetchProductsBatch(ids: number[], signal?: AbortSignal): Promise<ProductDetail[]> {
  return get(`/api/products/batch?ids=${ids.join(',')}`, signal)
}

export async function toggleFavorite(id: number): Promise<{ id: number; ok: boolean }> {
  const res = await fetch(`/api/products/${id}/favorite`, { method: 'POST' })
  if (!res.ok) throw new Error(`${res.status} favorite`)
  return (await res.json()) as { id: number; ok: boolean }
}
