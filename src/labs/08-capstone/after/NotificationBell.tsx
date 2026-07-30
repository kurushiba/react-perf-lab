import { useSyncExternalStore } from 'react'
import { notificationStore } from '../notification-store'
import { BELL_ICON, icon } from '../icons'

/**
 * Reactの外にあるストアは useSyncExternalStore で購読する（10-3）。
 * レンダー中に getSnapshot() を直接呼ぶと、値は読めても更新に気付けない。
 */
export default function NotificationBell() {
  const count = useSyncExternalStore(notificationStore.subscribe, notificationStore.getSnapshot)

  return (
    <span className="toolbar" style={{ gap: 6 }}>
      <span
        style={{ verticalAlign: 'middle' }}
        dangerouslySetInnerHTML={{ __html: icon(BELL_ICON, 16) }}
      />
      <span className="badge">{count}</span>
      <button className="button" onClick={() => notificationStore.add()}>
        通知を追加
      </button>
      <button className="button" onClick={() => notificationStore.markAllRead()}>
        既読にする
      </button>
    </span>
  )
}
