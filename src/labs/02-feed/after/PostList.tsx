import type { Post } from '../../../data/posts'
import PostCard from './PostCard'

interface PostListProps {
  posts: Post[]
  likes: Record<string, boolean>
  onLike: (id: string) => void
}

// before ではこのコンポーネントを memo() で包んでいたが、親から渡る onLike が
// 毎回新しい参照だったため一度も効いていなかった（書き忘れ①）。
// Compiler が onLike を安定させると、コメント入力のような無関係な更新では
// この一覧ごと再描画が止まる。
export default function PostList({ posts, likes, onLike }: PostListProps) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} liked={Boolean(likes[post.id])} onLike={onLike} />
      ))}
    </div>
  )
}
