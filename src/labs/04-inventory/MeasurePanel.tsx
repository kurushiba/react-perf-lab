import {
  Profiler,
  useEffect,
  useRef,
  useState,
  type ProfilerOnRenderCallback,
  type ReactNode,
} from 'react'

interface MeasurePanelProps {
  /** Profiler の id。DevTools のログでも同じ名前で出る */
  id: string
  hint: string
  children: ReactNode
}

/**
 * 6-1 / 6-3 で読む3つの数値のうち、ブラウザを開かなくても分かる2つを画面に出す。
 * （残りのFPSは Performance パネルで測る）
 *
 * - DOMノード数：Elements パネルで数えるのと同じ `document.querySelectorAll('*').length`
 * - 初期描画の commit 時間：`<Profiler>` が mount フェーズで報告する actualDuration
 *
 * dev は StrictMode で各コンポーネントが2回描画されるので、commit 時間は
 * 実際よりも大きめに出る。before / after の比較には支障がない。
 */
export default function MeasurePanel({ id, hint, children }: MeasurePanelProps) {
  const mountDuration = useRef(0)
  const [commitMs, setCommitMs] = useState(0)
  const [paintMs, setPaintMs] = useState(0)
  const [nodeCount, setNodeCount] = useState(0)

  const handleRender: ProfilerOnRenderCallback = (_id, phase, actualDuration) => {
    // レンダー中ではなくコミット後に呼ばれるコールバックなので、ref への書き込みは安全
    if (phase === 'mount') mountDuration.current = actualDuration
  }

  useEffect(() => {
    setCommitMs(mountDuration.current)

    // Effect はコミット後・ペイント前に走る。フレームを2つまたいだ時点との差が、
    // 「Reactが作ったDOMをブラウザがレイアウトして描き終えるまで」の時間になる。
    const startedAt = performance.now()
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setPaintMs(performance.now() - startedAt)
        setNodeCount(document.querySelectorAll('*').length)
      }),
    )
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="metrics">
          <div>
            <div className="metrics__value">{nodeCount.toLocaleString()}</div>
            <div className="metrics__label">DOMノード数（ページ全体）</div>
          </div>
          <div>
            <div className="metrics__value">{commitMs.toFixed(0)} ms</div>
            <div className="metrics__label">初期描画の commit 時間（React）</div>
          </div>
          <div>
            <div className="metrics__value">{paintMs.toFixed(0)} ms</div>
            <div className="metrics__label">レイアウト＋ペイント（ブラウザ）</div>
          </div>
          <button
            className="button"
            onClick={() => setNodeCount(document.querySelectorAll('*').length)}
          >
            ノード数を再計測
          </button>
          <span className="muted" style={{ flex: 1, minWidth: 240 }}>
            {hint}
          </span>
        </div>
      </div>

      <Profiler id={id} onRender={handleRender}>
        {children}
      </Profiler>
    </div>
  )
}
