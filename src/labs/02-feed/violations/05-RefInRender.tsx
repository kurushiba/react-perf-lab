import { useRef, useState } from 'react'

export default function RefInRender() {
  const [draft, setDraft] = useState('')
  const [reactions, setReactions] = useState(0)

  const renderCount = useRef(0)
  const lastDraft = useRef('')

  renderCount.current += 1
  lastDraft.current = draft.trim().toUpperCase()

  return (
    <div className="page">
      <h1>05 レンダー中に ref を読み書きしている</h1>
      <p className="muted">
        コメント下書き欄。デバッグのつもりで置いたレンダー回数の表示が、そのまま残っている。
      </p>

      <div className="toolbar" style={{ marginBottom: 12 }}>
        <input
          type="text"
          value={draft}
          placeholder="コメントの下書き"
          onChange={(e) => setDraft(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="button" onClick={() => setReactions((n) => n + 1)}>
          リアクション: {reactions}
        </button>
      </div>

      <div className="panel">
        <p style={{ margin: 0 }}>
          プレビュー: <strong>{lastDraft.current || '（未入力）'}</strong>
        </p>
        <p className="muted" style={{ margin: '6px 0 0' }}>
          このコンポーネントのレンダー回数: {renderCount.current}
        </p>
      </div>
    </div>
  )
}
