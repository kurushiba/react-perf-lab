export type InputMode = 'deferred' | 'debounce'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  resultCount: number
  mode: InputMode
  onModeChange: (mode: InputMode) => void
  /** 表示中の結果が、いま入力されている検索語より古いかどうか */
  isStale: boolean
}

/**
 * 入力欄そのものは常に最優先で更新される。
 * 「結果をいつ作り直すか」を debounce（6-4）と useDeferredValue（6-6）で切り替えて比べられる。
 */
export default function SearchInput({
  value,
  onChange,
  onSubmit,
  resultCount,
  mode,
  onModeChange,
  isStale,
}: SearchInputProps) {
  return (
    <div className="toolbar" style={{ marginBottom: 12 }}>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSubmit(value)
        }}
        placeholder="商品名・SKU・説明・レビューを検索（例：stainless）"
        style={{ width: 360 }}
      />
      <span className="muted">{resultCount.toLocaleString()} 件</span>

      <span className="muted">｜結果の作り直し：</span>
      <label>
        <input
          type="radio"
          name="input-mode"
          checked={mode === 'deferred'}
          onChange={() => onModeChange('deferred')}
        />{' '}
        useDeferredValue
      </label>
      <label>
        <input
          type="radio"
          name="input-mode"
          checked={mode === 'debounce'}
          onChange={() => onModeChange('debounce')}
        />{' '}
        debounce 250ms
      </label>

      {isStale && <span className="muted">更新中…</span>}
    </div>
  )
}
