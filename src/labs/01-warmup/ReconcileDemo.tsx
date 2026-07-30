'use no memo'

import { useState } from 'react'

/**
 * 1-3 Virtual DOM と reconciliation
 *
 * 「同じ位置・同じ型」なら state ごと再利用される。型が変わると破棄して作り直される。
 * 入力途中の値が残るか消えるかで、その違いが見える。
 */
function EditorBox({ tone }: { tone: string }) {
  const [text, setText] = useState('')
  return (
    <div className="panel" style={{ borderLeft: `4px solid ${tone}` }}>
      <h3>入力途中の値を持つ子コンポーネント</h3>
      <input
        type="text"
        value={text}
        placeholder="ここに何か入力してから切り替える"
        onChange={(e) => setText(e.target.value)}
        style={{ width: '100%' }}
      />
    </div>
  )
}

/** 上と見た目は同じだが、React から見ると「別の型」 */
function EditorBoxAlt({ tone }: { tone: string }) {
  const [text, setText] = useState('')
  return (
    <div className="panel" style={{ borderLeft: `4px solid ${tone}` }}>
      <h3>入力途中の値を持つ子コンポーネント（別の型）</h3>
      <input
        type="text"
        value={text}
        placeholder="ここに何か入力してから切り替える"
        onChange={(e) => setText(e.target.value)}
        style={{ width: '100%' }}
      />
    </div>
  )
}

export default function ReconcileDemo() {
  const [swapped, setSwapped] = useState(false)
  const [changeType, setChangeType] = useState(false)

  const tone = swapped ? '#1f845a' : '#0b6bcb'

  return (
    <div className="page">
      <h1>1-3 同じ位置・同じ型なら再利用される</h1>
      <p className="muted">
        入力欄に何か打ってから、下の2つのボタンを押し比べる。
        props だけが変わる場合は値が残り、型が変わる場合は state ごと破棄されて消える。
      </p>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <button className="button" onClick={() => setSwapped((v) => !v)}>
          props だけ変える（型は同じ）
        </button>
        <button className="button" onClick={() => setChangeType((v) => !v)}>
          型を変える：{changeType ? 'EditorBoxAlt' : 'EditorBox'}
        </button>
      </div>

      {changeType ? <EditorBoxAlt tone={tone} /> : <EditorBox tone={tone} />}
    </div>
  )
}
