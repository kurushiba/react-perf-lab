import { useRef, useState } from 'react'

export default function RefInRender() {
  const [draft, setDraft] = useState('')
  const [reactions, setReactions] = useState(0)

  const lastInput = useRef('')
  const lastDraft = useRef('')

  // draft が変わったときだけ整形し直して、結果を ref に取っておく（つもり）
  if (lastInput.current !== draft) {
    lastInput.current = draft
    lastDraft.current = draft.trim().toUpperCase()
  }

  return (
    <div className="page">
      <h1>05 レンダー中に ref を読み書きしている</h1>
      <p className="muted">
        コメント下書き欄。毎回整形し直すのがもったいない気がして、draft が変わったときだけ整形して
        結果を ref に取っておいている。
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
      </div>
    </div>
  )
}
