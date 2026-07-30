import { useState, useSyncExternalStore } from 'react'
import { notificationStore } from '../notification-store'

function NotificationBadge() {
  // 修正：外部ストアは `useSyncExternalStore` で購読する。
  //   これで React が「いつ値が変わったか」を知れるようになり、
  //   Compiler もこの値を追跡できる依存として扱える。
  const count = useSyncExternalStore(notificationStore.subscribe, notificationStore.getSnapshot)

  return (
    <span className="badge" style={{ background: '#fdebe9', color: 'var(--danger)' }}>
      未読 {count}
    </span>
  )
}

export default function ExternalStoreFixed() {
  const [reactions, setReactions] = useState(0)

  return (
    <div className="page">
      <h1>04 修正後：useSyncExternalStore で購読する</h1>
      <p className="muted">「通知を1件増やす」を押した瞬間にバッジが動く。</p>

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
