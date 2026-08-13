import { useState } from 'react'

interface SearchInputProps {
  onSearch: (value: string) => void
  onSubmit: (value: string) => void
  resultCount: number
}

/**
 * 入力値は自分で持っているので、打鍵しても再レンダリングされるのはこの中だけ。
 * ただし1文字打つたびに onSearch で親へ通知しているので、結局そのたびに検索が走る。
 */
export default function SearchInput({ onSearch, onSubmit, resultCount }: SearchInputProps) {
  const [text, setText] = useState('')

  const handleChange = (value: string) => {
    setText(value)
    onSearch(value)
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
