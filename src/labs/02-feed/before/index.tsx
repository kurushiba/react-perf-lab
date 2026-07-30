'use no memo'

import { useCallback, useMemo, useState } from 'react'
import { postComments, posts } from '../../../data/posts'
import { countByTab, filterPosts, type TabId } from '../filter'
import { computeFeedStats } from '../stats'
import CommentBox from './CommentBox'
import Header from './Header'
import PostList from './PostList'
import Sidebar, { type FollowedUser } from './Sidebar'
import TabFilter from './TabFilter'

const TAB_COUNTS = countByTab(posts)

const FOLLOWING: FollowedUser[] = posts
  .filter((post) => post.isFollowing)
  .slice(0, 6)
  .map((post) => ({
    id: post.authorId,
    name: post.authorName,
    handle: post.authorHandle,
    avatarUrl: post.avatarUrl,
  }))

export default function FeedApp() {
  const [tab, setTab] = useState<TabId>('all')
  const [likes, setLikes] = useState<Record<string, boolean>>({})
  const [draft, setDraft] = useState('')
  const [recent, setRecent] = useState<string[]>([])
  const [unreadCount, setUnreadCount] = useState(12)

  const visiblePosts = useMemo(() => filterPosts(posts, tab), [tab])

  const stats = computeFeedStats(posts, postComments, likes)

  const handleLike = (id: string) => {
    setLikes((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSubmitComment = useCallback((text: string) => {
    setRecent((prev) => [text, ...prev].slice(0, 5))
    setUnreadCount((prev) => prev + 1)
    setDraft('')
  }, [])

  const formatCount = useCallback(
    (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)),
    [],
  )

  return (
    <div className="page" style={{ maxWidth: 1120 }}>
      <Header stats={stats} visibleCount={visiblePosts.length} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 260px',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <div>
          <TabFilter tab={tab} onChange={setTab} counts={TAB_COUNTS} />

          <CommentBox
            value={draft}
            onChange={setDraft}
            onSubmit={handleSubmitComment}
            recent={recent}
          />

          <p className="muted" style={{ margin: '0 0 12px' }}>
            いいね {formatCount(stats.totalLikes)} / コメント {formatCount(stats.totalComments)}
          </p>

          <PostList posts={visiblePosts} likes={likes} onLike={handleLike} />
        </div>

        <Sidebar
          profile={{ name: 'Shiba Taro', handle: 'shiba_taro', followingCount: FOLLOWING.length }}
          following={FOLLOWING}
          unreadCount={unreadCount}
        />
      </div>
    </div>
  )
}
