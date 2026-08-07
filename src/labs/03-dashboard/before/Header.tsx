import { useAppContext } from './AppContext'

// 通知バッジは切り出してあるが、値の取得先は Header 本体と同じ AppContext。
// 1つの Context を丸ごと購読している以上、分けても巻き添えは避けられない（4-5）
function NotificationBadge() {
  console.log('[render] NotificationBadge')

  const { unreadCount } = useAppContext()

  return (
    <span
      className="badge"
      style={unreadCount > 0 ? { background: '#fdebe9', color: 'var(--danger)' } : undefined}
    >
      通知 {unreadCount}
    </span>
  )
}

export default function Header() {
  console.log('[render] Header')

  const { user, theme, setTheme, addNotification, markAllRead } = useAppContext()

  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <div className="toolbar">
          <h2>Shiba Analytics</h2>
          <span className="badge">{user.team}</span>
          <span className="muted">
            {user.name}（{user.role}）
          </span>
        </div>

        <div className="toolbar">
          <NotificationBadge />
          <button className="button" onClick={addNotification}>
            通知を受け取る
          </button>
          <button className="button" onClick={markAllRead}>
            既読にする
          </button>
          <button
            className="button"
            onClick={() => setTheme(theme === 'light' ? 'contrast' : 'light')}
          >
            テーマ切替（{theme === 'light' ? '標準' : '高コントラスト'}）
          </button>
        </div>
      </div>
    </div>
  )
}
