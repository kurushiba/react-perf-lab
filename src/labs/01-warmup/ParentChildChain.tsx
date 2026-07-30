'use no memo'

import { useState } from 'react'

/**
 * 1-4 再レンダリングの3条件と、親の再描画が連鎖する理由
 *
 * 子〜孫には固定の props しか渡していない。それでも親が再描画されれば全段が再描画される。
 * Highlight Updates を有効にしてカウンタを押すと、4階層すべてが光る。
 */
function GrandChild({ label }: { label: string }) {
  console.log('[render] GrandChild')
  return <div className="panel">孫：{label}</div>
}

function ChildB({ label }: { label: string }) {
  console.log('[render] ChildB')
  return (
    <div className="panel" style={{ marginBottom: 8 }}>
      子B：{label}
      <div style={{ marginTop: 8 }}>
        <GrandChild label={label} />
      </div>
    </div>
  )
}

function ChildA({ label }: { label: string }) {
  console.log('[render] ChildA')
  return (
    <div className="panel" style={{ marginBottom: 8 }}>
      子A：{label}
      <div style={{ marginTop: 8 }}>
        <ChildB label={label} />
      </div>
    </div>
  )
}

export default function ParentChildChain() {
  const [count, setCount] = useState(0)

  console.log('[render] Parent')

  return (
    <div className="page">
      <h1>1-4 親の再描画は子に連鎖する</h1>
      <p className="muted">
        子・孫に渡している props は固定文字列。props が変わっていなくても、親が再描画されれば
        下の階層はすべて再描画される。
      </p>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <button className="button" onClick={() => setCount((c) => c + 1)}>
          親のカウンタを進める: {count}
        </button>
      </div>

      <ChildA label="固定のprops（変化しない）" />
    </div>
  )
}
