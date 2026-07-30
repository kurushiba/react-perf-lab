/** タブフィルタの定義。before / after で共有する（メモ化とは無関係の純粋な関数） */
import type { Post } from '../../data/posts'

export type TabId = 'all' | 'following' | 'popular' | 'media'

export const POPULAR_THRESHOLD = 300

export function filterPosts(posts: Post[], tab: TabId): Post[] {
  switch (tab) {
    case 'following':
      return posts.filter((post) => post.isFollowing)
    case 'popular':
      return posts.filter((post) => post.likeCount >= POPULAR_THRESHOLD)
    case 'media':
      return posts.filter((post) => post.imageUrl !== null)
    default:
      return posts
  }
}

export function countByTab(posts: Post[]): Record<TabId, number> {
  return {
    all: posts.length,
    following: filterPosts(posts, 'following').length,
    popular: filterPosts(posts, 'popular').length,
    media: filterPosts(posts, 'media').length,
  }
}
