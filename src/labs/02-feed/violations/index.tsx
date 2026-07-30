import { useState } from 'react'
import ImpureRender from './01-ImpureRender'
import MutateProps from './02-MutateProps'
import MutateState from './03-MutateState'
import ExternalStore from './04-ExternalStore'
import RefInRender from './05-RefInRender'
import ThirdParty from './06-ThirdParty'
import ImpureRenderFixed from './solutions/01-ImpureRender'
import MutatePropsFixed from './solutions/02-MutateProps'
import MutateStateFixed from './solutions/03-MutateState'
import ExternalStoreFixed from './solutions/04-ExternalStore'
import RefInRenderFixed from './solutions/05-RefInRender'
import ThirdPartyFixed from './solutions/06-ThirdParty'

/**
 * Sec.3 の違反例6種。Compiler を有効にすると、左のタブのコンポーネントには
 * Memo ✨ が付かず、「修正後」に切り替えると付くようになる。
 *
 * 06 だけは事情が違い、修正後も Compiler の対象外（'use no memo'）にしている。
 */
const CASES = [
  { id: '01', label: '01 純粋性', Violation: ImpureRender, Solution: ImpureRenderFixed },
  { id: '02', label: '02 props の書き換え', Violation: MutateProps, Solution: MutatePropsFixed },
  { id: '03', label: '03 state の書き換え', Violation: MutateState, Solution: MutateStateFixed },
  { id: '04', label: '04 外部ストア', Violation: ExternalStore, Solution: ExternalStoreFixed },
  { id: '05', label: '05 ref', Violation: RefInRender, Solution: RefInRenderFixed },
  { id: '06', label: '06 外部ウィジェット', Violation: ThirdParty, Solution: ThirdPartyFixed },
] as const

export default function ViolationsLab() {
  const [current, setCurrent] = useState<string>(CASES[0].id)
  const [showSolution, setShowSolution] = useState(false)

  const active = CASES.find((item) => item.id === current) ?? CASES[0]
  const Active = showSolution ? active.Solution : active.Violation

  return (
    <div>
      <div
        className="toolbar"
        style={{ padding: '12px 20px', background: '#fff', borderBottom: '1px solid var(--border)' }}
      >
        {CASES.map((item) => (
          <button
            key={item.id}
            className="button"
            style={
              item.id === active.id ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : undefined
            }
            onClick={() => setCurrent(item.id)}
          >
            {item.label}
          </button>
        ))}
        <label style={{ marginLeft: 'auto' }}>
          <input
            type="checkbox"
            checked={showSolution}
            onChange={(e) => setShowSolution(e.target.checked)}
          />{' '}
          修正後（<code>solutions/</code>）を表示
        </label>
      </div>

      {/* key を変えて、違反版と修正版のあいだで state を持ち越さないようにする */}
      <Active key={`${active.id}-${showSolution}`} />
    </div>
  )
}
