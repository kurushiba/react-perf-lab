import { notificationStore } from '../notification-store'
import { BELL_ICON, icon } from '../icons'

export default function NotificationBell() {
  const count = notificationStore.getSnapshot()

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
