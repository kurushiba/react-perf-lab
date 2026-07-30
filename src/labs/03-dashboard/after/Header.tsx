import { useNotificationActions, useUnreadCount, useUser, useUserActions } from './contexts'

// 通知バッジだけを分けておくと、通知の増減で再描画されるのはこの小さな span だけになる。
// ヘッダー全体（ユーザー名・テーマ切替ボタン）は巻き込まれない
function NotificationBadge() {
  console.log('[render] NotificationBadge')

  const unreadCount = useUnreadCount()

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

  // 購読するのは「ユーザーとテーマ」だけ。フィルタが変わってもここは動かない
  const { user, theme } = useUser()
  const { setTheme } = useUserActions()
  // 更新関数だけの Context は参照が変わらないので、通知が増えてもここは再描画されない
  const { addNotification, markAllRead } = useNotificationActions()

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
