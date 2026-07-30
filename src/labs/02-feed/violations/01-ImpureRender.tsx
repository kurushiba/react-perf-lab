import { useState } from 'react'
import { posts } from '../../../data/posts'

const FEED = posts.slice(0, 5)

let renderSerial = 0

function relativeTime(iso: string, now: number): string {
  const minutes = Math.floor((now - new Date(iso).getTime()) / 60_000)
  if (minutes < 60) return `${minutes}分前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`
  return `${Math.floor(hours / 24)}日前`
}

export default function ImpureRender() {
  const [reactions, setReactions] = useState(0)

  renderSerial += 1
  const now = Date.now()

  return (
    <div className="page">
      <h1>01 レンダー中に副作用を起こしている</h1>
      <p className="muted">
        投稿の相対時刻を表示するタイムライン。表示は合っているように見える。
      </p>

      <div className="toolbar" style={{ marginBottom: 12 }}>
        <button className="button" onClick={() => setReactions((n) => n + 1)}>
          リアクション: {reactions}
        </button>
        <span className="muted">この画面のレンダー通し番号: {renderSerial}</span>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {FEED.map((post) => (
          <div key={post.id} className="panel">
            <div className="toolbar" style={{ justifyContent: 'space-between' }}>
              <strong>{post.authorName}</strong>
              <span className="muted">{relativeTime(post.createdAt, now)}</span>
            </div>
            <p style={{ margin: '6px 0 0' }}>{post.body.slice(0, 90)}…</p>
          </div>
        ))}
      </div>
    </div>
  )
}
