import { useState } from 'react'
import { posts } from '../../../../data/posts'

const FEED = posts.slice(0, 5)

/** 送信済みの閲覧ログ件数（本来はサーバーに送っている想定） */
let sentCount = 0

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

export default function ImpureRender() {
  const [reactions, setReactions] = useState(0)

  // ❌ レンダー中に閲覧ログを送っている（副作用＋モジュール変数の再代入）
  sentCount += FEED.length
  console.log(`[analytics] 閲覧ログ送信 累計${sentCount}件`)

  return (
    <div className="page">
      <h1>01 レンダー中に閲覧ログを送っている</h1>
      <p className="muted">
        投稿のタイムライン。表示は合っているように見える。
        開発者ツールのコンソールを開いた状態で「リアクション」を押してみてほしい。
      </p>

      <div className="toolbar" style={{ marginBottom: 12 }}>
        <button className="button" onClick={() => setReactions((n) => n + 1)}>
          リアクション: {reactions}
        </button>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {FEED.map((post) => (
          <div key={post.id} className="panel">
            <div className="toolbar" style={{ justifyContent: 'space-between' }}>
              <strong>{post.authorName}</strong>
              <span className="muted">{formatTime(post.createdAt)}</span>
            </div>
            <p style={{ margin: '6px 0 0' }}>{post.body.slice(0, 90)}…</p>
          </div>
        ))}
      </div>
    </div>
  )
}
