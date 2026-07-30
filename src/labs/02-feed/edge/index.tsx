import { useState } from 'react'
import EffectDeps from './EffectDeps'
import HeavyCompute from './HeavyCompute'
import PointlessMemo from './PointlessMemo'
import SlowStill from './SlowStill'

/**
 * Sec.4「Compilerができないこと・やらない方がいいこと」の4例。
 * どれも Rules of React には違反していない。それでも Compiler では解決しない。
 */
const DEMOS = [
  { id: 'effect-deps', label: '4-1 EffectDeps', Component: EffectDeps },
  { id: 'pointless-memo', label: '4-2 PointlessMemo', Component: PointlessMemo },
  { id: 'heavy-compute', label: '4-3 HeavyCompute', Component: HeavyCompute },
  { id: 'slow-still', label: '4-4 SlowStill', Component: SlowStill },
] as const

export default function EdgeLab() {
  const [current, setCurrent] = useState<string>(DEMOS[0].id)
  const active = DEMOS.find((demo) => demo.id === current) ?? DEMOS[0]
  const Active = active.Component

  return (
    <div>
      <div
        className="toolbar"
        style={{ padding: '12px 20px', background: '#fff', borderBottom: '1px solid var(--border)' }}
      >
        {DEMOS.map((demo) => (
          <button
            key={demo.id}
            className="button"
            style={
              demo.id === active.id ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : undefined
            }
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
