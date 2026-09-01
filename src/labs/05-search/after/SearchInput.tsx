import { useEffect, useRef, useState } from 'react'

interface SearchInputProps {
  onSearch: (value: string) => void
  onSubmit: (value: string) => void
  resultCount: number
}

/**
 * 入力値は自分で持つので、打鍵しても親は再レンダリングされない。
 * 親へ通知するのは、入力が 250ms 止まったときの1回だけ（debounce・6-4）。
 * 親が動く回数そのものが減るので、メモ化のキャッシュには一切依存していない。
 *
 * debounce と throttle の使い分け：
 *   debounce = 途中経過に意味がない処理向き（検索・入力補完）
 *   throttle = 途中経過にも意味がある処理向き（スクロール追従・リサイズ）
 */
export default function SearchInput({ onSearch, onSubmit, resultCount }: SearchInputProps) {
  const [text, setText] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // アンマウント後に通知が飛ばないよう、予約を後始末する
  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleChange = (value: string) => {
    setText(value)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSearch(value), 250)
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
    </div>
  )
}
