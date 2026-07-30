interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  resultCount: number
}

/** 1文字打つたびに、そのまま検索が走る */
export default function SearchInput({ value, onChange, onSubmit, resultCount }: SearchInputProps) {
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
    </div>
  )
}
