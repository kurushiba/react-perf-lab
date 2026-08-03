import { useState } from 'react'
import EffectDeps from './EffectDeps'
import PointlessMemo from './PointlessMemo'

/**
 * Sec.3 の `3-7`・`3-8`「手動メモ化をどう扱うか」の2例。
 * どちらも Rules of React には違反していない。それでも手動の判断が要る。
 *
 * `HeavyCompute.tsx` / `heavy-data.ts` / `SlowStill.tsx` は残置しているが、
 * 旧 `4-3`・`4-4` の廃止により講座では使わないのでタブには出さない。
 */
const DEMOS = [
  { id: 'effect-deps', label: '3-7 EffectDeps', Component: EffectDeps },
  { id: 'pointless-memo', label: '3-8 PointlessMemo', Component: PointlessMemo },
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
