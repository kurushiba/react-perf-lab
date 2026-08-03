/**
 * 02-feed（SNSフィード「Shibagram」）の投稿データ。
 *
 * products.ts と同じ方針で、シード付きの決定的PRNGから毎回まったく同じ列を生成する。
 * 本文が英語なのは、コメント入力欄でIMEを挟まずに打鍵できるようにするため。
 */
import { mulberry32 } from './products'

export interface Post {
  id: string
  authorId: string
  authorName: string
  authorHandle: string
  avatarUrl: string
  body: string
  /** 4件に1件ほど、未最適化の大きなPNGが付く（`2-6` の締めと Sec.7 の題材） */
  imageUrl: string | null
  likeCount: number
  commentCount: number
  createdAt: string
  /** サイドバーの「フォロー中」とタブフィルタで使う */
  isFollowing: boolean
}

export interface PostComment {
  id: string
  postId: string
  authorName: string
  body: string
}

const AUTHOR_NAMES = [
  'Mika Aoyama', 'Ren Fujita', 'Sara Klein', 'Tom Okabe', 'Yui Nakano',
  'Dan Rivera', 'Nao Kishi', 'Emma Barth', 'Kota Serizawa', 'Lena Frost',
  'Hana Oda', 'Jun Maki', 'Ivy Tanaka', 'Sho Kurata', 'Nora Lind',
  'Ken Amano', 'Rina Sato', 'Paul Meier', 'Aya Kubo', 'Leo Hirata',
]

const SENTENCES = [
  'Swapped the old kettle for the stainless one and the morning routine finally makes sense.',
  'Spent the whole weekend rebuilding the hallway shelf with a borrowed clamp and zero regrets.',
  'The insulated bottle kept the coffee warm through a four hour train ride, which feels illegal.',
  'Reorganised the kitchen drawers with the divider set and found three tape measures.',
  'Camp lantern died halfway through the night so the backup light earned its place in the bag.',
  'Desk feels twice as wide after moving the file boxes onto the shelf unit above the monitor.',
  'The folding chair survived a very windy afternoon on the riverbank, so that is a recommendation.',
  'Repaired the drawer runner with a screwdriver set instead of buying a new cabinet.',
  'Been testing the humidifier at night and the plants near the window look noticeably happier.',
  'Grooming brush arrived and the dog tolerated exactly ninety seconds of it before leaving.',
  'Pendant light over the table changed the whole room more than the repaint did.',
  'Packed the cooler box for a two day trip and it was still cold on the way home.',
  'Started keeping a small notebook in the tool bag and stopped losing track of screw sizes.',
  'The non stick pan finally replaced the one that had been flaking since last winter.',
  'Storage bins stack properly with the older sizes, which almost never happens with these.',
  'Air purifier is quiet enough that I forget it is running until the filter light comes on.',
  'Cut the LED strip to length under the shelf and the kitchen counter is usable again at night.',
  'Water jug handle is textured so it does not slip when the whole thing is full.',
]

const TAGS = [
  '#kitchen', '#workshop', '#camp', '#desk', '#storage', '#lighting',
  '#pets', '#coffee', '#weekend', '#repair', '#minimal', '#shibagram',
]

const COMMENT_BODIES = [
  'Been looking at this exact one for weeks, good to hear it holds up.',
  'How is it after a few washes? The last one I had went cloudy.',
  'Same setup here and it survived a whole summer outside.',
  'Where did you get the shelf brackets? Mine keep sagging.',
  'This is the third post today that made me want to reorganise something.',
  'Does it fit the older size or did you have to swap the whole rack?',
  'Mine arrived with a spare gasket, no idea if that is standard.',
  'The grip is the part nobody mentions and it is the part that matters.',
  'Tried the same thing last winter and gave up, you have more patience.',
  'Good call on keeping the backup light in the bag.',
  'Any noise from it at night? That is my only worry.',
  'Photo does not do the colour justice, it is much warmer in person.',
  'Two years in on mine and still nothing loose.',
  'Adding this to the list, thanks for the write up.',
]

function pick<T>(rand: () => number, list: readonly T[]): T {
  return list[Math.floor(rand() * list.length)]
}

export function generatePosts(count = 100, seed = 20260728): Post[] {
  const rand = mulberry32(seed)
  const items: Post[] = []
  const baseTime = Date.UTC(2026, 6, 27, 9)

  for (let i = 0; i < count; i++) {
    const authorIndex = Math.floor(rand() * AUTHOR_NAMES.length)
    const authorName = AUTHOR_NAMES[authorIndex]

    // 本文は 2〜5 文＋ハッシュタグ 1〜3 個。
    // ヘッダーの統計が「実際に走査する量」を持つように、そこそこの長さにしてある
    const sentenceCount = 2 + Math.floor(rand() * 4)
    const sentences = Array.from({ length: sentenceCount }, () => pick(rand, SENTENCES))
    const tagCount = 1 + Math.floor(rand() * 3)
    const tags = Array.from({ length: tagCount }, () => pick(rand, TAGS))

    items.push({
      id: `post-${String(i + 1).padStart(3, '0')}`,
      authorId: `u-${String(authorIndex).padStart(2, '0')}`,
      authorName,
      authorHandle: authorName.toLowerCase().replace(/ /g, '_'),
      avatarUrl: `/images/thumbs/thumb-${String(authorIndex % 20).padStart(2, '0')}.png`,
      body: [...sentences, ...tags].join(' '),
      imageUrl: rand() < 0.25 ? `/images/photos/photo-${i % 4}.png` : null,
      likeCount: Math.floor(rand() * 420),
      // 実際に生成するコメント数と一致させるため、あとで上書きする
      commentCount: 0,
      createdAt: new Date(baseTime - Math.floor(rand() * 72) * 3_600_000).toISOString(),
      isFollowing: rand() < 0.45,
    })
  }

  return items
}

export function generateComments(source: Post[], seed = 20260729): PostComment[] {
  const rand = mulberry32(seed)
  const items: PostComment[] = []

  for (const post of source) {
    const count = 15 + Math.floor(rand() * 41)
    for (let i = 0; i < count; i++) {
      items.push({
        id: `${post.id}-c${String(i + 1).padStart(2, '0')}`,
        postId: post.id,
        authorName: pick(rand, AUTHOR_NAMES),
        body: pick(rand, COMMENT_BODIES),
      })
    }
    post.commentCount = count
  }

  return items
}

/** 02-feed 共通の 100 投稿。モジュール読み込み時に一度だけ生成される */
export const posts: Post[] = generatePosts()

/** 100 投稿にぶら下がる約 2,400 件のコメント */
export const postComments: PostComment[] = generateComments(posts)
