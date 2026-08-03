import { useState } from 'react'

export default function RefInRenderFixed() {
  const [draft, setDraft] = useState('')
  const [reactions, setReactions] = useState(0)

  // 修正：props / state から計算できる値に ref は要らない。ただの定数にする。
  //   ref をレンダー中に読み書きするのは 04 と同じ「Reactの追跡外の値をいじる」行為で、
  //   キャッシュのつもりでも、Compiler から見れば最適化を諦める理由にしかならない。
  const lastDraft = draft.trim().toUpperCase()

  return (
    <div className="page">
      <h1>05 修正後：ref を使わず計算で出す</h1>
      <p className="muted">
        ref は「レンダーに関係しない値」を持つための道具。表示に使う値は state から計算する。
        この程度の整形なら、キャッシュするより毎回計算した方が速い。
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
          プレビュー: <strong>{lastDraft || '（未入力）'}</strong>
        </p>
      </div>
    </div>
  )
}
