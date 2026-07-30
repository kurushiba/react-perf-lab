import { useEffect, useState } from 'react'
import { posts } from '../../../../data/posts'

const FEED = posts.slice(0, 5)

/**
 * 修正1：`Date.now()` をレンダー中に呼ばない。
 *   「今」は時間とともに変わる外部の値なので、引数として受け取る純粋関数にする。
 */
function relativeTime(iso: string, now: number): string {
  const minutes = Math.floor((now - new Date(iso).getTime()) / 60_000)
  if (minutes < 60) return `${minutes}分前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`
  return `${Math.floor(hours / 24)}日前`
}

export default function ImpureRenderFixed() {
  const [reactions, setReactions] = useState(0)

  // 修正2：モジュール変数のインクリメントは削除。
  //   レンダー回数を知りたいだけなら DevTools Profiler で数える。
  //   どうしても画面に出したいなら、こうして state として持つ（＝Reactが追跡できる値にする）。
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="page">
      <h1>01 修正後：レンダーを純粋に保つ</h1>
      <p className="muted">
        「今」を state として持つことで、同じ入力なら同じ出力を返す関数になった。
        Compiler がこの結果を再利用できる。
      </p>

      <div className="toolbar" style={{ marginBottom: 12 }}>
        <button className="button" onClick={() => setReactions((n) => n + 1)}>
          リアクション: {reactions}
        </button>
        <span className="muted">基準時刻: {new Date(now).toLocaleTimeString('ja-JP')}</span>
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
