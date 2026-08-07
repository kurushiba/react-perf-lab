import { useState } from 'react'
import { CATEGORY_LABELS } from '../../../data/products'
import { salesRows, type SalesRow } from '../data'
import { applyFilters, formatYen, SORT_COLUMNS } from '../types'
import { useDashboardStore } from './store'

interface TableRowProps {
  row: SalesRow
}

function TableRow({ row }: TableRowProps) {
  const [selected, setSelected] = useState(false)

  return (
    <div className="row" style={selected ? { background: 'var(--accent-weak)' } : undefined}>
      <input type="checkbox" checked={selected} onChange={(e) => setSelected(e.target.checked)} />
      <span className="row__main">
        <span className="row__name">{row.name}</span>
        <span className="row__sub">
          {row.sku} / {row.owner}
        </span>
      </span>
      <span className="badge">{CATEGORY_LABELS[row.category]}</span>
      <span className="row__num">{formatYen(row.revenue)}</span>
      <span className="row__num">{row.orders.toLocaleString()} 件</span>
      <span className="row__num" style={{ color: row.growth < 0 ? 'var(--danger)' : 'var(--ok)' }}>
        {row.growth > 0 ? '+' : ''}
        {row.growth.toFixed(1)} %
      </span>
      <input type="text" placeholder="メモ" style={{ width: 96 }} />
    </div>
  )
}

export default function TableRows() {
  console.log('[render] TableRows')

  const filters = useDashboardStore((state) => state.filters)
  const toggleSort = useDashboardStore((state) => state.toggleSort)

  // 絞り込んだ行は filters から導ける。セレクタで作って返すと毎回新しい配列になるので、
  // 選ぶのは filters だけにして、絞り込みはセレクタの外でやる
  const rows = applyFilters(salesRows, filters)

  return (
    <div>
      <div className="toolbar" style={{ marginBottom: 8, justifyContent: 'space-between' }}>
        <div className="toolbar">
          {SORT_COLUMNS.map((column) => (
            <button
              key={column.key}
              className="button"
              style={
                column.key === filters.sort.key
                  ? { borderColor: 'var(--accent)', color: 'var(--accent)' }
                  : undefined
              }
              onClick={() => toggleSort(column.key)}
            >
              {column.label}
              {column.key === filters.sort.key ? (filters.sort.desc ? ' ▼' : ' ▲') : ''}
            </button>
          ))}
        </div>
        <span className="muted">{rows.length.toLocaleString()} 件</span>
      </div>

      <div className="list-scroll">
        {/*
          key には安定した id を使う。index を使うと、並べ替えで行の位置が入れ替わったときに
          React が「同じ位置の同じ型」＝同じインスタンスとみなして再利用してしまい、
          行が持っていた state（チェック）とDOMの状態（メモ欄）が別の商品に付いてしまう（4-8 と同じ仕組み）。

          Sec.5 で仮想化するときも、この id をそのまま getItemKey に渡す（5-3）。
        */}
        {rows.map((row) => (
          <TableRow key={row.id} row={row} />
        ))}
      </div>
    </div>
  )
}
