import { useState } from 'react'

const SOURCE_TAGS = ['#Kitchen', '#Camp', '#Desk', '#Repair']

interface TagListProps {
  items: string[]
}

function TagList({ items }: TagListProps) {
  // 表示用にタグの表記をそろえる
  for (let i = 0; i < items.length; i++) {
    items[i] = items[i].toLowerCase()
  }

  return (
    <div className="toolbar">
      {items.map((item) => (
        <span key={item} className="chip" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
          {item}
        </span>
      ))}
    </div>
  )
}

export default function MutateProps() {
  const [tags] = useState(() => SOURCE_TAGS)
  const [reactions, setReactions] = useState(0)

  return (
    <div className="page">
      <h1>02 props で受け取った配列を書き換えている</h1>
      <p className="muted">
        投稿に付いたタグの一覧。「再描画させる」を1回押すと、親が持っている元のタグまで表記が変わる。
      </p>

      <div className="toolbar" style={{ marginBottom: 12 }}>
        <button className="button" onClick={() => setReactions((n) => n + 1)}>
          再描画させる: {reactions}
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <h3>親が持っているタグ</h3>
        <p className="muted" style={{ margin: 0 }}>
          {tags.join(' / ')}
        </p>
      </div>

      <div className="panel">
        <h3>タグ表示（子コンポーネント）</h3>
        <TagList items={tags} />
      </div>
    </div>
  )
}
