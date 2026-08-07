import { useState, type ReactNode } from 'react'
import { CATEGORIES, CATEGORY_LABELS } from '../../../data/products'
import { OWNERS, salesRows } from '../data'
import { Region } from '../RenderCountPanel'
import { PERIODS } from '../types'
import { useDashboardStore } from './store'

interface FilterPanelProps {
  children: ReactNode
}

/**
 * before はこのファイルの中で KpiRow / ChartPanel / TableRows を直接 import して
 * 描画していた。パネル自身が持つ入力途中の state（draft）が変わるたびに、
 * この JSX がまるごと作り直される構造になっていた。
 *
 * children として受け取る形にすると、その JSX を作るのは親（index.tsx）の仕事になる。
 * 親は draft を知らないので、打鍵しても children の要素は作り直されない ＝
 * メモ化を1つも書かずに、再描画の範囲がパネルの中だけに閉じる（4-3）。
 */
export default function FilterPanel({ children }: FilterPanelProps) {
  console.log('[render] FilterPanel')

  const filters = useDashboardStore((state) => state.filters)
  const setKeyword = useDashboardStore((state) => state.setKeyword)
  const setCategory = useDashboardStore((state) => state.setCategory)
  const setOwner = useDashboardStore((state) => state.setOwner)
  const setPeriod = useDashboardStore((state) => state.setPeriod)
  const setComparePeriod = useDashboardStore((state) => state.setComparePeriod)
  const setMinRevenue = useDashboardStore((state) => state.setMinRevenue)

  const [draft, setDraft] = useState(filters.keyword)

  const hitCount = salesRows.filter((row) =>
    row.name.toLowerCase().includes(draft.trim().toLowerCase()),
  ).length

  return (
    <div>
      <Region name="フィルタ">
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="toolbar" style={{ marginBottom: 8 }}>
            <input
              type="search"
              value={draft}
              placeholder="商品名 / SKU"
              style={{ width: 200 }}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setKeyword(draft)
              }}
            />
            <button className="button" onClick={() => setKeyword(draft)}>
              適用
            </button>
            <span className="muted">候補 {hitCount.toLocaleString()} 件</span>
          </div>

          <div className="toolbar">
            <select
              value={filters.category}
              onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number] | 'all')}
            >
              <option value="all">カテゴリ：すべて</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>

            <select
              value={filters.owner}
              onChange={(e) => setOwner(e.target.value)}
            >
              <option value="all">担当：すべて</option>
              {OWNERS.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>

            <select
              value={filters.period}
              onChange={(e) => setPeriod(e.target.value as (typeof PERIODS)[number]['id'])}
            >
              {PERIODS.map((period) => (
                <option key={period.id} value={period.id}>
                  対象：{period.label}
                </option>
              ))}
            </select>

            <select
              value={filters.comparePeriod}
              onChange={(e) => setComparePeriod(e.target.value as (typeof PERIODS)[number]['id'])}
            >
              {PERIODS.map((period) => (
                <option key={period.id} value={period.id}>
                  比較：{period.label}
                </option>
              ))}
            </select>

            <label className="toolbar" style={{ gap: 4 }}>
              <span className="muted">売上下限</span>
              <input
                type="number"
                step={1_000_000}
                value={filters.minRevenue}
                style={{ width: 120 }}
                onChange={(e) => setMinRevenue(Number(e.target.value))}
              />
            </label>
          </div>
        </div>
      </Region>

      {children}
    </div>
  )
}
