import { useState } from 'react'
import { notificationStore } from './notification-store'

function NotificationBadge() {
  const count = notificationStore.getSnapshot()

  return (
    <span className="badge" style={{ background: '#fdebe9', color: 'var(--danger)' }}>
      未読 {count}
    </span>
  )
}

export default function ExternalStore() {
  const [reactions, setReactions] = useState(0)

  return (
    <div className="page">
      <h1>04 レンダー中に外部の可変な値を読んでいる</h1>
      <p className="muted">
        通知バッジ。「通知を1件増やす」を押してもバッジは動かない。
        そのあと「リアクション」を押すと、たまった分がまとめて反映される。
      </p>

      <div className="toolbar" style={{ marginBottom: 12 }}>
        <button className="button" onClick={() => notificationStore.add()}>
          通知を1件増やす
        </button>
        <button className="button" onClick={() => notificationStore.reset()}>
          リセット
        </button>
        <button className="button" onClick={() => setReactions((n) => n + 1)}>
          リアクション: {reactions}
        </button>
      </div>

      <div className="panel">
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>Shibagram</h3>
          <NotificationBadge />
        </div>
      </div>
    </div>
  )
}
