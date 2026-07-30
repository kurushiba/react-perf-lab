'use no memo'

import { memo } from 'react'

export interface Profile {
  name: string
  handle: string
  followingCount: number
}

export interface FollowedUser {
  id: string
  name: string
  handle: string
  avatarUrl: string
}

interface SidebarProps {
  profile: Profile
  following: FollowedUser[]
  unreadCount: number
}

function Sidebar({ profile, following, unreadCount }: SidebarProps) {
  console.log('[render] Sidebar')

  return (
    <aside style={{ display: 'grid', gap: 12, position: 'sticky', top: 12 }}>
      <div className="panel">
        <div className="toolbar" style={{ justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>通知</h3>
          <span className="badge" style={{ background: '#fdebe9', color: 'var(--danger)' }}>
            {unreadCount}
          </span>
        </div>
        <p className="muted" style={{ margin: '6px 0 0' }}>
          未読の反応があります
        </p>
      </div>

      <div className="panel">
        <h3>{profile.name}</h3>
        <div className="muted" style={{ fontSize: 12 }}>
          @{profile.handle}
        </div>
        <div style={{ marginTop: 6 }}>フォロー中 {profile.followingCount} 人</div>
      </div>

      <div className="panel">
        <h3>フォロー中</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {following.map((user) => (
            <li key={user.id} className="toolbar" style={{ gap: 8 }}>
              <img src={user.avatarUrl} alt="" width={24} height={24} style={{ borderRadius: '50%' }} />
              <span style={{ fontSize: 13 }}>{user.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

export default memo(Sidebar)
