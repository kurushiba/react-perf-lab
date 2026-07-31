/**
 * ヘッダーに出すフィード全体の統計。before / after で共有する。
 *
 * 中身は本物の集計処理：全投稿と全コメント（約2,400件）のテキストを走査し、
 * 投稿どうしの語の重なりから「話題になっている投稿」を出している。
 * ＝ React Compiler を有効にしても、入力が変われば必ずこの時間はかかる（4-3）。
 */
import type { Post, PostComment } from '../../data/posts'

export interface FeedStats {
  totalLikes: number
  totalComments: number
  activeAuthors: number
  trendingTags: { tag: string; count: number }[]
  hotPosts: { id: string; authorName: string; score: number }[]
}

/** 4文字以上の語とハッシュタグだけを、出現順そのままで取り出す */
function toWordList(text: string): string[] {
  const words: string[] = []
  for (const word of text.toLowerCase().split(/[^a-z#]+/)) {
    if (word.length > 3) words.push(word)
  }
  return words
}

export function computeFeedStats(
  posts: Post[],
  comments: PostComment[],
  likes: Record<string, boolean>,
): FeedStats {
  const startedAt = performance.now()

  let totalLikes = 0
  let totalComments = 0
  const authors = new Set<string>()
  const tagCounts = new Map<string, number>()

  for (const post of posts) {
    totalLikes += post.likeCount + (likes[post.id] ? 1 : 0)
    totalComments += post.commentCount
    authors.add(post.authorId)

    for (const word of post.body.split(' ')) {
      if (word.startsWith('#')) {
        tagCounts.set(word, (tagCounts.get(word) ?? 0) + 1)
      }
    }
  }

  // 投稿ごとに「本文＋その投稿へのコメント」をまとめた語の集合を作る
  const commentsByPost = new Map<string, string[]>()
  for (const comment of comments) {
    const bucket = commentsByPost.get(comment.postId)
    if (bucket) bucket.push(comment.body)
    else commentsByPost.set(comment.postId, [comment.body])
  }

  const wordLists = posts.map((post) =>
    toWordList(`${post.body} ${(commentsByPost.get(post.id) ?? []).join(' ')}`),
  )
  const wordSets = wordLists.map((words) => new Set(words))

  // 総当たりで語の重なりを数え、重なりの合計が大きい投稿を「話題」とみなす。
  // 出現回数ぶん重みを付けたいので、集合ではなく語のリストの方を走査する
  const scores = new Array<number>(posts.length).fill(0)
  for (let i = 0; i < posts.length; i++) {
    for (let j = i + 1; j < posts.length; j++) {
      let overlap = 0
      for (const word of wordLists[i]) {
        if (wordSets[j].has(word)) overlap++
      }
      scores[i] += overlap
      scores[j] += overlap
    }
  }

  const hotPosts = posts
    .map((post, index) => ({ id: post.id, authorName: post.authorName, score: scores[index] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  const trendingTags = [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  const elapsedMs = performance.now() - startedAt
  console.log(`[compute] feedStats ${elapsedMs.toFixed(1)}ms`)

  return {
    totalLikes,
    totalComments,
    activeAuthors: authors.size,
    trendingTags,
    hotPosts,
  }
}
