import type { Post } from '../../../data/posts'

interface PostCardProps {
  post: Post
  liked: boolean
  onLike: (id: string) => void
}

// before では memo() で包んでいたが、親から渡る onLike が毎回新しい参照だったため
// 実際には一度も効いていなかった（書き忘れ①）。
// Compiler は onLike の側を安定させたうえで、この JSX 自体もキャッシュする。
export default function PostCard({ post, liked, onLike }: PostCardProps) {
  const likeCount = post.likeCount + (liked ? 1 : 0)

  return (
    <article className="panel">
      <div className="toolbar" style={{ gap: 10 }}>
        <img src={post.avatarUrl} alt="" width={32} height={32} style={{ borderRadius: '50%' }} />
        <div>
          <div style={{ fontWeight: 600 }}>{post.authorName}</div>
          <div className="muted" style={{ fontSize: 12 }}>
            @{post.authorHandle} · {new Date(post.createdAt).toLocaleString('ja-JP')}
          </div>
        </div>
        {post.isFollowing && (
          <span className="badge" style={{ marginLeft: 'auto' }}>
            フォロー中
          </span>
        )}
      </div>

      <p style={{ margin: '10px 0' }}>{post.body}</p>

      {/*
        画像は before のまま。Compiler は画像の大きさには関与しないので、
        ここは Sec.8 まで遅いまま残る（`2-6` の締め・詳細は `4-3` / Sec.8）。
      */}
      {post.imageUrl && (
        <img src={post.imageUrl} alt="" style={{ width: '100%', borderRadius: 6, display: 'block' }} />
      )}

      <div className="toolbar" style={{ marginTop: 10 }}>
        <button
          className="button"
          style={liked ? { borderColor: 'var(--danger)', color: 'var(--danger)' } : undefined}
          onClick={() => onLike(post.id)}
        >
          {liked ? '♥' : '♡'} いいね {likeCount}
        </button>
        <span className="muted">コメント {post.commentCount}</span>
      </div>
    </article>
  )
}
