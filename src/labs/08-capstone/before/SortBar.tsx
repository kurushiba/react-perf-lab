import { SORT_OPTIONS, type SortKey, type SortState } from '../types'

interface SortBarProps {
  sort: SortState
  onSortChange: (next: SortState) => void
}

export default function SortBar({ sort, onSortChange }: SortBarProps) {
  const changeSort = (key: SortKey) => {
    sort.key = key
    onSortChange(sort)
  }

  return (
    <div className="toolbar">
      <span className="muted">並べ替え</span>
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.key}
          className="button"
          onClick={() => changeSort(option.key)}
          style={
            sort.key === option.key
              ? { borderColor: 'var(--accent)', color: 'var(--accent)' }
              : undefined
          }
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
