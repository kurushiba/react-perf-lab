import { CATEGORY_LABELS } from '../../../data/products';
import type { SalesRow } from '../data';
import { formatYen, SORT_COLUMNS } from '../types';
import { useAppContext } from './AppContext';

interface TableRowProps {
  row: SalesRow;
  selected: Record<number, boolean>;
  onToggle: (id: number) => void;
}

function TableRow({ row, selected, onToggle }: TableRowProps) {
  const checked = Boolean(selected[row.id]);

  return (
    <div
      className="row"
      style={checked ? { background: 'var(--accent-weak)' } : undefined}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(row.id)}
      />
      <span className="row__main">
        <span className="row__name">{row.name}</span>
        <span className="row__sub">
          {row.sku} / {row.owner}
        </span>
      </span>
      <span className="badge">{CATEGORY_LABELS[row.category]}</span>
      <span className="row__num">{formatYen(row.revenue)}</span>
      <span className="row__num">{row.orders.toLocaleString()} 件</span>
      <span
        className="row__num"
        style={{ color: row.growth < 0 ? 'var(--danger)' : 'var(--ok)' }}
      >
        {row.growth > 0 ? '+' : ''}
        {row.growth.toFixed(1)} %
      </span>
      <input type="text" placeholder="メモ" style={{ width: 96 }} />
    </div>
  );
}

export default function TableRows() {
  console.log('[render] TableRows');

  const { rows, filters, toggleSort, selected, toggleSelected } =
    useAppContext();

  return (
    <div>
      <div
        className="toolbar"
        style={{ marginBottom: 8, justifyContent: 'space-between' }}
      >
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
              {column.key === filters.sort.key
                ? filters.sort.desc
                  ? ' ▼'
                  : ' ▲'
                : ''}
            </button>
          ))}
        </div>
        <span className="muted">{rows.length.toLocaleString()} 件</span>
      </div>

      <div className="list-scroll">
        {rows.map((row) => (
          <TableRow
            key={row.id}
            row={row}
            selected={selected}
            onToggle={toggleSelected}
          />
        ))}
      </div>
    </div>
  );
}
