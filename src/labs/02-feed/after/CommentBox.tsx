interface CommentBoxProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  recent: string[]
}

// before の memo() + 親側の useCallback は、この規模では Compiler が同じことをする。
export default function CommentBox({ value, onChange, onSubmit, recent }: CommentBoxProps) {
  return (
    <div className="panel" style={{ marginBottom: 12 }}>
      <div className="toolbar">
        <input
          type="text"
          value={value}
          placeholder="コメントを書く（1文字ずつ打って再描画を観察する）"
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="button" onClick={() => value.trim() && onSubmit(value)}>
          投稿
        </button>
      </div>

      {recent.length > 0 && (
        <ul style={{ margin: '10px 0 0', paddingLeft: 18 }} className="muted">
          {recent.map((text, index) => (
            <li key={`${text}-${index}`}>{text}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
