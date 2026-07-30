import { Profiler, useCallback, useMemo, useState } from 'react'

const CELL_COUNT = 1000
const VALUES = Array.from({ length: CELL_COUNT }, (_, index) => index)

/** メモ化を重ねた版。1セルあたり useMemo 16個＋useCallback 2個 */
function MemoCell({ value, offset }: { value: number; offset: number }) {
  const a1 = useMemo(() => (value * 31 + offset) % 97, [value, offset])
  const a2 = useMemo(() => (a1 + 13) % 89, [a1])
  const a3 = useMemo(() => (a2 * 7) % 83, [a2])
  const a4 = useMemo(() => (a3 + value) % 79, [a3, value])
  const a5 = useMemo(() => (a4 * 3) % 73, [a4])
  const a6 = useMemo(() => (a5 + 5) % 71, [a5])
  const a7 = useMemo(() => (a6 * 11) % 67, [a6])
  const a8 = useMemo(() => (a7 + offset) % 61, [a7, offset])
  const a9 = useMemo(() => (a8 * 17) % 59, [a8])
  const a10 = useMemo(() => (a9 + 23) % 53, [a9])
  const a11 = useMemo(() => (a10 * 19) % 47, [a10])
  const a12 = useMemo(() => (a11 + 29) % 43, [a11])
  const a13 = useMemo(() => (a12 * 13) % 41, [a12])
  const a14 = useMemo(() => (a13 + 37) % 37 || 1, [a13])
  const label = useMemo(() => `${a1}:${a14}`, [a1, a14])
  const tone = useMemo(() => (a14 % 2 === 0 ? 'var(--border)' : 'var(--accent-weak)'), [a14])
  const handleClick = useCallback(() => console.log(label), [label])
  const handleEnter = useCallback(() => undefined, [])

  return (
    <span
      className="chip"
      style={{ borderColor: tone, color: 'var(--text)' }}
      onClick={handleClick}
      onMouseEnter={handleEnter}
    >
      {label}
    </span>
  )
}

/** まったく同じ計算をそのまま書いた版 */
function PlainCell({ value, offset }: { value: number; offset: number }) {
  const a1 = (value * 31 + offset) % 97
  const a2 = (a1 + 13) % 89
  const a3 = (a2 * 7) % 83
  const a4 = (a3 + value) % 79
  const a5 = (a4 * 3) % 73
  const a6 = (a5 + 5) % 71
  const a7 = (a6 * 11) % 67
  const a8 = (a7 + offset) % 61
  const a9 = (a8 * 17) % 59
  const a10 = (a9 + 23) % 53
  const a11 = (a10 * 19) % 47
  const a12 = (a11 + 29) % 43
  const a13 = (a12 * 13) % 41
  const a14 = (a13 + 37) % 37 || 1
  const label = `${a1}:${a14}`
  const tone = a14 % 2 === 0 ? 'var(--border)' : 'var(--accent-weak)'

  return (
    <span
      className="chip"
      style={{ borderColor: tone, color: 'var(--text)' }}
      onClick={() => console.log(label)}
      onMouseEnter={() => undefined}
    >
      {label}
    </span>
  )
}

/**
 * 4-2：メモ化が無意味／逆効果になるケース。
 *
 * 計算はどれも剰余1回ぶん。メモ化そのもののコスト（依存の比較と前回値の保持）が
 * 計算より高くつくので、メモ化した方が遅くなる。
 * Console の [commit] ログで、両者の actualDuration を見比べる。
 */
export default function PointlessMemo() {
  const [memoized, setMemoized] = useState(false)
  const [offset, setOffset] = useState(0)

  const Cell = memoized ? MemoCell : PlainCell

  return (
    <div className="page">
      <h1>PointlessMemo：軽い計算にメモ化を重ねる</h1>
      <p className="muted">
        {CELL_COUNT} セル × （useMemo 16個 ＋ useCallback 2個）。
        「再描画する」を数回押して、Console の commit 時間を両モードで比べる。
      </p>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <label>
          <input
            type="checkbox"
            checked={memoized}
            onChange={(e) => setMemoized(e.target.checked)}
          />{' '}
          メモ化する（MemoCell）
        </label>
        <button className="button" onClick={() => setOffset((n) => n + 1)}>
          再描画する: {offset}
        </button>
      </div>

      <Profiler
        id="cells"
        onRender={(id, phase, actualDuration) => {
          console.log(
            `[commit] ${id} memo=${memoized ? 'on' : 'off'} ${phase} ${actualDuration.toFixed(1)}ms`,
          )
        }}
      >
        <div className="panel" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {VALUES.map((value) => (
            <Cell key={value} value={value} offset={offset} />
          ))}
        </div>
      </Profiler>
    </div>
  )
}
