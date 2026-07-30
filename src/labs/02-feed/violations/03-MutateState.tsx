import { useState } from 'react'
import { posts } from '../../../data/posts'

type SortKey = 'likeCount' | 'commentCount'

interface Row {
  id: string
  authorName: string
  likeCount: number
  commentCount: number
}

const INITIAL: Row[] = posts.slice(0, 8).map((post) => ({
  id: post.id,
  authorName: post.authorName,
  likeCount: post.likeCount,
  commentCount: post.commentCount,
}))

export default function MutateState() {
  const [table, setTable] = useState(() => ({
    rows: [...INITIAL],
    sortKey: 'likeCount' as SortKey,
  }))
  const [reactions, setReactions] = useState(0)

  // 表示用に並べ替えておく
  table.rows = table.rows.sort((a, b) => b[table.sortKey] - a[table.sortKey])

  const sortBy = (key: SortKey) => {
    table.sortKey = key
    setTable(table)
  }

  return (
    <div className="page">
      <h1>03 state の中身を破壊的に書き換えている</h1>
      <p className="muted">
        並べ替えボタンを押しても表は変わらない。そのあと「リアクション」を押すと、
        急に並び替わったあとの状態が現れる。
      </p>

      <div className="toolbar" style={{ marginBottom: 12 }}>
        <button className="button" onClick={() => sortBy('likeCount')}>
          いいね順に並べ替える
        </button>
        <button className="button" onClick={() => sortBy('commentCount')}>
          コメント順に並べ替える
        </button>
        <button className="button" onClick={() => setReactions((n) => n + 1)}>
          リアクション: {reactions}
        </button>
        <span className="muted">現在の並び順: {table.sortKey}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>投稿者</th>
            <th>いいね</th>
            <th>コメント</th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.id}>
              <td>{row.authorName}</td>
              <td>{row.likeCount}</td>
              <td>{row.commentCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
