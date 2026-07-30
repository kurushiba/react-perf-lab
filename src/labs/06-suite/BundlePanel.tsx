import { useCallback, useEffect, useState } from 'react'

/**
 * Sec.8 で読む数値を画面に出す。before / after で共有する。
 *
 * このリポジトリはラボごとにルート単位で遅延読み込みしているので、
 * 「アプリの初期バンドル」＝ 06-suite の重さ、にはならない。
 * そこで Sec.8 の「初期JSサイズ」は
 *
 *     このラボの画面を表示するのに実際に転送されたJSの合計（gzip後）
 *     ＝ entry チャンク ＋ 06-suite のチャンク ＋ 共有チャンク
 *
 * と定義する。PerformanceResourceTiming の encodedBodySize は
 * 「圧縮された状態で何バイト転送されたか」なので、この定義をそのまま測れる。
 * 同一オリジンなので Timing-Allow-Origin なしで読める。
 *
 * ⚠️ dev サーバは各モジュールを未圧縮・未minifyのまま配るので、値が実際の数倍に出る。
 *    Sec.8 の数値は必ず `npm run build && npm run preview` の側で読む。
 */

interface JsStats {
  count: number
  /** 転送量（＝圧縮後）。これが「初期JSサイズ」 */
  encoded: number
  /** 展開後のサイズ */
  decoded: number
  largestName: string
  largestEncoded: number
}

const EMPTY: JsStats = {
  count: 0,
  encoded: 0,
  decoded: 0,
  largestName: '—',
  largestEncoded: 0,
}

function readJsStats(): JsStats {
  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  const scripts = entries.filter(
    (entry) => entry.initiatorType === 'script' || /\.m?js(\?|$)/.test(entry.name),
  )

  let encoded = 0
  let decoded = 0
  let largestName = '—'
  let largestEncoded = 0

  for (const entry of scripts) {
    encoded += entry.encodedBodySize
    decoded += entry.decodedBodySize
    if (entry.encodedBodySize > largestEncoded) {
      largestEncoded = entry.encodedBodySize
      largestName = entry.name.slice(entry.name.lastIndexOf('/') + 1)
    }
  }

  return { count: scripts.length, encoded, decoded, largestName, largestEncoded }
}

const formatKb = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`

interface BundlePanelProps {
  hint: string
}

export default function BundlePanel({ hint }: BundlePanelProps) {
  const [stats, setStats] = useState<JsStats>(EMPTY)

  const refresh = useCallback(() => setStats(readJsStats()), [])

  useEffect(() => {
    // レンダー中に performance を触らない（規約11）。読むのは常にコミット後
    refresh()
    // 遅延読み込みされたチャンクは後から届くので、しばらく追いかける
    const timer = setInterval(refresh, 1000)
    const stop = setTimeout(() => clearInterval(timer), 10000)
    return () => {
      clearInterval(timer)
      clearTimeout(stop)
    }
  }, [refresh])

  // 計測パネル自身がCLSを生むと、CLSの計測にならない。
  // 値が入れ替わっても寸法が動かないよう、各枠の幅と行の高さを先に決めておく
  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <div className="metrics">
        <div style={{ minWidth: 230 }}>
          <div className="metrics__value">{formatKb(stats.encoded)}</div>
          <div className="metrics__label">転送されたJSの合計（＝初期JSサイズ）</div>
        </div>
        <div style={{ minWidth: 110 }}>
          <div className="metrics__value">{formatKb(stats.decoded)}</div>
          <div className="metrics__label">展開後の合計</div>
        </div>
        <div style={{ minWidth: 100 }}>
          <div className="metrics__value">{stats.count}</div>
          <div className="metrics__label">JSファイル数</div>
        </div>
        <div style={{ minWidth: 130 }}>
          <div className="metrics__value">{formatKb(stats.largestEncoded)}</div>
          <div className="metrics__label">最大のチャンク</div>
        </div>
        <button className="button" onClick={refresh}>
          再計測
        </button>
      </div>

      <p className="muted" style={{ margin: '8px 0 0', minHeight: 22 }}>
        {hint}
      </p>
      <p
        className="muted"
        style={{
          margin: '4px 0 0',
          fontSize: 12,
          height: 20,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        <code>{stats.largestName}</code> が最大。dev
        サーバは未圧縮・未minifyのまま配るため値が大きく出る。Sec.8 の数値は{' '}
        <code>npm run build</code> → <code>npm run preview</code> 側で読む。
      </p>
    </div>
  )
}
