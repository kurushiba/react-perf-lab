'use no memo'

import { useEffect, useState } from 'react'

/**
 * 1-1 trigger → render → commit
 *
 * render 中のログと commit 後（useEffect）のログを並べて、実行順を目で追う。
 * ※ render 中の console.log は厳密には副作用（＝Sec.3で扱う純粋性の違反）。
 *   ここでは順序を見せるためにあえて置いている。
 */
function Panel({ label }: { label: string }) {
  console.log(`[render] ${label}`)

  useEffect(() => {
    console.log(`[commit] ${label} — DOMに反映された`)
  })

  return <div className="panel">{label}</div>
}

export default function ThreePhases() {
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(true)

  return (
    <div className="page">
      <h1>1-1 trigger → render → commit</h1>
      <p className="muted">
        DevToolsのConsoleを開いた状態で操作すると、render が先に走り commit が後から来ることが読める。
      </p>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <button className="button" onClick={() => setCount((c) => c + 1)}>
          state を更新する（trigger）: {count}
        </button>
        <button className="button" onClick={() => setMounted((m) => !m)}>
          {mounted ? 'アンマウントする' : '初回マウントする'}
        </button>
      </div>

      {mounted && <Panel label={`カウント ${count}`} />}
    </div>
  )
}
