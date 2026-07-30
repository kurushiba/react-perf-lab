/**
 * 02-feed / after — 手動メモ化をすべて削除し、React Compiler に委ねた版。
 *
 * before との差は「memo / useMemo / useCallback が1つも無いこと」だけで、
 * 画面の作りとロジックは等価。`vite.config.ts` の Compiler を有効にした状態で
 * DevTools を見ると、全コンポーネントに Memo ✨ が付く（2-6）。
 *
 * このファイルには 'use no memo' を付けない（付けると after が最適化されない）。
 */
import { useState } from 'react'
import { postComments, posts } from '../../../data/posts'
import { countByTab, POPULAR_THRESHOLD, type TabId } from '../filter'
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

  // before の useMemo は削除。tab が変わらない限り Compiler が結果を持ち回す。
  // 絞り込みはこのコンポーネントの中に直接書く（Compiler が式を追える形にしておく）
  const visiblePosts = posts.filter(
    (post) =>
      tab === 'all' ||
      (tab === 'following' && post.isFollowing) ||
      (tab === 'popular' && post.likeCount >= POPULAR_THRESHOLD) ||
      (tab === 'media' && post.imageUrl !== null),
  )

  // これは Compiler が入っても likes が変わるたびに必ず走る（4-3）。
  // メモ化は「2回目以降を飛ばす」技術で、1回の計算そのものは軽くならない。
  const stats = computeFeedStats(posts, postComments, likes)

  // before の useCallback は削除。関数の参照は Compiler が安定させる
  const handleLike = (id: string) => {
    setLikes((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSubmitComment = (text: string) => {
    setRecent((prev) => [text, ...prev].slice(0, 5))
    setUnreadCount((prev) => prev + 1)
    setDraft('')
  }

  // 子に渡さないローカル関数（before では useCallback が付いていた＝付けすぎ③）
  const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n))

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
