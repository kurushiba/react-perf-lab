'use no memo'

import { useState } from 'react'
import ThreePhases from './ThreePhases'
import ParentChildChain from './ParentChildChain'
import ReconcileDemo from './ReconcileDemo'
import MemoDemo from './MemoDemo'
import UseMemoDemo from './UseMemoDemo'
import UseCallbackDemo from './UseCallbackDemo'

/**
 * Sec.1 のデモ置き場。
 *
 * このラボの全ファイルには 'use no memo' を付けてある。
 * Sec.2-4 で React Compiler を有効化したあとも、手動メモ化のデモが
 * 「Compiler が自動でやってしまうので違いが見えない」状態にならないようにするため。
 */
const DEMOS = [
  { id: 'three-phases', label: '1-1 3フェーズ', Component: ThreePhases },
  { id: 'chain', label: '1-4 再描画の連鎖', Component: ParentChildChain },
  { id: 'reconcile', label: '1-3 reconciliation', Component: ReconcileDemo },
  { id: 'memo', label: '1-6 memo', Component: MemoDemo },
  { id: 'use-memo', label: '1-6 useMemo', Component: UseMemoDemo },
  { id: 'use-callback', label: '1-6 useCallback', Component: UseCallbackDemo },
] as const

export default function WarmupLab() {
  const [current, setCurrent] = useState<string>(DEMOS[0].id)
  const active = DEMOS.find((demo) => demo.id === current) ?? DEMOS[0]
  const Active = active.Component

  return (
    <div>
      <div className="toolbar" style={{ padding: '12px 20px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        {DEMOS.map((demo) => (
          <button
            key={demo.id}
            className="button"
            style={demo.id === active.id ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : undefined}
            onClick={() => setCurrent(demo.id)}
          >
            {demo.label}
          </button>
        ))}
      </div>
      <Active />
    </div>
  )
}
