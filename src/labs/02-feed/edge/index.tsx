import { useState } from 'react'
import EffectDeps from './EffectDeps'

/**
 * Sec.3 の `3-7`「手動メモ化をどう扱うか」の例。
 * Rules of React には違反していない。それでも手動の判断が要る。
 *
 * `HeavyCompute.tsx` / `heavy-data.ts` / `SlowStill.tsx` / `PointlessMemo.tsx` は残置しているが、
 * 旧 `4-3`・`4-4`・`3-8` の廃止により講座では使わないのでタブには出さない。
 */
const DEMOS = [
  { id: 'effect-deps', label: '3-7 EffectDeps', Component: EffectDeps },
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
