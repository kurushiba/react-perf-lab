import { SORT_OPTIONS, type SortKey } from '../types'
import { useFilterActions, useFilterValue } from './contexts'

export default function SortBar() {
  const { sort } = useFilterValue()
  const { setSort } = useFilterActions()

  // state を書き換えず、新しいオブジェクトを渡す（8-3）
  const changeSort = (key: SortKey) => setSort({ key })

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
