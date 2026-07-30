'use no memo'

import { memo } from 'react'
import type { Post } from '../../../data/posts'
import PostCard from './PostCard'

interface PostListProps {
  posts: Post[]
  likes: Record<string, boolean>
  onLike: (id: string) => void
}

function PostList({ posts, likes, onLike }: PostListProps) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} liked={Boolean(likes[post.id])} onLike={onLike} />
      ))}
    </div>
  )
}

export default memo(PostList)
