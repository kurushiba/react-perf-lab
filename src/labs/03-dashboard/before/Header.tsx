import { useAppContext } from './AppContext'

export default function Header() {
  console.log('[render] Header')

  const { user, theme, setTheme, unreadCount, addNotification, markAllRead } = useAppContext()

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
          <span
            className="badge"
            style={unreadCount > 0 ? { background: '#fdebe9', color: 'var(--danger)' } : undefined}
          >
            通知 {unreadCount}
          </span>
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
