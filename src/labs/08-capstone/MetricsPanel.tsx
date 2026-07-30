import {
  Profiler,
  useEffect,
  useRef,
  useState,
  type ProfilerOnRenderCallback,
  type ReactNode,
} from 'react'

interface MetricsPanelProps {
  hint: string
  children: ReactNode
}

/**
 * 10-2 / 10-8 で読む5指標のうち、DOMノード数と commit 時間を画面に出す。
 * （初期JSサイズは BundlePanel、LCP と INP は VitalsPanel が担当する）
 *
 * 04-inventory/MeasurePanel.tsx と同じで、記録するのはレンダー中ではなく
 * コミット後の onRender の中だけ。レンダー中に ref や DOM を触ると
 * React Compiler が bail out するので、計測パネル自身が教材を壊してしまう。
 *
 * 「操作1回あたりの commit」はリセット後の最大値で出している。
 * このパネル自身の再描画でも onRender は呼ばれるが、そちらは 0ms 近辺なので
 * 最大値を採る限り混ざらない。children は同じ要素のまま渡るので、
 * パネルが再描画されても計測対象のツリーは作り直されない。
 */
export default function MetricsPanel({ hint, children }: MetricsPanelProps) {
  const mountDuration = useRef(0)
  const maxUpdateDuration = useRef(0)
  const updateCount = useRef(0)

  const [mountMs, setMountMs] = useState(0)
  const [updateMs, setUpdateMs] = useState(0)
  const [commits, setCommits] = useState(0)
  const [nodeCount, setNodeCount] = useState(0)

  const handleRender: ProfilerOnRenderCallback = (_id, phase, actualDuration) => {
    if (phase === 'mount') {
      mountDuration.current = actualDuration
      return
    }
    if (actualDuration > maxUpdateDuration.current) maxUpdateDuration.current = actualDuration
    updateCount.current += 1
  }

  useEffect(() => {
    const read = () => {
      setMountMs(mountDuration.current)
      setUpdateMs(maxUpdateDuration.current)
      setCommits(updateCount.current)
      setNodeCount(document.querySelectorAll('*').length)
    }
    read()
    const timer = setInterval(read, 1000)
    return () => clearInterval(timer)
  }, [])

  const reset = () => {
    maxUpdateDuration.current = 0
    updateCount.current = 0
    setUpdateMs(0)
    setCommits(0)
    setNodeCount(document.querySelectorAll('*').length)
  }

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="metrics">
          <div style={{ minWidth: 130 }}>
            <div className="metrics__value">{nodeCount.toLocaleString()}</div>
            <div className="metrics__label">DOMノード数（ページ全体）</div>
          </div>
          <div style={{ minWidth: 130 }}>
            <div className="metrics__value">{mountMs.toFixed(0)} ms</div>
            <div className="metrics__label">初期描画の commit</div>
          </div>
          <div style={{ minWidth: 130 }}>
            <div className="metrics__value">{updateMs.toFixed(0)} ms</div>
            <div className="metrics__label">操作1回あたりの commit（最大）</div>
          </div>
          <div style={{ minWidth: 110 }}>
            <div className="metrics__value">{commits}</div>
            <div className="metrics__label">コミット回数</div>
          </div>
          <button className="button" onClick={reset}>
            リセットして計測
          </button>
          <span className="muted" style={{ flex: 1, minWidth: 240 }}>
            {hint}
          </span>
        </div>
      </div>

      <Profiler id="capstone" onRender={handleRender}>
        {children}
      </Profiler>
    </div>
  )
}
