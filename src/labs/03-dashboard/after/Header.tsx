import { useDashboardStore } from './store'

// 通知バッジだけを分けておくと、通知の増減で再描画されるのはこの小さな span だけになる。
// ヘッダー全体（ユーザー名・テーマ切替ボタン）は巻き込まれない
function NotificationBadge() {
  console.log('[render] NotificationBadge')

  const unreadCount = useDashboardStore((state) => state.unreadCount)

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

  // 選ぶのは「ユーザーとテーマ」だけ。フィルタが変わってもここは動かない
  const user = useDashboardStore((state) => state.user)
  const theme = useDashboardStore((state) => state.theme)
  // 更新関数はストアの中で定義が変わらないので、選んでも参照は常に同じ。
  // unreadCount を選んでいないので、通知が増えてもここは再描画されない
  const setTheme = useDashboardStore((state) => state.setTheme)
  const addNotification = useDashboardStore((state) => state.addNotification)
  const markAllRead = useDashboardStore((state) => state.markAllRead)

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
