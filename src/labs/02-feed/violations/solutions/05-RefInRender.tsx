import { useState } from 'react'

export default function RefInRenderFixed() {
  const [draft, setDraft] = useState('')
  const [reactions, setReactions] = useState(0)

  // 修正1：props / state から計算できる値に ref は要らない。ただの定数にする。
  const lastDraft = draft.trim().toUpperCase()

  // 修正2：レンダー回数の表示は削除した。
  //   ref をレンダー中に書き換えるのは 04 と同じ「Reactの追跡外の値をいじる」行為で、
  //   回数を知りたいだけなら DevTools Profiler で数えれば足りる。

  return (
    <div className="page">
      <h1>05 修正後：ref を使わず計算で出す</h1>
      <p className="muted">
        ref は「レンダーに関係しない値」を持つための道具。表示に使う値は state から計算する。
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
