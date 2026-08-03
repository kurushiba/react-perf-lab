import { useEffect, useState } from 'react'
import { posts } from '../../../../data/posts'

const FEED = posts.slice(0, 5)

/** 送信済みの閲覧ログ件数（本来はサーバーに送っている想定） */
let sentCount = 0

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

/**
 * 修正：副作用はレンダーの外（Effect）へ。
 *   レンダー関数は「同じ入力なら同じ出力を返す」だけの存在にしておく。
 *   消した行はなく、同じ2行を useEffect で包んで依存配列を [] にしただけ。
 */
export default function ImpureRenderFixed() {
  const [reactions, setReactions] = useState(0)

  useEffect(() => {
    sentCount += FEED.length
    console.log(`[analytics] 閲覧ログ送信 累計${sentCount}件`)
  }, [])

  return (
    <div className="page">
      <h1>01 修正後：レンダーを純粋に保つ</h1>
      <p className="muted">
        閲覧ログの送信をEffectに移したことで、同じ入力なら同じ出力を返す関数になった。
        リアクションを何回押しても、コンソールに新しいログは出ない。
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
