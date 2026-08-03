'use no memo'

import { useState } from 'react'

interface Member {
  id: string
  name: string
}

const INITIAL_MEMBERS: Member[] = [
  { id: 'm-01', name: 'Aoki' },
  { id: 'm-02', name: 'Sato' },
  { id: 'm-03', name: 'Tanaka' },
  { id: 'm-04', name: 'Ueda' },
  { id: 'm-05', name: 'Mori' },
]

interface MemberRowProps {
  member: Member
}

function MemberRow({ member }: MemberRowProps) {
  // React が持つ state。行が再マウントされると消える
  const [checked, setChecked] = useState(false)

  return (
    <div className="row" style={checked ? { background: 'var(--accent-weak)' } : undefined}>
      <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
      <span className="row__main">
        <span className="row__name">{member.name}</span>
        <span className="row__sub">{member.id}</span>
      </span>
      {/* DOM が持つ state。行が再利用されると、中身だけが別のメンバーの行に付く */}
      <input type="text" placeholder="メモ" style={{ width: 140 }} />
    </div>
  )
}

export default function KeyPlayground() {
  const [members, setMembers] = useState(INITIAL_MEMBERS)
  const [useIndexKey, setUseIndexKey] = useState(true)

  const rotate = () => setMembers((prev) => [...prev.slice(1), prev[0]])
  const reset = () => setMembers(INITIAL_MEMBERS)

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <h1>key で何が変わるか</h1>
      <p className="lead">
        4-9 の「同じ位置・同じ型なら再利用」は、並べ替えで位置そのものが動くリストではそのまま使えない。
        位置の代わりに何を同一性の手がかりにするかを決めるのが key。
      </p>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="toolbar">
          <label className="toolbar" style={{ gap: 4 }}>
            <input
              type="radio"
              checked={useIndexKey}
              onChange={() => setUseIndexKey(true)}
            />
            <code>key={'{index}'}</code>
          </label>
          <label className="toolbar" style={{ gap: 4 }}>
            <input
              type="radio"
              checked={!useIndexKey}
              onChange={() => setUseIndexKey(false)}
            />
            <code>key={'{member.id}'}</code>
          </label>
          <button className="button" onClick={rotate}>
            並べ替える（先頭を末尾へ）
          </button>
          <button className="button" onClick={reset}>
            元に戻す
          </button>
        </div>
        <p className="muted" style={{ margin: '8px 0 0' }}>
          チェックを入れてメモを書いてから並べ替える。index キーだと、チェックとメモが
          「その位置」に残ったまま、別のメンバーの行に付く。
        </p>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        {members.map((member, index) => (
          <MemberRow key={useIndexKey ? index : member.id} member={member} />
        ))}
      </div>
    </div>
  )
}
