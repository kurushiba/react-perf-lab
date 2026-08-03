import { useState } from 'react'

function BookmarkBadge({ count }: { count: number }) {
  return (
    <span className="badge" style={{ background: '#fdebe9', color: 'var(--danger)' }}>
      保存済み {count}
    </span>
  )
}

export default function GlobalVariableFixed() {
  // 修正：モジュールスコープの変数をやめ、state として持つ。
  //   「値が変わったら再レンダリングしてほしい」はまさに state の仕事。
  const [count, setCount] = useState(3)
  const [reactions, setReactions] = useState(0)

  return (
    <div className="page">
      <h1>04 修正後：state として持つ</h1>
      <p className="muted">「保存する」を押した瞬間にバッジが動く。</p>

      <div className="toolbar" style={{ marginBottom: 12 }}>
        <button className="button" onClick={() => setCount((c) => c + 1)}>
          保存する
        </button>
        <button className="button" onClick={() => setReactions((n) => n + 1)}>
          リアクション: {reactions}
        </button>
      </div>

      <div className="panel">
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>Shibagram</h3>
          <BookmarkBadge count={count} />
        </div>
      </div>
    </div>
  )
}
