import { useState } from 'react'

let bookmarkCount = 3

function addBookmark(): void {
  bookmarkCount += 1
}

function BookmarkBadge() {
  return (
    <span className="badge" style={{ background: '#fdebe9', color: 'var(--danger)' }}>
      保存済み {bookmarkCount}
    </span>
  )
}

export default function GlobalVariable() {
  const [reactions, setReactions] = useState(0)

  return (
    <div className="page">
      <h1>04 レンダー中に外部の変数を読んでいる</h1>
      <p className="muted">
        保存件数バッジ。「保存する」を押してもバッジは動かない。
        そのあと「リアクション」を押すと、たまった分がまとめて反映される。
      </p>

      <div className="toolbar" style={{ marginBottom: 12 }}>
        <button className="button" onClick={addBookmark}>
          保存する
        </button>
        <button className="button" onClick={() => setReactions((n) => n + 1)}>
          リアクション: {reactions}
        </button>
      </div>

      <div className="panel">
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>Shibagram</h3>
          <BookmarkBadge />
        </div>
      </div>
    </div>
  )
}
