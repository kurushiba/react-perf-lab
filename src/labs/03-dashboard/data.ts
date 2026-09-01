/**
 * 03-dashboard（Shiba Analytics）のダッシュボードデータ。
 *
 * products.ts の商品カタログから 500 件ぶんの売上レコードを、
 * 同じ mulberry32 で決定的に導出する（実行のたびに同じ数字になる）。
 *
 * 500 という件数は Sec.5 の 10,000 行とは別物で、
 * 「1回の操作で再描画される範囲」を体感・実測できる下限として選んである。
 */

import { mulberry32, products, type Category } from '../../data/products'

export const ROW_COUNT = 500

export interface SalesRow {
  id: number
  name: string
  sku: string
  category: Category
  owner: string
  revenue: number
  orders: number
  /** 転換率（%） */
  conversion: number
  /** 前期比（%）。マイナスもある */
  growth: number
}

export const OWNERS = ['Aoki', 'Sato', 'Tanaka', 'Ueda', 'Mori', 'Nakano', 'Hara', 'Ishii']

export interface DailyPoint {
  /** MM/DD */
  label: string
  revenue: number
}

function generateSalesRows(): SalesRow[] {
  const rand = mulberry32(20260729)

  return products.slice(0, ROW_COUNT).map((product) => {
    const orders = Math.floor(rand() * 880) + 20
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      owner: OWNERS[Math.floor(rand() * OWNERS.length)],
      revenue: orders * product.price,
      orders,
      conversion: Math.round((rand() * 9 + 0.5) * 100) / 100,
      growth: Math.round((rand() * 80 - 30) * 10) / 10,
    }
  })
}

function generateDailySeries(): DailyPoint[] {
  const rand = mulberry32(731)
  const baseTime = Date.UTC(2026, 6, 29)

  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(baseTime - (29 - index) * 86_400_000)
    // 週末は落ちる、という業務データらしい起伏を付ける
    const weekendFactor = date.getUTCDay() === 0 || date.getUTCDay() === 6 ? 0.55 : 1
    return {
      label: `${date.getUTCMonth() + 1}/${date.getUTCDate()}`,
      revenue: Math.floor((rand() * 4_000_000 + 6_000_000) * weekendFactor),
    }
  })
}

/** 500 件の売上レコード。モジュール読み込み時に一度だけ生成される */
export const salesRows: SalesRow[] = generateSalesRows()

/** 直近30日の売上推移（チャートパネル用） */
export const dailySeries: DailyPoint[] = generateDailySeries()
