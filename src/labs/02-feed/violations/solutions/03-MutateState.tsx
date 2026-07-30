import { useState } from 'react'
import { posts } from '../../../../data/posts'

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

export default function MutateStateFixed() {
  const [table, setTable] = useState(() => ({
    rows: [...INITIAL],
    sortKey: 'likeCount' as SortKey,
  }))
  const [reactions, setReactions] = useState(0)

  // 修正1：state は読むだけ。表示用の並びは計算して求める。
  //   `toSorted` は元の配列を変えず、新しい配列を返す（`[...rows].sort(...)` でも同じ）。
  const sortedRows = table.rows.toSorted((a, b) => b[table.sortKey] - a[table.sortKey])

  // 修正2：更新は必ず新しいオブジェクトを作って渡す。
  //   同じ参照を渡すと React は「変わっていない」と判断して再描画しない。
  const sortBy = (key: SortKey) => {
    setTable((prev) => ({ ...prev, sortKey: key }))
  }

  return (
    <div className="page">
      <h1>03 修正後：新しい値を作って渡す</h1>
      <p className="muted">押した瞬間に並び替わる。遅れて現れることもない。</p>

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
          {sortedRows.map((row) => (
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
