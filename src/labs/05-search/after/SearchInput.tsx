import { useEffect, useRef, useState } from 'react'

export type InputMode = 'deferred' | 'debounce'

interface SearchInputProps {
  onSearch: (value: string) => void
  onSubmit: (value: string) => void
  resultCount: number
  mode: InputMode
  onModeChange: (mode: InputMode) => void
  /** 表示中の結果が、いま入力されている検索語より古いかどうか */
  isStale: boolean
}

/**
 * 入力値は自分で持つので、打鍵しても親は再レンダリングされない。
 * 親へ「いつ通知するか」だけを mode で切り替えて比べられる。
 *
 * debounce（6-4）        = 止まるまで通知しない。親が動くのは最後の1回だけなので、
 *                          メモ化に頼らず検索の実行回数そのものが減る
 * useDeferredValue（6-6）= 即通知して、優先度の制御は親に任せる
 *
 * debounce と throttle の使い分け：
 *   debounce = 途中経過に意味がない処理向き（検索・入力補完）
 *   throttle = 途中経過にも意味がある処理向き（スクロール追従・リサイズ）
 */
export default function SearchInput({
  onSearch,
  onSubmit,
  resultCount,
  mode,
  onModeChange,
  isStale,
}: SearchInputProps) {
  const [text, setText] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // アンマウント後に通知が飛ばないよう、予約を後始末する
  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleChange = (value: string) => {
    setText(value)
    clearTimeout(timerRef.current)

    if (mode === 'debounce') {
      timerRef.current = setTimeout(() => onSearch(value), 250)
    } else {
      onSearch(value)
    }
  }

  return (
    <div className="toolbar" style={{ marginBottom: 12 }}>
      <input
        type="search"
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSubmit(text)
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
