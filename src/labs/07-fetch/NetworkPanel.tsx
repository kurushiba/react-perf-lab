import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Sec.9 で Network パネルを見ながら読む数値を、画面にも残しておく。before / after で共有する。
 *
 * Network パネルは目で見るものなので、before と after の比較を残せない。
 * ここでは PerformanceResourceTiming から `/api/` へのリクエストだけを拾って、
 *
 *   - 本数（N+1 が起きていれば跳ね上がる）
 *   - 待ち時間の合計（直列に積み上がると増える）
 *   - 最初の送信から最後の応答までの経過（＝ウォーターフォールの全長）
 *
 * を出す。3つ目が「ユーザーが待たされた実時間」に一番近い。
 *
 * ⚠️ dev サーバは StrictMode で Effect が2回走るので、本数が倍に出る。
 *    本数を読むときは preview（本番ビルド）側で測る。
 */

interface ApiStats {
  count: number
  sumMs: number
  spanMs: number
  slowest: number
}

const EMPTY: ApiStats = { count: 0, sumMs: 0, spanMs: 0, slowest: 0 }

function readApiStats(since: number): ApiStats {
  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  const api = entries.filter((entry) => entry.name.includes('/api/') && entry.startTime >= since)
  if (api.length === 0) return EMPTY

  let sumMs = 0
  let slowest = 0
  let firstStart = Infinity
  let lastEnd = 0

  for (const entry of api) {
    sumMs += entry.duration
    if (entry.duration > slowest) slowest = entry.duration
    if (entry.startTime < firstStart) firstStart = entry.startTime
    if (entry.responseEnd > lastEnd) lastEnd = entry.responseEnd
  }

  return { count: api.length, sumMs, spanMs: lastEnd - firstStart, slowest }
}

interface NetworkPanelProps {
  hint: string
}

export default function NetworkPanel({ hint }: NetworkPanelProps) {
  const since = useRef(0)
  const [stats, setStats] = useState<ApiStats>(EMPTY)

  const refresh = useCallback(() => setStats(readApiStats(since.current)), [])

  useEffect(() => {
    // レンダー中に performance を触らない（規約11）
    const timer = setInterval(refresh, 500)
    return () => clearInterval(timer)
  }, [refresh])

  const handleReset = () => {
    since.current = performance.now()
    setStats(EMPTY)
  }

  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <div className="metrics">
        <div>
          <div className="metrics__value">{stats.count}</div>
          <div className="metrics__label">/api/ へのリクエスト本数</div>
        </div>
        <div>
          <div className="metrics__value">{stats.spanMs.toFixed(0)} ms</div>
          <div className="metrics__label">最初の送信〜最後の応答（＝待たされた時間）</div>
        </div>
        <div>
          <div className="metrics__value">{stats.sumMs.toFixed(0)} ms</div>
          <div className="metrics__label">待ち時間の合計</div>
        </div>
        <div>
          <div className="metrics__value">{stats.slowest.toFixed(0)} ms</div>
          <div className="metrics__label">いちばん遅い1本</div>
        </div>
        <button className="button" onClick={handleReset}>
          リセットして計測
        </button>
      </div>

      <p className="muted" style={{ margin: '8px 0 0' }}>
        {hint}
      </p>
      <p className="muted" style={{ margin: '4px 0 0', fontSize: 12 }}>
        dev サーバは StrictMode で Effect が2回走るため本数が倍に出る。本数を比べるときは{' '}
        <code>npm run preview</code> 側で読む。
      </p>
    </div>
  )
}
