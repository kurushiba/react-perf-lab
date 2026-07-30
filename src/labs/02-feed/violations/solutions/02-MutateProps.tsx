import { useState } from 'react'

const SOURCE_TAGS = ['#Kitchen', '#Camp', '#Desk', '#Repair']

interface TagListProps {
  items: string[]
}

function TagList({ items }: TagListProps) {
  // 修正：受け取った配列は読むだけにして、表示用の新しい配列を作る。
  //   同じ参照のまま中身を変えると、Reactもそれを渡した親も変化に気付けない。
  const displayItems = items.map((item) => item.toLowerCase())

  return (
    <div className="toolbar">
      {displayItems.map((item) => (
        <span key={item} className="chip" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
          {item}
        </span>
      ))}
    </div>
  )
}

export default function MutatePropsFixed() {
  const [tags] = useState(() => SOURCE_TAGS)
  const [reactions, setReactions] = useState(0)

  return (
    <div className="page">
      <h1>02 修正後：props は読み取り専用として扱う</h1>
      <p className="muted">何回再描画させても、親が持っているタグはそのまま残る。</p>

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
